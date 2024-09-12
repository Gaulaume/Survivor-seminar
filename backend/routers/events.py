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

class api_events(BaseModel):
    id: int
    name: str
    date: str
    max_participants: int

class api_event_id(BaseModel):
    id: int
    name: str
    date: str
    max_participants: int
    location_x: str
    location_y: str
    type: str
    employee_id: int
    location_name: str

class api_update_event_id(BaseModel):
    name: str
    date: str
    max_participants: int
    location_x: str
    location_y: str
    type: str
    employee_id: int
    location_name: str

class api_create_event_id(BaseModel):
    name: str
    date: str
    max_participants: int
    location_x: str
    location_y: str
    type: str
    employee_id: int
    location_name: str

@router.get("/", response_model=List[api_event_id], tags=["events"])
def get_events(token: str = Security(get_current_user_token)):
    try:
        collection_events = database.events
        events = list(collection_events.find({}, {"_id": 0}))
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}", response_model=api_event_id, tags=["events"])
def get_event(event_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_events = database.events
        event = collection_events.find_one({"id": event_id}, {"_id": 0})
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=api_event_id, tags=["events"])
def post_event(event: api_create_event_id, token: str = Security(get_current_user_token)):
    try:
        collection_events = database.events
        max_id = collection_events.find_one(sort=[("id", -1)])
        new_id = 1 if max_id is None else max_id["id"] + 1

        new_event = api_event_id(id=new_id, **event.dict())

        collection_events.insert_one(new_event.dict())
        return new_event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{event_id}", response_model=api_update_event_id, tags=["events"])
def put_event(event_id: int, event: api_update_event_id, token: str = Security(get_current_user_token)):
    try:
        collection_events = database.events
        event.id = event_id
        collection_events.replace_one({"id": event_id}, event.dict())
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{event_id}", response_model=api_event_id, tags=["events"])
def delete_event(event_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_events = database.events
        event = collection_events.find_one({"id": event_id}, {"_id": 0})
        collection_events.delete_one({"id": event_id})
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
