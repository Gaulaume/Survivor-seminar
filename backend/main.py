from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import os
from typing import List, Dict

app = FastAPI()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/mydatabase")

client = MongoClient(MONGO_URL)
database = client.mydatabase

@app.get("/")
def read_root():
    collection = database.mycollection
    document = collection.find_one({"key": "value"})
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"document": document}

@app.get("/items", response_model=List[Dict])
def read_items():
    try:
        collection = database.mycollection
        documents = list(collection.find())
        for document in documents:
            document["_id"] = str(document["_id"])
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
