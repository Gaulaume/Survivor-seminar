from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.responses import FileResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import ClassVar, Union, List
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
from authentificationAPI import Role, get_current_user_token, insertDataRegister, insertDataLogin, last_connection_employees


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
    work: str
    last_connection: Optional[str] = None

class api_Employee_login(BaseModel):
    email: str
    password: str

class api_Employee_login_cred(BaseModel):
    access_token: str

class TokenData(BaseModel):
    email: str

class api_Employee_me(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    work: str
    customers_ids: List[int]
    last_connection: Optional[str] = None

class Token(BaseModel):
    access_token: str

class api_customer(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str

class api_customer_without_image(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str
    phone_number: str
    address: str

class api_customer_id(BaseModel):
    id: int
    email: str
    name: str
    surname: str
    birth_date: str
    gender: str
    description: str
    astrological_sign: str
    phone_number: str
    address: str
    image: bytes
    last_connection: Optional[str] = None

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
    comment: str
    source: str

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
    last_connection: Optional[str] = None

@app.get("/api/employees",
         response_model=List[api_Employee],
         tags=["employees"])
async def get_employees(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of employees.

    - **token**: JWT token for authentication
    - Returns a list of employees (Managers see all, Coaches see only themselves)
    """
    collection = database.employees
    employees = list(collection.find({}, {"_id": 0, "image": 0}))
    if (token.role == Role.Manager.value):
        return employees
    else:
        raise HTTPException(status_code=403, detail="Authorization denied")

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
    last_connection_employees(user['id'])
    login_cred = insertDataLogin(employee.email, employee.password, user['id'], user['work'])
    print(traceback.format_exc())
    return api_Employee_login_cred(**login_cred)


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
def get_employee_me(current_user: TokenData = Security(get_current_user_token)):
    try:
        collection = database.employees
        employee = collection.find_one({"email": current_user.email})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        print(employee)
        return employee
    except Exception as e:
        print(traceback.format_exc())
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
def get_employee(employee_id: int, token: str = Security(get_current_user_token)):
    collection = database.employees
    employee = collection.find_one({"id": employee_id})
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee requested doesn't exist")
    if (token.role == Role.Manager.value):
        return employee
    if (token.role == Role.Coach.value):
        if token.id == employee_id:
            return employee
    raise HTTPException(status_code=403, detail="Authorization Denied")





@app.post("/api/employee", response_model=api_Employee_me, tags=["employees"])
async def create_employee(employee: api_Employee_me, token: str = Security(get_current_user_token)):
    """
    Create a new employee.

    - **employee**: Employee details to be created
    - **token**: JWT token for authentication
    - Returns the created employee details
    """
    try:
        employee.id = len(list(database.employees.find())) + 1
        collection = database.employees
        id = collection.find_one({"id": employee.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="Employee with this id already exists")
        return employee, {"message": "Employee created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/employee/{employee_id}",
         response_model=api_Employee_me,
         tags=["employees"],
         responses={
             200: {"description": "Employee updated successfully",
                   "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "work": "string"}}}},
                400: {"description": "Invalid request",
                        "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
async def update_employee(employee_id: int, employee: api_Employee_me, token: str = Security(get_current_user_token)):
    """
    Update an existing employee.

    - **employee_id**: ID of the employee to update
    - **employee**: Updated employee details
    - **token**: JWT token for authentication
    - Returns the updated employee details
    """
    try:
        collection = database.employees
        result = collection.update_one({"id": employee_id}, {"$set": employee.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee, {"message": "Employee updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/employee/{employee_id}", tags=["employees"])
async def delete_employee(employee_id: int, token: str = Security(get_current_user_token)):
    """
    Delete an employee.

    - **employee_id**: ID of the employee to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
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
                   "content": {"application/json": {}}},
             400: {"description": "Employee image is not in PNG format",
                     "content": {"application/json": {"example": {"detail": "Employee image is not in PNG format"}}}},
             404: {"description": "Employee requested doesn't exist",
                   "content": {"application/json": {"example": {"detail": "Employee requested doesn't exist"}}}},
             500: {"description": "Internal server error",
                   "content": {"application/json": {"example": {"detail": "An error occurred while fetching the employee image."}}}},
         },
)
def get_employee_image(employee_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.employees
        employee = collection.find_one({"id": employee_id})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee requested doesn't exist")
        employee["image"] = "data:image/png;base64," + base64.b64encode(employee["image"]).decode('utf-8')
        return employee["image"]
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
def get_employee_stats(employee_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.employees
        employee = collection.find_one({"id": employee_id})

        if employee is None:
            raise HTTPException(status_code=404, detail="Employee requested doesn't exist")
        
        print("employee", employee)
        
        if employee['work'] != 'Coach':
            raise HTTPException(status_code=403, detail="Employee is not a coach")
        
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
        response_model=List[api_customer_without_image],
        tags=["customers"])
async def get_customers(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of customers.

    - **token**: JWT token for authentication
    - Returns a list of customers (Managers see all, Coaches see only their assigned customers)
    """
    collection_employees = database.employees
    collection_customers = database.customers

    customers = list(collection_customers.find({}, {"_id": 0, "image": 0}))
    employee = collection_employees.find_one({"id": token.id})

    if (token.role == Role.Coach.value):
        customers_ids = employee['customers_ids']
        if not customers_ids:
            raise HTTPException(status_code=400, detail="Employee has no customers")
        return list(collection_customers.find({"id": {"$in": customers_ids}}))
    else:
        return customers


@app.get("/api/customers/{customer_id}",
        response_model=api_customer_id,
        tags=["customers"])
async def get_customer(customer_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve details of a specific customer.

    - **customer_id**: ID of the customer to retrieve
    - **token**: JWT token for authentication
    - Returns customer details including the base64 encoded image
    """
    collection = database.customers
    collection_employees = database.employees
    employee = collection_employees.find_one({"id": token.id})
    customer = collection.find_one({"id": customer_id})
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
    if (token.role == Role.Manager.value):
        customer["image"] = "data:image/png;base64," + base64.b64encode(customer["image"]).decode('utf-8')
        return customer
    if (token.role == Role.Coach.value):
        if customer_id in employee["customers_ids"]:
            customer["image"] = "data:image/png;base64," + base64.b64encode(customer["image"]).decode('utf-8')
            return customer
    raise HTTPException(status_code=403, detail="Authorization denied")




@app.post("/api/customer",
        response_model=api_customer_id,
        tags=["customers"],
        responses={
            200: {"description": "Customer created successfully",
                    "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "description": "string", "astrological_sign": "string"}}}},
            400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
        },
)
async def create_customer(customer: api_customer_id, token: str = Security(get_current_user_token)):
    """
    Create a new customer.

    - **customer**: Customer details to be created
    - **token**: JWT token for authentication
    - Returns the created customer details
    """
    try:
        customer.id = len(list(database.customers.find())) + 1
        collection = database.customers
        id = collection.find_one({"id": customer.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="customer with this id already exists")
        return customer, {"message": "customer created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customer/{employee_id}",
        response_model=api_customer_id,
        tags=["customers"],
        responses={
            200: {"description": "Customer updated successfully",
                    "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "description": "string", "astrological_sign": "string"}}}},
            400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
        },
)
async def update_customer(customer_id: int, customer: api_customer_id, token: str = Security(get_current_user_token)):
    """
    Update an existing customer.

    - **customer_id**: ID of the customer to update
    - **customer**: Updated customer details
    - **token**: JWT token for authentication
    - Returns the updated customer details
    """
    try:
        collection = database.customers
        result = collection.update_one({"id": customer_id}, {"$set": customer.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="customer not found")
        return customer, {"message": "customer updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/customer/{employee_id}",
        response_model=api_customer_id,
        tags=["customers"],
        responses={
            200: {"description": "Customer deleted successfully",
                    "content": {"application/json": {"example": {"id": 1, "email": "string", "name": "string", "surname": "string", "birth_date": "string", "gender": "string", "description": "string", "astrological_sign": "string"}}}},
            400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
        },
)
async def delete_customer(customer_id: int, token: str = Security(get_current_user_token)):
    """
    Delete a customer.

    - **customer_id**: ID of the customer to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
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
            403: {"description": "Not authorized to access this customer's image",
                    "content": {"application/json": {"example": {"detail": "Not authorized to access this customer's image"}}}},
            404: {"description": "Customer requested doesn't exist",
                    "content": {"application/json": {"example": {"detail": "Customer requested doesn't exist"}}}},
            500: {"description": "Internal server error",
                    "content": {"application/json": {"example": {"detail": "An error occurred while fetching the customer image."}}}},
        },
)
def get_customer_image(customer_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_customers = database.customers
        collection_employees = database.employees

        customer = collection_customers.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")

        if token.role == Role.Manager.value:
            # Managers can access all customer images
            customer["image"] = "data:image/png;base64," + base64.b64encode(customer["image"]).decode('utf-8')
            return customer["image"]
        elif token.role == Role.Coach.value:
            # Coaches can only access images of their assigned customers
            employee = collection_employees.find_one({"id": token.id})
            if employee and "customers_ids" in employee and customer_id in employee["customers_ids"]:
                customer["image"] = "data:image/png;base64," + base64.b64encode(customer["image"]).decode('utf-8')
                return customer["image"]
            else:
                raise HTTPException(status_code=403, detail="Not authorized to access this customer's image")
        else:
            raise HTTPException(status_code=403, detail="Not authorized to access customer images")

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the customer image.")


@app.get("/api/customers/{customer_id}/payments_history",
         response_model=List[Payment],
         tags=["customers"])
def get_payments_history(customer_id: int, token: str = Security(get_current_user_token)):
    if (token.role == Role.Coach.value):
        raise HTTPException(status_code=403, detail="Authorization denied")
    collection = database.customers
    customer = collection.find_one({"id": customer_id})
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer requested doesn't exist")
    if "payment_history" not in customer:
        raise HTTPException(status_code=404, detail="No payment history found for this customer")
    return customer["payment_history"]



@app.get("/api/customers/{customer_id}/clothes",
         response_model=List[ClothesDetail],
         tags=["customers"])
def get_customer_clothes(customer_id: int, token: str = Security(get_current_user_token)):
    try:
        customer_collection = database.customers
        clothes_collection = database.clothes
        collection_employees = database.employees

        customer = customer_collection.find_one({"id": customer_id})
        if customer is None:
            raise HTTPException(status_code=404, detail="Customer requested doesn't exist")

        # Authorization check
        if token.role == Role.Manager.value:
            # Managers can access all customer clothes
            pass
        elif token.role == Role.Coach.value:
            # Coaches can only access clothes of their assigned customers
            employee = collection_employees.find_one({"id": token.id})
            if not employee or "customers_ids" not in employee or customer_id not in employee["customers_ids"]:
                raise HTTPException(status_code=403, detail="Not authorized to access this customer's clothes")
        else:
            raise HTTPException(status_code=403, detail="Not authorized to access customer clothes")

        if "clothes_ids" not in customer or not customer["clothes_ids"]:
            return []  # Return an empty list if no clothes found

        clothes_details = []
        for clothes_id in customer["clothes_ids"]:
            clothes = clothes_collection.find_one({"id": clothes_id})
            if clothes:
                clothes_details.append({
                    "id": clothes["id"],
                    "type": clothes["type"],
                    "image": "data:image/png;base64," + base64.b64encode(clothes["image"]).decode('utf-8')
                })

        return clothes_details
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching the customer's clothes: {str(e)}")


# ////////////////  ENCOUNTERS  ////////////////



@app.get("/api/encounters",
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



@app.get("/api/encounters/{encounter_id}",
         response_model=api_encounter_id,
         tags=["encounters"])
def get_encounter(encounter_id: int, token: str = Security(get_current_user_token)):
    try:
        collection_encounters = database.encounters
        collection_employees = database.employees

        # First, check if the encounter exists
        encounter = collection_encounters.find_one({"id": encounter_id})
        if encounter is None:
            raise HTTPException(status_code=404, detail="Encounter not found")

        print(f"Encounter found: {encounter}")
        print(f"User role: {token.role}")

        # If the user is a manager, they can access all encounters
        if token.role == Role.Manager.value:
            return encounter

        # For Coaches, check if they have permission
        if token.role == Role.Coach.value:
            employee = collection_employees.find_one({"id": token.id})
            print(f"Employee data: {employee}")

            if not employee or "customers_ids" not in employee:
                raise HTTPException(status_code=403, detail="No assigned customers found for this employee")

            print(f"Employee's customer_ids: {employee['customers_ids']}")
            print(f"Encounter's customer_id: {encounter['customer_id']}")

            if encounter["customer_id"] in employee["customers_ids"]:
                return encounter
            else:
                raise HTTPException(status_code=403, detail="Not authorized to access this encounter")

        # If we reach here, the user doesn't have a recognized role
        raise HTTPException(status_code=403, detail="Unauthorized access")

    except HTTPException as he:
        raise he
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred while fetching the encounter details.")



@app.post("/api/encounter",
            response_model=api_encounters,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter created successfully",
                    "content": {"application/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
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


@app.put("/api/encounter/{encounter_id}",
            response_model=api_encounter_id,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter updated successfully",
                    "content": {"application/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
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


@app.delete("/api/encounter/{encounter_id}", tags=["encounters"])
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


# ////////////////  TIPS  ////////////////



@app.get("/api/tips",
         response_model=List[api_tips],
         tags=["tips"])
def get_tips(token: str = Security(get_current_user_token)):
    try:
        collection = database.tips
        tips = list(collection.find({}, {"_id": 0}))
        return tips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/tips/{tip_id}",
            response_model=api_tips,
            tags=["tips"])
async def get_tip(tip_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve a specific tip.

    - **tip_id**: ID of the tip to retrieve
    - **token**: JWT token for authentication
    - Returns the tip details
    """
    try:
        collection = database.tips
        tip = collection.find_one({"id": tip_id})
        if tip is None:
            raise HTTPException(status_code=404, detail="Tip not found")
        return tip
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/tip", response_model=api_tips, tags=["tips"])
async def create_tip(tip: api_tips, token: str = Security(get_current_user_token)):
    """
    Create a new tip.

    - **tip**: Tip details to be created
    - **token**: JWT token for authentication
    - Returns the created tip details
    """
    try:
        tip.id = len(list(database.tips.find())) + 1
        collection = database.tips
        id = collection.find_one({"id": tip.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="Tip with this id already exists")
        return tip, {"message": "Tip created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.put("/api/tip/{tip_id}",
            response_model=api_tips_update,
            tags=["tips"])
async def update_tips(tip_id: int, tip: api_tips_update, token: str = Security(get_current_user_token)):
    """
    Update an existing tip.

    - **tip_id**: ID of the tip to update
    - **tip**: Updated tip details
    - **token**: JWT token for authentication
    - Returns the updated tip details
    """
    try:
        collection = database.tips
        result = collection.update_one({"id": tip_id}, {"$set": tip.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Tip not found")
        return tip, {"message": "Tip updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.delete("/api/tip/{tip_id}", tags=["tips"])
async def delete_tips(tip_id: int, token: str = Security(get_current_user_token)):
    """
    Delete a tip.

    - **tip_id**: ID of the tip to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
    try:
        collection = database.tips
        result = collection.delete_one({"id": tip_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Tip not found")
        return {"message": "Tip deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ////////////////  EVENTS  ////////////////



@app.get("/api/events",
            response_model=List[api_events],
            tags=["events"])
async def get_events(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of events.

    - **token**: JWT token for authentication
    - Returns a list of all events
    """
    try:
        collection = database.events
        events = list(collection.find({}, {"_id": 0}))
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/events/{event_id}",
            response_model=api_event_id,
            tags=["events"])
async def get_event(event_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve details of a specific event.

    - **event_id**: ID of the event to retrieve
    - **token**: JWT token for authentication
    - Returns the event details
    """
    try:
        collection = database.events
        event = collection.find_one({"id": event_id})
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/events", response_model=api_event_id, tags=["events"])
async def create_event(event: api_event_id, token: str = Security(get_current_user_token)):
    """
    Create a new event.

    - **event**: Event details to be created
    - **token**: JWT token for authentication
    - Returns the created event details
    """
    try:
        event.id = len(list(database.events.find())) + 1
        collection = database.events
        id = collection.find_one({"id": event.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="Event with this id already exists")
        return event, {"message": "Event created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.put("/api/events/{event_id}",
            response_model=api_event_id,
            tags=["events"])
async def update_event(event_id: int, event: api_event_id, token: str = Security(get_current_user_token)):
    """
    Update an existing event.

    - **event_id**: ID of the event to update
    - **event**: Updated event details
    - **token**: JWT token for authentication
    - Returns the updated event details
    """
    try:
        collection = database.events
        result = collection.update_one({"id": event_id}, {"$set": event.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
        return event, {"message": "Event updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.delete("/api/events/{event_id}", tags=["events"])
async def delete_event(event_id: int, token: str = Security(get_current_user_token)):
    """
    Delete an event.

    - **event_id**: ID of the event to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
    try:
        collection = database.events
        result = collection.delete_one({"id": event_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ////////////////  CLOTHES  ////////////////



@app.get("/api/clothes",
         response_model=List[clothes_without_img],
         tags=["clothes"])
def get_clothes(token: str = Security(get_current_user_token)):
    try:
        collection = database.clothes
        clothes = list(collection.find({}, {"_id": 0, "image": 0}))
        return clothes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/clothes/{clothes_id}",
         response_model=clothes,
         tags=["clothes"])
def get_clothes_id(clothes_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes not found")
        clothes["image"] = "data:image/png;base64," + base64.b64encode(clothes["image"]).decode('utf-8')
        return clothes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/clothes",
         response_model=clothes,
         tags=["clothes"])
def create_clothes(clothes: clothes, token: str = Security(get_current_user_token)):
    try:
        clothes.id = len(list(database.clothes.find())) + 1
        collection = database.clothes
        id = collection.find_one({"id": clothes.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="Clothes with this id already exists")
        return clothes, {"message": "Clothes created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.put("/api/clothes/{clothes_id}",
         response_model=clothes,
         tags=["clothes"])
def update_clothes(clothes_id: int, clothes: clothes, token: str = Security(get_current_user_token)):
    try:
        collection = database.clothes
        result = collection.update_one({"id": clothes_id}, {"$set": clothes.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Clothes not found")
        return clothes, {"message": "Clothes updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.delete("/api/clothes/{clothes_id}", tags=["clothes"])
def delete_clothes(clothes_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.clothes
        result = collection.delete_one({"id": clothes_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Clothes not found")
        return {"message": "Clothes deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
def update_encounter(encounter_id: int, encounter: api_encounter_id, token: str = Security(get_current_user_token)):
    try:
        collection = database.encounters
        result = collection.update_one({"id": encounter_id}, {"$set": encounter.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="encounter not found")
        return encounter, {"message": "encounter updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/encounter/{employee_id}",
            response_model=api_encounter_id,
            tags=["encounters"],
            responses={
                200: {"description": "Encounter deleted successfully",
                    "content": {"application/json": {"example": {"id": 1, "customer_id": 1, "date": "string", "rating": 1, "comment": "string", "source": "string"}}}},
                400: {"description": "Invalid request",
                    "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
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



@app.get("/api/encounter/customer/{customer_id}",
         response_model=List[api_encounters],
         tags=["encounters"])
async def get_encounter_customer(customer_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve encounters for a specific customer.

    - **customer_id**: ID of the customer
    - **token**: JWT token for authentication
    - Returns a list of encounters for the specified customer
    """
    try:
        collection_encounters = database.encounters
        collection_employees = database.employees

        print(f"Requested customer_id: {customer_id}")
        print(f"User role: {token.role}")

        # If the user is a manager, they can access all encounters
        if token.role == Role.Manager.value:
            encounters = list(collection_encounters.find({"customer_id": customer_id}, {"_id": 0}))
            print(f"Manager access: Found {len(encounters)} encounters")
            return encounters

        # For coaches, check if they have permission to access this customer's encounters
        if token.role == Role.Coach.value:
            employee = collection_employees.find_one({"id": token.id})
            print(f"Employee data: {employee}")

            if not employee or "customers_ids" not in employee:
                raise HTTPException(status_code=403, detail="No assigned customers found for this employee")

            print(f"Employee's customer_ids: {employee['customers_ids']}")

            if customer_id in employee["customers_ids"]:
                encounters = list(collection_encounters.find({"customer_id": customer_id}, {"_id": 0}))
                print(f"Coach access: Found {len(encounters)} encounters")
                return encounters
            else:
                raise HTTPException(status_code=403, detail="Not authorized to access this customer's encounters")

        # If we reach here, the user doesn't have a recognized role
        raise HTTPException(status_code=403, detail="Unauthorized access")

    except HTTPException as he:
        raise he
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



# ////////////////  TIPS  ////////////////



@app.get("/api/tips",
            response_model=List[api_tips],
            tags=["tips"])
async def get_tips(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of tips.

    - **token**: JWT token for authentication
    - Returns a list of all tips
    """
    try:
        collection = database.tips
        tips = list(collection.find({}, {"_id": 0}))
        return tips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tips/{tip_id}",
            response_model=api_tips,
            tags=["tips"])
async def get_tip(tip_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve a specific tip.

    - **tip_id**: ID of the tip to retrieve
    - **token**: JWT token for authentication
    - Returns the tip details
    """
    try:
        collection = database.tips
        tip = collection.find_one({"id": tip_id})
        if tip is None:
            raise HTTPException(status_code=404, detail="Tip requested doesn't exist")
        return tip
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the tip details.")




@app.post("/api/tip", response_model=api_tips, tags=["tips"])
async def create_tip(tip: api_tips, token: str = Security(get_current_user_token)):
    """
    Create a new tip.

    - **tip**: Tip details to be created
    - **token**: JWT token for authentication
    - Returns the created tip details
    """
    try:
        tip.id = len(list(database.tips.find())) + 1
        collection = database.tips
        id = collection.find_one({"id": tip.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="tip with this id already exists")
        return tip, {"message": "tip created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/tip/{employee_id}",
            response_model=api_tips_update,
            tags=["tips"],
            responses={
                200: {"description": "Tip updated successfully",
                      "content": {"application/json": {"example": {"id": 1, "title": "string", "tip": "string"}}}},
                      400: {"description": "Invalid request",
                            "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
                            },
)
async def update_tips(tips_id: int, tips: api_tips_update, token: str = Security(get_current_user_token)):
    """
    Update an existing tip.

    - **tips_id**: ID of the tip to update
    - **tips**: Updated tip details
    - **token**: JWT token for authentication
    - Returns the updated tip details
    """
    try:
        collection = database.tips
        result = collection.update_one({"id": tips_id}, {"$set": tips.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="tips not found")
        return tips, {"message": "tips updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/tip/{employee_id}", tags=["tips"])
async def delete_tips(tips_id: int, token: str = Security(get_current_user_token)):
    """
    Delete a tip.

    - **tips_id**: ID of the tip to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
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
async def get_events(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of events.

    - **token**: JWT token for authentication
    - Returns a list of all events
    """
    try:
        collection = database.events
        events = list(collection.find({}, {"_id": 0}))
        return events
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/events/{event_id}",
            response_model=api_event_id,
            tags=["events"])
async def get_event(event_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve details of a specific event.

    - **event_id**: ID of the event to retrieve
    - **token**: JWT token for authentication
    - Returns the event details
    """
    try:
        collection = database.events
        event = collection.find_one({"id": event_id})
        if event is None:
            raise HTTPException(status_code=404, detail="Event requested doesn't exist")
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the event details.")



@app.post("/api/events", response_model=api_event_id, tags=["events"])
async def create_event(event: api_event_id, token: str = Security(get_current_user_token)):
    """
    Create a new event.

    - **event**: Event details to be created
    - **token**: JWT token for authentication
    - Returns the created event details
    """
    try:
        event.id = len(list(database.events.find())) + 1
        collection = database.events
        id = collection.find_one({"id": event.id})
        if id is not None:
            raise HTTPException(status_code=400, detail="event with this id already exists")
        return event, {"message": "event created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.put("/api/events/{employee_id}",
            response_model=api_event_id,
            tags=["events"],
            responses={
                200: {"description": "Event updated successfully",
                      "content": {"application/json": {"example": {"id": 1, "name": "string", "date": "string", "max_partcipants": 1, "location_x": "string", "location_y": "string", "type": "string", "employee_id": 1, "location_name": "string"}}}},
                400: {"description": "Invalid request",
                      "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
async def update_event(event_id: int, event: api_event_id, token: str = Security(get_current_user_token)):
    """
    Update an existing event.

    - **event_id**: ID of the event to update
    - **event**: Updated event details
    - **token**: JWT token for authentication
    - Returns the updated event details
    """
    try:
        collection = database.events
        result = collection.update_one({"id": event_id}, {"$set": event.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="event not found")
        return event, {"message": "event updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.delete("/api/events/{employee_id}",
            response_model=api_event_id,
            tags=["events"],
            responses={
                200: {"description": "Event deleted successfully",
                      "content": {"application/json": {"example": {"id": 1, "name": "string", "date": "string", "max_partcipants": 1, "location_x": "string", "location_y": "string", "type": "string", "employee_id": 1, "location_name": "string"}}}},
                400: {"description": "Invalid request",
                      "content": {"application/json": {"example": {"detail": "Invalid request"}}}},
            },
)
async def delete_event(event_id: int, token: str = Security(get_current_user_token)):
    """
    Delete an event.

    - **event_id**: ID of the event to delete
    - **token**: JWT token for authentication
    - Returns a success message
    """
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


@app.get("/api/clothes/{clothes_id}/image", tags=["clothes"])
async def get_clothes_image(clothes_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve the image of a specific piece of clothing.

    - **clothes_id**: ID of the clothing item
    - **token**: JWT token for authentication
    - Returns the image of the clothing item
    """
    try:
        role = token.role
        if role == Role.Coach.value:
            employee = database.employees.find_one({"id": token.id}, {"_id": 0, "image": 0})
            if employee is None:
                raise HTTPException(status_code=404, detail="Employee not found")

            customers_ids = employee["customers_ids"]
            if not customers_ids:
                raise HTTPException(status_code=400, detail="Employee has no customers")
            
            # going to get the list of id of every clothes of every customer of the employee

            clothes_ids = []
            for customer_id in customers_ids:
                customer = database.customers.find_one({"id": customer_id})
                if customer is None:
                    raise HTTPException(status_code=404, detail="Customer not found")
                if "clothes_ids" in customer:
                    clothes_ids.extend(customer["clothes_ids"])
                                    
            

        
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")

        image_stream = BytesIO(clothes["image"])
        # image_stream = 
        no_content = b''        
         
        return StreamingResponse(no_content, media_type="image/png")
    except Exception as e:
        print(f"Error fetching image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes image.")


@app.get("/api/clothes",
         response_model=List[ClothesWithoutImg],
         tags=["clothes"])
async def get_clothes(token: str = Security(get_current_user_token)):
    """
    Retrieve a list of clothing items.

    - **token**: JWT token for authentication
    - Returns a list of clothing items
    """
    try:
        collection_employees = database.employees
        collection_customers = database.customers
        collection_clothes = database.clothes

        # Get the employee based on the token
        employee = collection_employees.find_one({"id": token.id})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Get the customer IDs assigned to this employee
        customer_ids = employee.get("customers_ids", [])

        # Get all customers' clothes IDs
        customers_clothes_ids = []
        for customer_id in customer_ids:
            customer = collection_customers.find_one({"id": customer_id})
            if customer and "clothes_ids" in customer:
                customers_clothes_ids.extend(customer["clothes_ids"])

        # Get the clothes details
        clothes_list = list(collection_clothes.find(
            {"id": {"$in": customers_clothes_ids}},
            {"_id": 0, "image": 0}
        ))

        return clothes_list
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clothes/{clothes_id}",
         response_model=ClothesWithoutImg,
         tags=["clothes"])
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
async def get_clothes_image(clothes_id: int):
    """
    Retrieve the image of a specific clothing item.

    - **clothes_id**: ID of the clothing item
    - Returns the image of the clothing item
    """
    try:
        collection = database.clothes
        clothes = collection.find_one({"id": clothes_id})
        if clothes is None:
            raise HTTPException(status_code=404, detail="Clothes requested doesn't exist")

        image_stream = BytesIO(clothes["image"])
        return StreamingResponse(image_stream, media_type="image/png")
    except Exception as e:
        print(f"Error fetching image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching the clothes image.")

@app.post("/api/clothes",
          response_model=Clothes,
          tags=["clothes"])
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


@app.put("/api/clothes/{employee_id}",
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


@app.delete("/api/clothes/{employee_id}",
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

# ////////////////  COMPATIBILITY  ////////////////

def get_customer_by_id(customer_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.customers
        customer = collection.find_one({"id": customer_id})
        if customer is None:
            raise ValueError(f"Customer with ID {customer_id} not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving customer: {str(e)}")

def calculate_compatibility(customer1: api_customer_id, customer2: api_customer_id, token: str = Security(get_current_user_token)):

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
async def get_compatibility(customer1_id: int, customer2_id: int, token: str = Security(get_current_user_token)):
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