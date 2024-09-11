from fastapi import APIRouter, Security, HTTPException
from typing import List
from pydantic import BaseModel
from authentificationAPI import Role, get_current_user_token
from pymongo import MongoClient
import os
import base64
from typing import Optional
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

class api_customer_without_image(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str
    address: str
    phone_number: str

class api_customer_id(api_customer_without_image):
    image: Optional[bytes] = None

class api_create_customer(BaseModel):
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str
    address: str
    phone_number: str
    image: Optional[bytes] = None

class Payment(BaseModel):
    date: str
    amount: float
    method: str

class ClothesDetail(BaseModel):
    id: int
    type: str
    image: Optional[str] = None


@router.get("/", response_model=List[api_customer_without_image], tags=["customers"])
async def get_customers(token: str = Security(get_current_user_token)):
    collection_employees = database.employees
    collection_customers = database.customers

    customers = list(collection_customers.find({}, {"_id": 0, "image": 0}))
    employee = collection_employees.find_one({"id": token.id})

    if token.role == Role.Coach.value:
        customers_ids = employee['customers_ids']
        if not customers_ids:
            raise HTTPException(status_code=400, detail="Employee has no customers")
        return list(collection_customers.find({"id": {"$in": customers_ids}}))
    else:
        return customers


@router.get("/{customer_id}",
            response_model=api_customer_id,
            tags=["customers"])
async def get_customer(customer_id: int, token: str = Security(get_current_user_token)):
    collection = database.customers
    collection_employees = database.employees
    employee = collection_employees.find_one({"id": token.id})
    customer = collection.find_one({"id": customer_id})

    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if token.role == Role.Manager.value or (token.role == Role.Coach.value and customer_id in employee["customers_ids"]):
        customer["image"] = "data:image/png;base64," + base64.b64encode(customer["image"]).decode('utf-8')
        return customer

    raise HTTPException(status_code=403, detail="Authorization denied")


@router.post("/", response_model=api_create_customer, tags=["customers"])
async def create_customer(customer: api_create_customer, token: str = Security(get_current_user_token)):
    try:
        collection = database.customers
        new_id = collection.count_documents({}) + 1

        customer_dict = customer.dict()
        customer_dict['id'] = new_id

        if customer_dict['image']:
            if isinstance(customer_dict['image'], str):
                if ',' in customer_dict['image']:
                    customer_dict['image'] = base64.b64decode(customer_dict['image'].split(',')[1])
                else:
                    customer_dict['image'] = base64.b64decode(customer_dict['image'])
        else:
            customer_dict['image'] = None

        result = collection.insert_one(customer_dict)

        if result.inserted_id:
            return api_create_customer(**customer_dict)
        else:
            raise HTTPException(status_code=500, detail="Failed to create customer")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{customer_id}", response_model=api_customer_id, tags=["customers"])
async def update_customer(customer_id: int, customer: api_customer_id, token: str = Security(get_current_user_token)):
    try:
        collection = database.customers
        result = collection.update_one({"id": customer_id}, {"$set": customer.dict()})

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")

        return customer, {"message": "Customer updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{customer_id}", tags=["customers"])
async def delete_customer(customer_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.customers
        result = collection.delete_one({"id": customer_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")

        return {"message": "Customer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{customer_id}/image", tags=["customers"])
def get_customer_image(customer_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_customers = database.customers
        collection_employees = database.employees

        customer = collection_customers.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")

        if token.role == Role.Manager.value or (token.role == Role.Coach.value and customer_id in collection_employees.find_one({"id": token.id})["customers_ids"]):
            image_stream = BytesIO(customer["image"])
            return StreamingResponse(image_stream, media_type="image/png")

        raise HTTPException(status_code=403, detail="Not authorized to access this customer's image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/{customer_id}/payments_history", tags=["customers"])
def get_payments_history(customer_id: int, token: str = Security(get_current_user_token)):
    if token.role == Role.Coach.value:
        raise HTTPException(status_code=403, detail="Authorization denied")

    collection = database.customers
    customer = collection.find_one({"id": customer_id}, {"_id": 0, "payment_history": 1})
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if "payment_history" not in customer:
        raise HTTPException(status_code=404, detail="No payment history found")

    return customer["payment_history"]


@router.get("/{customer_id}/clothes", response_model=List[ClothesDetail], tags=["customers"])
def get_customer_clothes(customer_id: int, token: str = Security(get_current_user_token)):
    try:
        customer_collection = database.customers
        clothes_collection = database.clothes
        collection_employees = database.employees

        customer = customer_collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")

        if token.role == Role.Manager.value or (token.role == Role.Coach.value and customer_id in collection_employees.find_one({"id": token.id})["customers_ids"]):
            clothes_details = []
            for clothes_id in customer.get("clothes_ids", []):
                clothes = clothes_collection.find_one({"id": clothes_id})
                if clothes:
                    clothes_details.append({
                        "id": clothes["id"],
                        "type": clothes["type"],
                        "image": "data:image/png;base64," + base64.b64encode(clothes["image"]).decode('utf-8')
                    })
            return clothes_details

        raise HTTPException(status_code=403, detail="Not authorized to access this customer's clothes")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching clothes: {str(e)}")
