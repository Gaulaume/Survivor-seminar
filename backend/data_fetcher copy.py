import aiohttp
import asyncio
from pymongo import MongoClient
import os
import time

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
    if data:
        collection = db[endpoint]
        collection.insert_many(data)

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
        await asyncio.gather(*tasks)

        await fetch_and_send_data(session, base_url, 'tips', headers, db)

        end = time.time()
        print(f"Time elapsed: {end - start}")

        client.close()

if __name__ == '__main__':
    asyncio.run(main())
