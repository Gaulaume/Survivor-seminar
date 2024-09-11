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

class api_encounters(BaseModel):
    id: int
    customer_id: int
    date: str
    rating: int
    comment: str
    source: str

class api_encounter_id(BaseModel):
    id: int
    customer_id: int
    date: str
    rating: int
    comment: str
    source: str

@router.get("/",
         response_model=List[api_encounter_id],
         tags=["encounters"])
def get_encounters(token: str = Security(get_current_user_token)):
    try:
        collection_encounters = database.encounters
        collection_employees = database.employees

        if token.role == Role.Coach.value:
            employee = collection_employees.find_one({"id": token.id})
            if not employee or "customers_ids" not in employee:
                raise HTTPException(status_code=400, detail="Employee has no assigned customers")
            encounters = list(collection_encounters.find(
                {"customer_id": {"$in": employee["customers_ids"]}},
                {"_id": 0}
            ))
        else:
            encounters = list(collection_encounters.find({}, {"_id": 0}))

        return encounters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/{encounter_id}",
         response_model=api_encounter_id,
         tags=["encounters"])
def get_encounter(encounter_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_encounters = database.encounters
        collection_employees = database.employees

        encounter = collection_encounters.find_one({"id": encounter_id})
        if encounter is None:
            raise HTTPException(status_code=404, detail="Encounter not found")

        if token.role == Role.Manager.value:
            return encounter

        if token.role == Role.Coach.value:
            employee = collection_employees.find_one({"id": token.id})

            if not employee or "customers_ids" not in employee:
                raise HTTPException(status_code=403, detail="No assigned customers found for this employee")


            if encounter["customer_id"] in employee["customers_ids"]:
                return encounter
            else:
                raise HTTPException(status_code=403, detail="Not authorized to access this encounter")

        raise HTTPException(status_code=403, detail="Unauthorized access")

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the encounter details.")



@router.post("/",
            response_model=api_encounters,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter created successfully",
                    "content": {"routerlication/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"routerlication/json": {"example": {"detail": "Invalid request"}}}},
            },
)
async def create_encounter(encounter: api_encounters, token: str = Security(get_current_user_token)):
    """
    Create a new encounter.

    - **encounter**: Encounter details to be created
    - **token**: JWT token for authentication
    - Returns the created encounter details
    """
    try:
        encounter.id = len(list(database.encounters.find())) + 1
        collection = database.encounters
        id = collection.find_one({"id": encounter.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="encounter with this id already exists")
        return encounter, {"message": "encounter created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{encounter_id}",
            response_model=api_encounter_id,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter updated successfully",
                    "content": {"routerlication/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"routerlication/json": {"example": {"detail": "Invalid request"}}}},
            },
)
async def update_encounter(encounter_id: int, encounter: api_encounter_id, token: str = Security(get_current_user_token)):
    """
    Update an existing encounter.

    - **encounter_id**: ID of the encounter to update
    - **encounter**: Updated encounter details
    - **token**: JWT token for authentication
    - Returns the updated encounter details
    """
    try:
        collection = database.encounters
        result = collection.update_one({"id": encounter_id}, {"$set": encounter.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Encounter not found")
        return encounter, {"message": "Encounter updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{encounter_id}", tags=["encounters"])
async def delete_encounter(encounter_id: int, token: str = Security(get_current_user_token)):
    """
    Delete an encounter.

    - **encounter_id**: ID of the encounter to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
    try:
        collection = database.encounters
        result = collection.delete_one({"id": encounter_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Encounter not found")
        return {"message": "Encounter deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/customer/{customer_id}", tags=["encounters"])
async def get_encounters_by_customer(customer_id: int, token: str = Security(get_current_user_token)):
    """
    Get all encounters for a specific customer.

    - **customer_id**: ID of the customer
    - **token**: JWT token for authentication
    - Returns a list of encounters for the customer
    """
    try:
        collection_encounters = database.encounters
        collection_employees = database.employees

        if token.role == Role.Coach.value:
            employee = collection_employees.find_one({"id": token.id})
            if not employee or "customers_ids" not in employee:
                raise HTTPException(status_code=400, detail="Employee has no assigned customers")
            if customer_id not in employee["customers_ids"]:
                raise HTTPException(status_code=403, detail="Not authorized to access this customer's encounters")
        encounters = list(collection_encounters.find({"customer_id": customer_id}, {"_id": 0}))
        return encounters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


