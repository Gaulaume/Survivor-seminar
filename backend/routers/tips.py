from fastapi import APIRouter, Security, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from authentificationAPI import Role, get_current_user_token
from pymongo import MongoClient
import os

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

class api_tips(BaseModel):
    id: int
    title: str
    tip: str

class api_tips_update(BaseModel):
    title: str
    tip: str


@router.get("/", response_model=List[api_tips], tags=["tips"])
def get_tips(token: str = Security(get_current_user_token)):
    try:
        collection_tips = database.tips
        tips = list(collection_tips.find({}, {"_id": 0}))
        return tips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{tip_id}", response_model=api_tips, tags=["tips"])
def get_tip(tip_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_tips = database.tips
        tip = collection_tips.find_one({"id": tip_id}, {"_id": 0})
        return tip
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=api_tips, tags=["tips"])
def post_tip(tip: api_tips_update, token: str = Security(get_current_user_token)):
    try:
        collection_tips = database.tips
        tip_id = collection_tips.count_documents({}) + 1
        new_tip = api_tips(id=tip_id, **tip.dict())
        collection_tips.insert_one(new_tip.dict())
        return new_tip
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{tip_id}", response_model=api_tips_update, tags=["tips"])
def put_tip(tip_id: int, tip: api_tips_update, token: str = Security(get_current_user_token)):
    try:
        collection_tips = database.tips
        tip.id = tip_id
        collection_tips.replace_one({"id": tip_id}, tip.dict())
        return tip
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{tip_id}", response_model=api_tips, tags=["tips"])
def delete_tip(tip_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_tips = database.tips
        tip = collection_tips.find_one({"id": tip_id}, {"_id": 0})
        collection_tips.delete_one({"id": tip_id})
        return tip
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

