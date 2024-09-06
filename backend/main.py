from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Union, List
from fastapi.middleware.cors import CORSMiddleware
import traceback
from fastapi.responses import StreamingResponse, FileResponse
from io import BytesIO
import base64
import data_fetcher
import os
from typing import List, Dict
from typing import Optional
import asyncio

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

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")

client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

class clothes_without_img(BaseModel):
    id: int
    type: str

class clothes(clothes_without_img):
    image: Optional[str]

class Clothes(BaseModel):
    id: int
    type: str
    image: bytes

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
    customers_ids: List[int]     

class api_customer(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str

class api_customer_id(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str

class Payment(BaseModel):
    id: int
    date: str
    payment_method: str
    amount: float
    comment: str

class api_customer_id_payments_history(BaseModel):
    payment_history: List[Payment]

class customer_clothes(BaseModel):
    id: int

class api_customer_id_clothes(BaseModel):
    clothes_ids: List[customer_clothes]

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

class   ClothesDetail(BaseModel):
    id: int
    type: str
    image: str

# ////////////////  EMPLOYEES  ////////////////

class api_Employee(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    work: str
    customers_ids: List[int]

@app.get("/api/employees",
         response_model=List[api_Employee],
         tags=["employees"]
)
def get_employees():
    try:
        collection = database.employees
        employees = list(collection.find({}, {"_id": 0, "image": 0}))
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/employees/login",
         response_model=api_Employee_login,
         tags=["employees"],
            responses={
                200: {"description": "Login successful",
                      "content": {"application/json": {"example": {"access token": "string"}}}},
                401: {"description": "Invalid credentials",
                    "content": {"application/json": {"example": {"detail": "Invalid Email and Password combination."}}}},
                500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while logging in."}}}},
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
        raise HTTPException(status_code=500, detail="Internal server error")



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




@app.get("/api/employees/{employee_id}/stats",
         tags=["employees"],
         responses={
             200: {
                 "description": "Returns employee's statistics.",
                 "content": {
                     "application/json": {
                         "example": {
                             "average_rating": 4.5,
                             "clients_length": 10,
                             "clients_length_female": 4,
                             "clients_length_male": 6
                         }
                     }
                 },
             },
             404: {
                 "description": "Employee requested doesn't exist",
                 "content": {
                     "application/json": {
                         "example": {"detail": "Employee requested doesn't exist"}
                     }
                 }
             },
             500: {
                 "description": "Internal server error",
                 "content": {
                     "application/json": {
                         "example": {"detail": "An error occurred while fetching the employee statistics."}
                     }
                 }
             },
         },
)
def get_employee_stats(employee_id: int):
    try:
        collection = database.employees
        employee = collection.find_one({"id": employee_id})

        if employee is None:
            raise HTTPException(status_code=404, detail="Employee requested doesn't exist")
        
        print("employee", employee)
        
        if employee['work'] != 'Coach':
            raise HTTPException(status_code=400, detail="Employee is not a coach")
        
        customers_ids = employee['customers_ids']
        if not customers_ids:
            raise HTTPException(status_code=400, detail="Employee has no customers")
        
        clients_length = len(customers_ids)
        clients_length_female = 0
        clients_length_male = 0

        for customer_id in customers_ids:
            customer = database.customers.find_one({"id": customer_id})
            if customer['gender'] == 'Female':
                clients_length_female += 1
            else:
                clients_length_male += 1

        if clients_length == 0:
            average_rating = 0
        else:
            count_encounters = 0
            sum = 0
            for customer_id in customers_ids:
                encounters = database.encounters.find({"customer_id": customer_id})
                for encounter in encounters:
                    count_encounters += 1
                    sum += encounter['rating']

            average_rating = sum / count_encounters
            average_rating = round(average_rating, 2)

        return {
            "average_rating": average_rating,
            "clients_length": clients_length,
            "clients_length_female": clients_length_female,
            "clients_length_male": clients_length_male,
        }

    except HTTPException as http_err:
        # Let FastAPI handle the HTTPException
        raise http_err
    except Exception as e:
        # For other exceptions, return a generic error
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

# ////////////////  CUSTOMERS  ////////////////



@app.get("/api/customers",
        response_model=List[api_customer_id],
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

@app.get("/api/customers/{customer_id}/payments_history",
         response_model=List[Payment],
         tags=["customers"])
def get_payments_history(customer_id: int):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
        if "payment_history" not in customer:
            raise HTTPException(status_code=404, detail="No payment history found for this customer")
        return customer["payment_history"]
    except Exception as e:
            raise HTTPException(status_code=500, detail="An error occurred while fetching the customer payments.")


@app.get("/api/customers/{customer_id}/clothes",
         response_model=List[ClothesDetail],
         tags=["customers"])
def get_clothes(customer_id: int):
    try:
        customer_collection = database.customers
        customer = customer_collection.find_one({"id": customer_id})

        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")

        if "clothes_ids" not in customer:
            raise HTTPException(status_code=404, detail="No clothes found for this customer")

        clothes_details = []

        clothes_collection = database.clothes
        for clothes_id in customer["clothes_ids"]:
            clothes = clothes_collection.find_one({"id": clothes_id})
            if clothes:
                clothes_details.append({
                    "id": clothes["id"],
                    "type": clothes["type"],
                    "image": "data:image/png;base64," + base64.b64encode(clothes["image"]).decode('utf-8')
                })

        return clothes_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ////////////////  ENCOUNTERS  ////////////////



@app.get("/api/encounters",
            response_model=List[api_encounter_id],
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
        print(traceback.format_exc())
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

# Clothes Models
class Clothes(BaseModel):
    id: int
    type: str
    image: bytes

class ClothesWithoutImg(BaseModel):
    id: int
    type: str


@app.get("/api/clothes",
         response_model=List[ClothesWithoutImg],
         tags=["clothes"])
def get_clothes():
    try:
        collection = database.clothes
        clothes_list = list(collection.find({}, {"_id": 0, "image": 0}))  # Exclude image field
        return clothes_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clothes/{clothes_id}",
         response_model=ClothesWithoutImg,
         tags=["clothes"])
def get_clothes_by_id(clothes_id: int):
    try:
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id}, {"_id": 0, "image": 0})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")
        return clothes
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes details.")

@app.get("/api/clothes/{clothes_id}/image",
         tags=["clothes"],
         responses={
             200: {"description": "Returns clothes image.",
                   "content": {"image/png": {}}},
             404: {"description": "Clothes requested doesn't exist",
                   "content": {"application/json": {"example": {"detail": "Clothes requested doesn't exist"}}}},
             500: {"description": "Internal server error",
                   "content": {"application/json": {"example": {"detail": "An error occurred while fetching the clothes image."}}}},
         })
def get_clothes_image(clothes_id: int):
    try:
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")

        image_stream = BytesIO(clothes["image"])
        return StreamingResponse(image_stream, media_type="image/png")

        image_stream = BytesIO(clothes["image"])
        return StreamingResponse(image_stream, media_type="image/png")
    except Exception as e:
        print(f"Error fetching image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes image.")
    
@app.post("/api/clothes/create",
          response_model=Clothes,
          tags=["clothes"])
def create_clothes(clothes: Clothes):
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


@app.put("/api/clothes/update",
         response_model=Clothes,
         tags=["clothes"],
         responses={
             200: {"description": "Clothes updated successfully",
                   "content": {"application/json": {"example": {"id": 1, "type": "string", "image": "byte string"}}}},
             400: {"description": "Invalid request",
                   "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
         })
def update_clothes(clothes_id: int, clothes: Clothes):
    try:
        collection = database.clothes
        result = collection.update_one({"id": clothes_id}, {"$set": clothes.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Clothes not found")
        return clothes, {"message": "Clothes updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/clothes/delete",
            tags=["clothes"],
            responses={
                200: {"description": "Clothes deleted successfully",
                      "content": {"application/json": {"example": {"id": 1, "type": "string"}}}},
                400: {"description": "Invalid request",
                      "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            })
def delete_clothes(clothes_id: int):
    try:
        collection = database.clothes
        result = collection.delete_one({"id": clothes_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Clothes not found")
        return {"message": "Clothes deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# ////////////////  COMPATIBILITY  ////////////////

def get_customer_by_id(customer_id: int):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise ValueError(f"Customer with ID {customer_id} not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving customer: {str(e)}")

def calculate_compatibility(customer1: api_customer_id, customer2: api_customer_id):

    compatibility_scores = {
        ("Aries", "Aries"): 2,
        ("Aries", "Taurus"): 1,
        ("Aries", "Gemini"): 1,
        ("Aries", "Cancer"): 0,
        ("Aries", "Leo"): 2,
        ("Aries", "Virgo"): 1,
        ("Aries", "Libra"): 1,
        ("Aries", "Scorpio"): 0,
        ("Aries", "Sagittarius"): 2,
        ("Aries", "Capricorn"): 1,
        ("Aries", "Aquarius"): 1,
        ("Aries", "Pisces"): 0,

        ("Taurus", "Taurus"): 2,
        ("Taurus", "Gemini"): 0,
        ("Taurus", "Cancer"): 2,
        ("Taurus", "Leo"): 1,
        ("Taurus", "Virgo"): 2,
        ("Taurus", "Libra"): 1,
        ("Taurus", "Scorpio"): 2,
        ("Taurus", "Sagittarius"): 0,
        ("Taurus", "Capricorn"): 2,
        ("Taurus", "Aquarius"): 0,
        ("Taurus", "Pisces"): 2,

        ("Gemini", "Gemini"): 2,
        ("Gemini", "Cancer"): 1,
        ("Gemini", "Leo"): 2,
        ("Gemini", "Virgo"): 1,
        ("Gemini", "Libra"): 2,
        ("Gemini", "Scorpio"): 0,
        ("Gemini", "Sagittarius"): 2,
        ("Gemini", "Capricorn"): 0,
        ("Gemini", "Aquarius"): 2,
        ("Gemini", "Pisces"): 1,

        ("Cancer", "Cancer"): 2,
        ("Cancer", "Leo"): 1,
        ("Cancer", "Virgo"): 2,
        ("Cancer", "Libra"): 0,
        ("Cancer", "Scorpio"): 2,
        ("Cancer", "Sagittarius"): 0,
        ("Cancer", "Capricorn"): 2,
        ("Cancer", "Aquarius"): 0,
        ("Cancer", "Pisces"): 2,

        ("Leo", "Leo"): 2,
        ("Leo", "Virgo"): 1,
        ("Leo", "Libra"): 2,
        ("Leo", "Scorpio"): 1,
        ("Leo", "Sagittarius"): 2,
        ("Leo", "Capricorn"): 1,
        ("Leo", "Aquarius"): 1,
        ("Leo", "Pisces"): 1,

        ("Virgo", "Virgo"): 2,
        ("Virgo", "Libra"): 1,
        ("Virgo", "Scorpio"): 2,
        ("Virgo", "Sagittarius"): 1,
        ("Virgo", "Capricorn"): 2,
        ("Virgo", "Aquarius"): 0,
        ("Virgo", "Pisces"): 1,

        ("Libra", "Libra"): 2,
        ("Libra", "Scorpio"): 1,
        ("Libra", "Sagittarius"): 2,
        ("Libra", "Capricorn"): 1,
        ("Libra", "Aquarius"): 2,
        ("Libra", "Pisces"): 1,

        ("Scorpio", "Scorpio"): 2,
        ("Scorpio", "Sagittarius"): 1,
        ("Scorpio", "Capricorn"): 2,
        ("Scorpio", "Aquarius"): 0,
        ("Scorpio", "Pisces"): 2,

        ("Sagittarius", "Sagittarius"): 2,
        ("Sagittarius", "Capricorn"): 1,
        ("Sagittarius", "Aquarius"): 2,
        ("Sagittarius", "Pisces"): 1,

        ("Capricorn", "Capricorn"): 2,
        ("Capricorn", "Aquarius"): 1,
        ("Capricorn", "Pisces"): 2,

        ("Aquarius", "Aquarius"): 2,
        ("Aquarius", "Pisces"): 1,

        ("Pisces", "Pisces"): 2
}
    try:
        score = compatibility_scores.get((customer1, customer2), 0)
        score += compatibility_scores.get((customer2, customer1), 0)
        return score / 2
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid astrological signs provided")

@app.post("/api/compatibility", tags=["compatibility"])
def get_compatibility(customer1_id: int, customer2_id: int):
    """Calculates compatibility between two customers."""
    try:
        customer1 = get_customer_by_id(customer1_id)
        customer2 = get_customer_by_id(customer2_id)
        print(customer1)
        print(customer1["astrological_sign"])
        print(customer2)
        customer1_sign = customer1.get("astrological_sign")
        customer2_sign = customer2.get("astrological_sign")

        if not customer1_sign:
            raise ValueError(f"Customer with ID {customer1_id} does not have an astrological sign")
        if not customer2_sign:
            raise ValueError(f"Customer with ID {customer2_id} does not have an astrological sign")
        compatibility_score = calculate_compatibility(customer1_sign, customer2_sign)
        return {"result": compatibility_score * 50}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")