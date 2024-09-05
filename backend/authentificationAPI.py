import hashlib
from fastapi import HTTPException
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt

SECRET_KEY = "your_secret_key"  # À personnaliser et à garder sécurisé
ALGORITHM = "HS256"  # Algorithme pour JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Durée de validité du token (en minutes)

client = MongoClient('mongodb://AugustinAdmin:KoalaAdmin@mongodb:27017/')
client.drop_database('soul-connection')
db = client['soul-connection']


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
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
    access_token = create_access_token(data={"email": email, "id": id}, expires_delta=access_token_expires)
    data['token'] = access_token
    collection.insert_one(data)
    return


def insertDataLogin(email, pwd, id):
    collection = db.auth
    data = {'email': email, 'pwd': pwd, 'id': id}
    user = collection.find_one({"email": email})

    hashed_pwd = hash_password(pwd)
    # if hashed_pwd != user['password']:
    #     raise HTTPException(status_code=400, detail="Email or password incorrect")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"email": email, "id": id}, expires_delta=access_token_expires)
    
    return {"access_token": access_token}
