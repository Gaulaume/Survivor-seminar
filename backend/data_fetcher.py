import requests
import os

from pymongo import MongoClient

def get_headers(group_token=None, access_token=None):
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    if group_token:
        headers['X-Group-Authorization'] = group_token
    
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'

    return headers

def login(email, password, group_token):
    url = 'https://soul-connection.fr/api/employees/login'
    headers = get_headers(group_token=group_token)
    data = {
        'email': email,
        'password': password
    }

    response = requests.post(url, json=data, headers=headers)    
    return response

def get_access_token(email, password, group_token):
    response = login(email, password, group_token).json()
    access_token = response['access_token']
    return access_token

def get_endpoint(base_url, endpoint, access_token, group_token):
    url = f"{base_url}/{endpoint}"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Group-Authorization': group_token,
        'Accept': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    
    # if response.status_code is not 200:
    #     return response.status_code
    # if response.status_code l

    # Print the status code and response text for debugging
    if response.status_code == 200:
        try:
            return response.json()
        except requests.exceptions.JSONDecodeError:
            return response.content
    else:
        return response

if __name__ == "__main__":
    username_auth= os.getenv('MONGO_INITDB_ROOT_USERNAME')
    password_auth = os.getenv('MONGO_INITDB_ROOT_PASSWORD')
    email = 'jeanne.martin@soul-connection.fr'
    password = 'naouLeA82oeirn'
    group_token = '16cc9a4d48f8bcd638a0af1543796698'
    access_token = get_access_token(email, password, group_token)

    baseurl = "https://soul-connection.fr/api"

    connection_string = f"mongodb://{username_auth}:{password_auth}@localhost:27017/"

    client = MongoClient(connection_string)
    client.drop_database('soul-connection')
    db = client['soul-connection']


    endpoints = [
        "employees",
        "customers",
        "encounters",
        "tips",
        "events"
    ]

    for endpoint in endpoints:
        response = get_endpoint(baseurl, endpoint, access_token, group_token)
        collection = db[endpoint]
        insert_result = collection.insert_many(response)

# now we specificaly send clothes
# baseurl_clothes = "https://soul-connection.fr/api/clothes"
# collection = db["clothes"]

# i = 2940
# while True:
#     i += 1
#     endpoint = f'{i}/image'
#     response = get_endpoint(baseurl_clothes, endpoint, access_token, group_token)
#     # response
#     if response:
#         collection.insert_one({"clothes_id": i, "image_data": response})
#         print(f"Image {i} inserted")
#     else:
#         print(f"No more images found at clothes/{i}/image")
#         break
# client.close()

