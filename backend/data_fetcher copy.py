import requests
from pymongo import MongoClient
import 

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
    return requests.post(url, json=data, headers=headers)

def get_access_token(email, password, group_token):
    response = login(email, password, group_token).json()
    access_token = response['access_token']
    return access_token

def get_response_endpoint(base_url, endpoint, headers):
    url = f"{base_url}/{endpoint}"
    return requests.get(url, headers=headers)

email = 'jeanne.martin@soul-connection.fr'
password = 'naouLeA82oeirn'
group_token = '16cc9a4d48f8bcd638a0af1543796698'
access_token = get_access_token(email, password, group_token)

headers = get_headers(group_token=group_token, access_token=access_token)

username_auth= os.getenv('MONGO_INITDB_ROOT_USERNAME')
password_auth = os.getenv('MONGO_INITDB_ROOT_PASSWORD')
email = 'jeanne.martin@soul-connection.fr'
password = 'naouLeA82oeirn'
group_token = '16cc9a4d48f8bcd638a0af1543796698'