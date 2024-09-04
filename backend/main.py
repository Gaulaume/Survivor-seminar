from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import os
from typing import List, Dict
# import data_fetcher

app = FastAPI()

# Default root route
@app.get("/")
def read_root():
    MONGO_URL = os.getenv("MONGO_URL")
    print(MONGO_URL)
    return {"Hello": MONGO_URL}

# MONGO_URL = os.getenv("MONGO_URL")
# print(MONGO_URL)
# client = MongoClient(MONGO_URL)
# database = client.mydatabase

# @app.get("/")
# def read_root():
#     collection = database.mycollection
#     document = collection.find_one({"key": "value"})
#     if document is None:
#         raise HTTPException(status_code=404, detail="Document not found")
#     return {"document": document}

# @app.get("/items", response_model=List[Dict])
# def read_items():
#     try:
#         collection = database.mycollection
#         documents = list(collection.find())
#         for document in documents:
#             document["_id"] = str(document["_id"])
#         return documents
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

