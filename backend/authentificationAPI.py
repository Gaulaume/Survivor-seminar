import hashlib
from fastapi import Depends, HTTPException, Security
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from jose import JWTError
import os
import time
from enum import Enum


SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')

ACCESS_TOKEN_EXPIRE_MINUTES = 1440

username = os.getenv('MONGO_INITDB_ROOT_USERNAME')
password = os.getenv('MONGO_INITDB_ROOT_PASSWORD')

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
MONGO_DB = os.getenv("MONGO_DB", "soul-connection")
client = MongoClient(MONGO_URL)

db = client[MONGO_DB]

security = HTTPBearer()

class Role(Enum):
    Coach = 1
    Manager = 2

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def insertDataRegister(email, pwd, id):
    collection = db.auth
    data = {'email': email, 'pwd': pwd, 'id': 10}
    data['pwd'] = hash_password(data['pwd'])

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"email": email, "id": id}, expires_delta=access_token_expires)

    data['token'] = access_token
    collection.insert_one(data)
    return

class TokenData(BaseModel):
    email: str
    id: int
    role: int

def insertDataLogin(email, pwd, id, work):
    collection = db.auth
    user = collection.find_one({"email": email})

    hashed_pwd = hash_password(pwd)
    #if hashed_pwd != user['pwd']:
    #    raise HTTPException(status_code=400, detail="Email or password incorrect")

    role = Role.Coach if work == "Coach" else Role.Manager

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"email": email, "id": id, "role": role.value}, expires_delta=access_token_expires)
    return {"access_token": access_token}

# Extraction et vérification des données du token Bearer
def get_current_user_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> TokenData:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        role = payload.get("role")
        id = payload.get("id")

        if role is None or email is None or id is None:
            raise HTTPException(status_code=403, detail="Missing fields in token")
        
        return TokenData(email=email, role=role, id=id)
    except JWTError:
        raise credentials_exception

def get_role_from_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    payload = decode_jwt_token(token)
    role = payload.get("role")
    if role is None:
        raise HTTPException(status_code=403, detail="Role not found in token")
    return role


def getConnectionDate():
    date_now = datetime.now()
    year = date_now.year
    month = date_now.month
    day = date_now.day
    hour = date_now.hour
    minute = date_now.minute
    second = date_now.second
    date = datetime(year, month, day, hour, minute, second)
    timestamp = int(time.mktime(date.timetuple()))
    timestamp = str(timestamp)
    return timestamp

def last_connection_employees(id):
    last_connection = None
    last_connection = getConnectionDate()
    db.employees.update_one(
            {'id': id},
            {'$set': {'last_connection': last_connection}}
        )
    return

def decode_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
