from fastapi import APIRouter, Security, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from authentificationAPI import Role, get_current_user_token
from pymongo import MongoClient
import os
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

class Clothes(BaseModel):
    id: int
    type: str
    image: bytes

class ClothesWithoutImg(BaseModel):
    id: int
    type: str


@router.get("/{clothes_id}", tags=["clothes"])
async def get_clothes_image(clothes_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve the image of a specific piece of clothing.

    - **clothes_id**: ID of the clothing item
    - **token**: JWT token for authentication
    - Returns the image of the clothing item
    """
    role = token.role
    if role == Role.Coach.value:
        employee = database.employees.find_one({"id": token.id}, {"_id": 0, "image": 0})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        customers_ids = employee["customers_ids"]
        if not customers_ids:
            raise HTTPException(status_code=400, detail="Employee has no customers")

        autorized_clothes_ids = []
        for customer_id in customers_ids:
            customer_clothes_ids = database.customers.find_one({"id": customer_id}, {'clothes_ids': 1})['clothes_ids']
            autorized_clothes_ids.extend(customer_clothes_ids)
        print(f"Authorized clothes_ids: {autorized_clothes_ids}")
        if clothes_id not in autorized_clothes_ids:
            raise HTTPException(status_code=403, detail="Not authorized to access this clothes image")

    collection = database.clothes
    clothes = collection.find_one({"id": clothes_id})
    if clothes is None:
        raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")

    image_stream = BytesIO(clothes["image"])
    return StreamingResponse(image_stream, media_type="image/png")

@router.get("/", tags=["clothes"])
async def get_clothes(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of clothing items.

    - **token**: JWT token for authentication
    - Returns a list of clothing items
    """
    try:
        collection_clothes = database.clothes
        clothes = list(collection_clothes.find({}, {"_id": 0, "image": 0}))
        return clothes
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes list.")

@router.get("/{clothes_id}", response_model=ClothesWithoutImg, tags=["clothes"])
async def get_clothes_by_id(clothes_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve details of a specific clothing item.

    - **clothes_id**: ID of the clothing item
    - **token**: JWT token for authentication
    - Returns the details of the clothing item
    """
    try:
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id}, {"_id": 0, "image": 0})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")
        return clothes
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes details.")


@router.post("/", response_model=Clothes, tags=["clothes"])
async def create_clothes(clothes: Clothes):
    """
    Create a new clothing item.

    - **clothes**: Details of the clothing item to be created
    - Returns the created clothing item
    """
    try:
        collection = database.clothes
        clothes.id = len(list(collection.find())) + 1
        id_check = collection.find_one({"id": clothes.id})
        if id_check is not None:
            raise HTTPException(status_code=400, detail="Clothes with this ID already exists")
        collection.insert_one(clothes.dict())
        return clothes, {"message": "Clothes created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{employee_id}",
         response_model=Clothes,
         tags=["clothes"],
         responses={
             200: {"description": "Clothes updated successfully",
                   "content": {"application/json": {"example": {"id": 1, "type": "string", "image": "byte string"}}}},
             400: {"description": "Invalid request",
                   "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
         })
async def update_clothes(clothes_id: int, clothes: Clothes, token: str = Security(get_current_user_token)):
    """
    Update an existing clothing item.

    - **clothes_id**: ID of the clothing item to update
    - **clothes**: Updated details of the clothing item
    - **token**: JWT token for authentication
    - Returns the updated clothing item
    """
    try:
        collection = database.clothes
        result = collection.update_one({"id": clothes_id}, {"$set": clothes.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Clothes not found")
        return clothes, {"message": "Clothes updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{employee_id}",
            tags=["clothes"],
            responses={
                200: {"description": "Clothes deleted successfully",
                      "content": {"application/json": {"example": {"id": 1, "type": "string"}}}},
                400: {"description": "Invalid request",
                      "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            })
async def delete_clothes(clothes_id: int, token: str = Security(get_current_user_token)):
    """
    Delete a clothing item.

    - **clothes_id**: ID of the clothing item to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
    try:
        collection = database.clothes
        result = collection.delete_one({"id": clothes_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Clothes not found")
        return {"message": "Clothes deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{clothes_id}/image", tags=["clothes"])
def get_clothes_image(clothes_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve the image of a specific piece of clothing.

    - **clothes_id**: ID of the clothing item
    - **token**: JWT token for authentication
    - Returns the image of the clothing item
    """
    role = token.role
    if role == Role.Coach.value:
        employee = database.employees.find_one({"id": token.id}, {"_id": 0, "image": 0})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        customers_ids = employee["customers_ids"]
        if not customers_ids:
            raise HTTPException(status_code=400, detail="Employee has no customers")

        autorized_clothes_ids = []
        for customer_id in customers_ids:
            customer_clothes_ids = database.customers.find_one({"id": customer_id}, {'clothes_ids': 1})['clothes_ids']
            autorized_clothes_ids.extend(customer_clothes_ids)
        print(f"Authorized clothes_ids: {autorized_clothes_ids}")
        if clothes_id not in autorized_clothes_ids:
            raise HTTPException(status_code=403, detail="Not authorized to access this clothes image")

    collection = database.clothes
    clothes = collection.find_one({"id": clothes_id})
    if clothes is None:
        raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")

    image_stream = BytesIO(clothes["image"])
    return StreamingResponse(image_stream, media_type="image/png")

