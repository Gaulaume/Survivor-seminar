import hashlib
from fastapi import Depends, HTTPException, Security
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi.security import APIKeyHeader, HTTPBearer, OAuth2PasswordBearer
from jose import JWTError
import os
import time

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')

ACCESS_TOKEN_EXPIRE_MINUTES = 1440


username = os.getenv('MONGO_INITDB_ROOT_USERNAME')
password = os.getenv('MONGO_INITDB_ROOT_PASSWORD')

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
MONGO_DB = os.getenv("MONGO_DB", "soul-connection")
client = MongoClient(MONGO_URL)

db = client[MONGO_DB]

api_key_header = APIKeyHeader(name="AuthentificationHeader")

security = HTTPBearer()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    TokenData = data.copy
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



def insertDataRegister(email, pwd, id):
    collection = db.auth
    data = {'email': email, 'pwd': pwd, 'id': 10}
    data['pwd'] = hash_password(data['pwd'])
    print("HAGRID")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    TokenData.email = {"email": email}
    TokenData.id = {"id": id}
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
    data = {'email': email, 'pwd': pwd, 'id': id}
    user = collection.find_one({"email": email})
    role = 0 # 0 = Nothing, 1 = Coach, 2 = Manager
    hashed_pwd = hash_password(pwd)
    # if hashed_pwd != user['password']:
    #     raise HTTPException(status_code=400, detail="Email or password incorrect")
    if (work == "Coach"):
        role = 1
    else:
        role = 2
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    TokenData.email = {"email": email}
    TokenData.id = {"id": id}
    TokenData.role = {"role": role}
    access_token = create_access_token(data={"email": email, "id": id, "role": role}, expires_delta=access_token_expires)

    return {"access_token": access_token}




def get_current_user_token(token: str = Security(api_key_header)) -> TokenData:
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
        if role is None:
            raise HTTPException(status_code=403, detail="Role not found in token")
        if email is None:
            raise HTTPException(status_code=403, detail="Email not found in token")
        if id is None:
            raise HTTPException(status_code=403, detail="id not found in token")
        token_data = TokenData(email=email, role=role, id=id)
    except JWTError:
        raise credentials_exception
    return token_data


def getConnectionDate():
    date_actuelle = datetime.now()
    annee = date_actuelle.year
    mois = date_actuelle.month
    jour = date_actuelle.day
    date = datetime(annee, mois, jour)
    timestamp = int(time.mktime(date.timetuple()))
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


def get_role_from_token(token: str):
    payload = decode_jwt_token(token)
    role = payload.get("role")  # Récupérer le champ "role"
    if role is None:
        raise HTTPException(status_code=403, detail="Role not found in token")
    return role