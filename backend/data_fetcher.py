import aiohttp
import asyncio
from pymongo import MongoClient
import time
import traceback

async def get_headers(group_token=None, access_token=None):
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    if group_token:
        headers['X-Group-Authorization'] = group_token
    
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'

    return headers

async def login(session, email, password, group_token):
    url = 'https://soul-connection.fr/api/employees/login'
    headers = await get_headers(group_token=group_token)
    data = {
        'email': email,
        'password': password
    }
    async with session.post(url, json=data, headers=headers) as response:
        return await response.json()

async def get_access_token(session, email, password, group_token):
    response = await login(session, email, password, group_token)
    return response['access_token']

async def fetch(session, url, headers):
    async with session.get(url, headers=headers) as response:
        return await response.json()
    
async def fetch_image(session, url, headers):
    async with session.get(url, headers=headers) as response:
        if response.status == 200:
            return await response.read()
        else:
            return None

async def get_list_of_ids(session, base_url, endpoint, headers):
    url = f"{base_url}/{endpoint}"
    response = await fetch(session, url, headers)
    return [item['id'] for item in response]

async def fetch_using_id_and_send_data_category(session, base_url, endpoint, headers, db):
    ids = await get_list_of_ids(session, base_url, endpoint, headers)
    print(f"Fetching data for {len(ids)} {endpoint}...")

    tasks = [fetch(session, f"{base_url}/{endpoint}/{emp_id}", headers) for emp_id in ids]
    responses = await asyncio.gather(*tasks)

    data = [response for response in responses if response]
    if data:
        collection = db[endpoint]
        collection.insert_many(data)

async def fetch_and_send_data(session, base_url, endpoint, headers, db):
    url = f"{base_url}/{endpoint}"
    response = await fetch(session, url, headers)
    data = response
    print(f"Fetching data for {len(data)} {endpoint}...")
    if data:
        collection = db[endpoint]
        collection.insert_many(data)

async def fetch_images_batch(session, base_url, start_index, batch_size, headers):
    urls = [f"{base_url}/{i}/image" for i in range(start_index, start_index + batch_size)]
    tasks = [fetch_image(session, url, headers) for url in urls]
    responses = await asyncio.gather(*tasks)
    return responses

async def fetch_images_without_id(session, base_url, headers, db, batch_size=100):
    print(f"Fetching images for {base_url}...")

    i = 1
    data_list = []

    while True:
        print(f"Fetching images from {i} to {i + batch_size - 1}...")
        responses = await fetch_images_batch(session, base_url, i, batch_size, headers)
        valid_responses = [response for response in responses if response]

        if not valid_responses:
            print(f"No more images found after index {i}. Stopping fetch.")
            break

        data_list.extend({"id": idx + i, "image": response} for idx, response in enumerate(valid_responses))
        i += batch_size

        if len(data_list) >= 500:
            collection = db["clothes"]
            collection.insert_many(data_list)
            data_list = []

    if data_list:
        collection = db["clothes"]
        collection.insert_many(data_list)
        print(f"Inserted {len(data_list)} remaining records into 'clothes' collection.")


async def fetch_customers_clothes(session, base_url, headers, db):
    ids = await get_list_of_ids(session, base_url, 'customers', headers)
    print(f"Fetching clothes data for {len(ids)} customers...")

    tasks = [fetch(session, f"{base_url}/customers/{customer_id}/clothes", headers) for customer_id in ids]
    responses = await asyncio.gather(*tasks)

    for customer_id, response in zip(ids, responses):
        if response:
            clothes_ids = [item['id'] for item in response]

            db['customers'].update_one(
                {'id': customer_id},
                {'$set': {'clothes_ids': clothes_ids}}
            )

    clothes = db['clothes']

    list_clothes_types = []
    for response in responses:
        for item in response:
            list_clothes_types.append({'id': item['id'], 'type': item['type']})
            
    for cloth in list_clothes_types:
        clothes.update_one(
            {'id': cloth['id']},
            {'$set': {'type': cloth['type']}}
        )


async def main():
    email = 'jeanne.martin@soul-connection.fr'
    password = 'naouLeA82oeirn'
    group_token = '16cc9a4d48f8bcd638a0af1543796698'
    
    async with aiohttp.ClientSession() as session:
        access_token = await get_access_token(session, email, password, group_token)
        headers = await get_headers(group_token=group_token, access_token=access_token)
        
        client = MongoClient('mongodb://admin:mdp@localhost:27017/')
        client.drop_database('soul-connection')
        db = client['soul-connection']

        base_url = 'https://soul-connection.fr/api'

        endpoints = [
            "employees",
            "customers",
            "encounters",
            "events"
        ]

        start = time.time()
        tasks = [fetch_using_id_and_send_data_category(session, base_url, endpoint, headers, db) for endpoint in endpoints]
        tasks.append(fetch_images_without_id(session, "https://soul-connection.fr/api/clothes", headers, db, batch_size=100))
        tasks.append(fetch_and_send_data(session, base_url, 'tips', headers, db))
        await asyncio.gather(*tasks)
        await fetch_customers_clothes(session, base_url, headers, db)
        
        end = time.time()
        print(f"Time elapsed: {end - start}")
        client.close()

if __name__ == '__main__':
    asyncio.run(main())


# TODO : add type of image in clothes
# TODO : Add customers image in customers
# TODO : Add payment history in customers (add a list)
# TODO : Add employee image in employees

