from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Union

import os
from typing import List, Dict
# import data_fetcher

app = FastAPI()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/mydatabase")

client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul_connection")]

class api_create_employee(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    work: str

class api_create_employee(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    work: str

class api_Employee(BaseModel):
    id: int
    email: str
    name: str
    surname: str

class api_Employee_login(BaseModel):
    email: str
    password: str

class api_Employee_login_cred(BaseModel):
    access_token: str

class api_Employee_me(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    work: str

class api_Employee_id(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    work: str


class api_customer(BaseModel):
    id: int
    email: str
    name: str
    surname: str

class api_customer_id(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str

class api_customer_id_payments_history(BaseModel):
    id: int
    date: str
    payment_method: str
    amount: float
    comment: str

class api_customer_id_clothes(BaseModel):
    id: int
    type: str

class api_encounters(BaseModel):
    id: int
    customer_id: int
    date: str
    rating: int

class api_encounter_id(BaseModel):
    id: int
    customer_id: int
    date: str
    rating: int
    comment: str
    source: str

class api_encounter_customer_id(BaseModel):
    id: int
    customer_id: int
    date: str
    rating: int

class api_tips(BaseModel):
    id: int
    title: str
    tip: str

class api_events(BaseModel):
    id: int
    name: str
    date: str
    max_partcipants: int

class api_event_id(BaseModel):
    id: int
    name: str
    date: str
    max_partcipants: int
    location_x: str
    location_y: str
    type: str
    employee_id: int
    location_name: str


@app.get("/api/employees",
         response_model=List[api_Employee],
         tags=["employees"]
)
def get_employees():
    # try:
    #     collection = database.employees
    #     employees = list(collection.find({}, {"_id": 0}))
    #     return employees
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))
    mock_employees = [
    {"id": 2, "email": "jean.dupont@soul-connection.fr", "name": "Jean", "surname": "Dupont"},
    {"id": 4, "email": "david.johnson@soul-connection.fr", "name": "David", "surname": "Johnson"},
    {"id": 5, "email": "sarah.durand@soul-connection.fr", "name": "Sarah", "surname": "Durand"},
    {"id": 6, "email": "michel.petit@soul-connection.fr", "name": "Michel", "surname": "Petit"},
    {"id": 7, "email": "emilie.bernard@soul-connection.fr", "name": "Emilie", "surname": "Bernard"},
    {"id": 8, "email": "daniel.bernard@soul-connection.fr", "name": "Daniel", "surname": "Bernard"},
    {"id": 9, "email": "samantha.robert@soul-connection.fr", "name": "Samantha", "surname": "Robert"},
    {"id": 10, "email": "jacques.roux@soul-connection.fr", "name": "Jacques", "surname": "Roux"},
    ]
    return mock_employees

@app.post("/api/employees/login",
         response_model=api_Employee_login,
         tags=["employees"],
            responses={
                200: {"description": "Login successful",
                      "content": {"application/json": {"example": {"access token": "string"}}}},
                401: {"description": "Invalid credentials",
                    "content": {"application/json": {"example": {"detail": "Invalid Email and Password combination."}}}},
            },
)
def login_employee(employee: api_Employee_login):
    try:
        collection = database.employees
        employee = collection.find_one({"email": employee.email, "id": employee.id})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/employees/me",
         response_model=api_Employee_me,
         tags=["employees"]
)
def get_employee_me():
    try:
        collection = database.employees
        employee = collection.find_one({"id": 1})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/employees/{employee_id}",
         response_model=api_Employee_id,
         tags=["employees"],
         responses={
            404: {"description": "Employee requested doesn't exist",
                  "content": {"application/json": {"example": {"detail": "Employee requested doesn't exist"}}}},
        },
)
def get_employee(employee_id: int):
    try:
        collection = database.employees
        employee = collection.find_one({"id": employee_id})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee requested doesn't exist")
        return employee
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the employee details.")



@app.get("/api/employees/{employee_id}/image",
         tags=["employees"],
         responses={
             200: {"description": "Returns employee's profile picture.",
                   "content": {"image/png": {}}},
             404: {"description": "Employee requested doesn't exist",
                   "content": {"application/json": {"example": {"detail": "Employee requested doesn't exist"}}}},
             500: {"description": "Internal server error",
                   "content": {"application/json": {"example": {"detail": "An error occurred while fetching the employee image."}}}},
         },
)
def get_employee_image(employee_id: int):
    try:
        collection = database.employees
        employee = collection.find_one({"id": employee_id})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee requested doesn't exist")
        image_path = employee["image"]
        if not image_path.endswith(".png"):
            raise HTTPException(status_code=400, detail="Employee image is not in PNG format")
        return FileResponse(image_path, media_type="image/png")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the employee image.")


@app.get("/api/customers",
        response_model=List[api_customer],
        tags=["customers"])
def get_customers():
    mock_customers = [
    {"id": 1, "email": "mercier348.nathalie@gmail.com", "name": "Nathalie", "surname": "Mercier"},
    {"id": 2, "email": "margaud.valette188@gmail.com", "name": "Margaud", "surname": "Valette"},
    {"id": 3, "email": "therese494.lacroix@free.fr", "name": "Thérèse", "surname": "Lacroix"},
    {"id": 4, "email": "teixeira262.alix@free.fr", "name": "Alix", "surname": "Teixeira"},
    {"id": 5, "email": "martel.noemi932@yahoo.fr", "name": "Noémi", "surname": "Martel"},
    {"id": 6, "email": "leroux531.claire@yahoo.fr", "name": "Claire", "surname": "Leroux"},
    {"id": 7, "email": "lecoq.roland796@sfr.fr", "name": "Roland", "surname": "Lecoq"},
    {"id": 8, "email": "martinez198.francois@free.fr", "name": "François", "surname": "Martinez"},
    {"id": 9, "email": "raymond940.lemoine@gmail.com", "name": "Raymond", "surname": "Lemoine"},
    {"id": 10, "email": "perret241.christine@outlook.com", "name": "Christine", "surname": "Perret"}]
    return mock_customers
    # try:
    #     collection = database.customers
    #     customers = list(collection.find({}, {"id": 0}))
    #     return customers
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/customers/{customer_id}",
        response_model=api_customer_id,
        tags=["customers"])
def get_customer(customer_id: int):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
        return customer
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the customer details.")



@app.get("/api/customers/{customer_id}/image",
        tags=["customers"],
        responses={
            200: {"description": "Returns customer's profile picture.",
                    "content": {"image/png": {}}},
            404: {"description": "Customer requested doesn't exist",
                    "content": {"application/json": {"example": {"detail": "Customer requested doesn't exist"}}}},
            500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while fetching the customer image."}}}},
        },
)
def get_customer_image(customer_id: int):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
        return FileResponse(customer["image"])
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the customer image.")



@app.get("/api/customers/{customer_id}/payments_history",
        response_model=List[api_customer_id_payments_history],
        tags=["customers"])
def get_payments_history(customer_id: int):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
        return customer["payments"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the customer payments.")



@app.get("/api/customers/{customer_id}/clothes",
        response_model=List[api_customer_id_clothes],
        tags=["customers"])
def get_clothes(customer_id: int):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
        return customer["clothes"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the customer clothes.")



@app.get("/api/encounters",
            response_model=List[api_encounters],
            tags=["encounters"])
def get_encounters():
    try:
        collection = database.encounters
        encounters = list(collection.find({}, {"_id": 0}))
        return encounters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/encounters/{encounter_id}",
            response_model=api_encounter_id,
            tags=["encounters"])
def get_encounter(encounter_id: int):
    try:
        collection = database.encounters
        encounter = collection.find_one({"id": encounter_id})
        if encounter is None:
            raise HTTPException(status_code=404, detail="Encounter requested doesn't exist")
        return encounter
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the encounter details.")



@app.get("/api/encounters/customer/{customer_id}",
            response_model=List[api_encounter_customer_id],
            tags=["encounters"])
def get_encounter_customer(customer_id: int):
    try:
        collection = database.encounters
        encounters = list(collection.find({"customer_id": customer_id}, {"_id": 0}))
        return encounters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/tips",
            response_model=List[api_tips],
            tags=["tips"])
def get_tips():
    try:
        collection = database.tips
        tips = list(collection.find({}, {"_id": 0}))
        return tips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/events",
            response_model=List[api_events],
            tags=["events"])
def get_events():
    try:
        collection = database.events
        events = list(collection.find({}, {"_id": 0}))
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/events/{event_id}",
            response_model=api_event_id,
            tags=["events"])
def get_event(event_id: int):
    try:
        collection = database.events
        event = collection.find_one({"id": event_id})
        if event is None:
            raise HTTPException(status_code=404, detail="Event requested doesn't exist")
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the event details.")



@app.get("/api/clothes/{clothes_id}/image",
            tags=["clothes"],
            responses={
                200: {"description": "Returns clothes image.",
                      "content": {"image/png": {}}},
                404: {"description": "Clothes requested doesn't exist",
                      "content": {"application/json": {"example": {"detail": "Clothes requested doesn't exist"}}}},
                500: {"description": "Internal server error",
                      "content": {"application/json": {"example": {"detail": "An error occurred while fetching the clothes image."}}}},
            },
)
def get_clothes_image(clothes_id: int):
    try:
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")
        return FileResponse(clothes["image"])
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes image.")
