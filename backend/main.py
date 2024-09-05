from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Union
from fastapi.middleware.cors import CORSMiddleware
import traceback
from authentificationAPI import insertDataRegister, insertDataLogin


origins = [
    "*"
]
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from typing import List, Dict
# import data_fetcher


MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")

client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

class clothes(BaseModel):
    id: int
    type: str
    image: str

class api_delete_employee(BaseModel):
    email: str

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

class Token(BaseModel):
    access_token: str

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

class api_tips(BaseModel):
    id: int
    title: str
    tip: str

class api_tips_update(BaseModel):
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


# ////////////////  EMPLOYEES  ////////////////

@app.get("/api/employees",
         response_model=List[api_Employee],
         tags=["employees"]
)
def get_employees():
    try:
        collection = database.employees
        employees = list(collection.find({}, {"_id": 0}))
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/employees/login",
         response_model=api_Employee_login_cred,
         tags=["employees"],
            responses={
                200: {"description": "Register successful",
                      "content": {"application/json": {"example": {"access token": "string"}}}},
                401: {"description": "Invalid credentials",
                    "content": {"application/json": {"example": {"detail": "Invalid Email and Password combination."}}}},
                500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while logging in."}}}},
            },
)
def login_employee(employee: api_Employee_login):
    collection = database.employees
    user = collection.find_one({"email": employee.email})
    if user is None:
        raise HTTPException(status_code=401, detail="Employee not found")
    login_cred = insertDataLogin(employee.email, employee.password, user['id'])
    return api_Employee_login_cred(**login_cred)


@app.post("/api/employees/register",
         response_model=api_Employee_login,
         tags=["employees"],
            responses={
                200: {"description": "Register successful",
                      "content": {"application/json": {"example": {"access token": "string"}}}},
                401: {"description": "Invalid credentials",
                    "content": {"application/json": {"example": {"detail": "Email already used"}}}},
                500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while logging in."}}}},
            },
)
def register_employee(employee: api_Employee_login):
    try:
        collection = database.employees
        user = collection.find_one({"email": employee.email})
        if user is None:
            print("KOALA")
            return insertDataRegister(employee.email, employee.password, user['id'])
        raise HTTPException(status_code=401, detail="Employee not found")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error")

#check si email est déjà stocké sinon l'inscrire avec mdp et token si oui  dire que le mail est déjà utilisé

@app.get("/api/employees/me",
         response_model=api_Employee_me,
         tags=["employees"],
            responses={
                404: {"description": "Employee not found",
                    "content": {"application/json": {"example": {"detail": "Employee not found"}}}},
                500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while fetching the employee details."}}}},
            },
)
def get_employee_me():
    try:
        collection = database.employees
        employee = collection.find_one({"id": 1})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the employee details.")



@app.get("/api/employees/{employee_id}",
         response_model=api_Employee_me,
         tags=["employees"],
         responses={
            404: {"description": "Employee requested doesn't exist",
                  "content": {"application/json": {"example": {"detail": "Employee requested doesn't exist"}}}},
            500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while fetching the employee details."}}}},
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



@app.post("/api/employee/create", response_model=api_Employee_me, tags=["employees"])
def create_employee(employee: api_Employee_me):
    try:
        employee.id = len(list(database.employees.find())) + 1
        collection = database.employees
        id = collection.find_one({"id": employee.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="Employee with this id already exists")
        return employee, {"message": "Employee created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/employee/update",
         response_model=api_Employee_me,
         tags=["employees"],
         responses={
             200: {"description": "Employee updated successfully",
                   "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "work": "string"}}}},
                400: {"description": "Invalid request",
                        "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
def update_employee(employee_id: int, employee: api_Employee_me):
    try:
        collection = database.employees
        result = collection.update_one({"id": employee_id}, {"$set": employee.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee, {"message": "Employee updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/employee/delete", tags=["employees"])
def delete_employee(employee_id: int):
    try:
        collection = database.employees
        result = collection.delete_one({"id": employee_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": "Employee deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/employees/{employee_id}/image",
         tags=["employees"],
         responses={
             200: {"description": "Returns employee's profile picture.",
                   "content": {"image/png": {}}},
             400: {"description": "Employee image is not in PNG format",
                     "content": {"application/json": {"example": {"detail": "Employee image is not in PNG format"}}}},
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



# ////////////////  CUSTOMERS  ////////////////



@app.get("/api/customers",
        response_model=List[api_customer],
        tags=["customers"])

def get_customers():
    try:
        collection = database.customers
        customers = list(collection.find({}, {"_id": 0}))
        return customers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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



@app.post("/api/customer/create",
        response_model=api_customer_id,
        tags=["customers"],
        responses={
            200: {"description": "Customer created successfully",
                    "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "description": "string", "astrological_sign": "string"}}}},
            400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
        },
)
def create_customer(customer: api_customer_id):
    try:
        customer.id = len(list(database.customers.find())) + 1
        collection = database.customers
        id = collection.find_one({"id": customer.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="customer with this id already exists")
        return customer, {"message": "customer created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customer/update",
        response_model=api_customer_id,
        tags=["customers"],
        responses={
            200: {"description": "Customer updated successfully",
                    "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "description": "string", "astrological_sign": "string"}}}},
            400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
        },
)
def update_customer(customer_id: int, customer: api_customer_id):
    try:
        collection = database.customers
        result = collection.update_one({"id": customer_id}, {"$set": customer.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="customer not found")
        return customer, {"message": "customer updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/customer/delete",
        response_model=api_customer_id,
        tags=["customers"],
        responses={
            200: {"description": "Customer deleted successfully",
                    "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "description": "string", "astrological_sign": "string"}}}},
            400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
        },
)
def delete_customer(customer_id: int):
    try:
        collection = database.customers
        result = collection.delete_one({"id": customer_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="customer not found")
        return {"message": "customer deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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



# ////////////////  ENCOUNTERS  ////////////////



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



@app.post("/api/encounter/create",
            response_model=api_encounters,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter created successfully",
                    "content": {"application/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
def create_encounter(encounter: api_encounters):
    try:
        encounter.id = len(list(database.encounters.find())) + 1
        collection = database.encounters
        id = collection.find_one({"id": encounter.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="encounter with this id already exists")
        return encounter, {"message": "encounter created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/encounter/update",
            response_model=api_encounter_id,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter updated successfully",
                    "content": {"application/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
def update_encounter(encounter_id: int, encounter: api_encounter_id):
    try:
        collection = database.encounters
        result = collection.update_one({"id": encounter_id}, {"$set": encounter.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="encounter not found")
        return encounter, {"message": "encounter updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/encounter/delete",
            response_model=api_encounter_id,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter deleted successfully",
                    "content": {"application/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
def delete_encounter(encounter_id: int):
    try:
        collection = database.encounters
        result = collection.delete_one({"id": encounter_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="encounter not found")
        return {"message": "encounter deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/encounter/customer/{customer_id}",
            response_model=List[api_encounters],
            tags=["encounters"])
def get_encounter_customer(customer_id: int):
    try:
        collection = database.encounters
        encounters = list(collection.find({"customer_id": customer_id}, {"_id": 0}))
        return encounters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ////////////////  TIPS  ////////////////



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


@app.get("/api/tips/{tip_id}",
            response_model=api_tips,
            tags=["tips"])
def get_tip(tip_id: int):
    try:
        collection = database.tips
        tip = collection.find_one({"id": tip_id})
        if tip is None:
            raise HTTPException(status_code=404, detail="Tip requested doesn't exist")
        return tip
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the tip details.")




@app.post("/api/tip/create", response_model=api_tips, tags=["tips"])
def create_tip(tip: api_tips):
    try:
        tip.id = len(list(database.tips.find())) + 1
        collection = database.tips
        id = collection.find_one({"id": tip.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="tip with this id already exists")
        return tip, {"message": "tip created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/tip/update",
            response_model=api_tips_update,
            tags=["tips"],
            responses={
                200: {"description": "Tip updated successfully",
                      "content": {"application/json": {"example": {"id": 1, "title": "string", "tip": "string"}}}},
                      400: {"description": "Invalid request",
                            "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
                            },
)
def update_tips(tips_id: int, tips: api_tips_update):
    try:
        collection = database.tips
        result = collection.update_one({"id": tips_id}, {"$set": tips.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="tips not found")
        return tips, {"message": "tips updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/tip/delete", tags=["tips"])
def delete_tips(tips_id: int):
    try:
        collection = database.tips
        result = collection.delete_one({"id": tips_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="tips not found")
        return {"message": "tips deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ////////////////  EVENTS  ////////////////



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



@app.post("/api/events/create", response_model=api_event_id, tags=["events"])
def create_event(event: api_event_id):
    try:
        event.id = len(list(database.events.find())) + 1
        collection = database.events
        id = collection.find_one({"id": event.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="event with this id already exists")
        return event, {"message": "event created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.put("/api/events/update",
            response_model=api_event_id,
            tags=["events"],
            responses={
                200: {"description": "Event updated successfully",
                      "content": {"application/json": {"example": {"id": 1, "name": "string", "date": "string", "max_partcipants": 1, "location_x": "string", "location_y": "string", "type": "string", "employee_id": 1, "location_name": "string"}}}},
                400: {"description": "Invalid request",
                      "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
def update_event(event_id: int, event: api_event_id):
    try:
        collection = database.events
        result = collection.update_one({"id": event_id}, {"$set": event.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="event not found")
        return event, {"message": "event updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.delete("/api/events/delete",
            response_model=api_event_id,
            tags=["events"],
            responses={
                200: {"description": "Event deleted successfully",
                      "content": {"application/json": {"example": {"id": 1, "name": "string", "date": "string", "max_partcipants": 1, "location_x": "string", "location_y": "string", "type": "string", "employee_id": 1, "location_name": "string"}}}},
                400: {"description": "Invalid request",
                      "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
def delete_event(event_id: int):
    try:
        collection = database.events
        result = collection.delete_one({"id": event_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="event not found")
        return {"message": "event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ////////////////  CLOTHES  ////////////////



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
