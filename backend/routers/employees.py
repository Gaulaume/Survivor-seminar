from fastapi import APIRouter, Security, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from authentificationAPI import Role, get_current_user_token, last_connection_employees, insertDataLogin
from pymongo import MongoClient
import os
from io import BytesIO
from fastapi.responses import StreamingResponse

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

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

class api_Employee_login(BaseModel):
    email: str
    password: str

class api_Employee_login_cred(BaseModel):
    access_token: str

class TokenData(BaseModel):
    email: str

@router.get("/", response_model=List[api_Employee], tags=["employees"])
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



@router.post("/login", response_model=api_Employee_login_cred, tags=["employees"])
def login_employee(employee: api_Employee_login):
    collection = database.employees
    user = collection.find_one({"email": employee.email})
    if user is None:
        raise HTTPException(status_code=401, detail="Employee not found")
    last_connection_employees(user['id'])
    login_cred = insertDataLogin(employee.email, employee.password, user['id'], user['work'])
    return api_Employee_login_cred(**login_cred)



@router.get("/me", response_model=api_Employee, tags=["employees"])
def get_employee_me(current_user: TokenData = Security(get_current_user_token)):
    try:
        collection = database.employees
        employee = collection.find_one({"email": current_user.email})
        if employee is None:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while fetching the employee details.")



@router.get("/{employee_id}", response_model=api_Employee, tags=["employees"])
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



@router.get("/{employee_id}/image", tags=["employees"])
async def get_employee_image(employee_id: int, token: str = Security(get_current_user_token)):
    """
    Retrieve the image of an employee.

    - **employee_id**: ID of the employee
    - **token**: JWT token for authentication
    - Returns the image of the employee
    """
    employee = database.employees.find_one({"id": employee_id})

    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    if "image" in employee:
        image_stream = BytesIO(employee["image"])
        return StreamingResponse(image_stream, media_type="image/png")

    raise HTTPException(status_code=404, detail="Image not found")



@router.get("/{employee_id}/stats", tags=["employees"])
def get_employee_stats(employee_id: int, token: str = Security(get_current_user_token)):
    try:
        collection = database.employees
        employee = collection.find_one({"id": employee_id})

        if employee is None:
            raise HTTPException(status_code=404, detail="Employee requested doesn't exist")

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
            sum_ratings = 0
            for customer_id in customers_ids:
                encounters = database.encounters.find({"customer_id": customer_id})
                for encounter in encounters:
                    count_encounters += 1
                    sum_ratings += encounter['rating']

            average_rating = sum_ratings / count_encounters
            average_rating = round(average_rating, 2)

        return {
            "average_rating": average_rating,
            "clients_length": clients_length,
            "clients_length_female": clients_length_female,
            "clients_length_male": clients_length_male,
        }

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")



@router.post("/", response_model=api_Employee, tags=["employees"])
async def create_employee(employee: api_Employee, token: str = Security(get_current_user_token)):
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




@router.put("/{employee_id}", response_model=api_Employee, tags=["employees"])
async def update_employee(employee_id: int, employee: api_Employee, token: str = Security(get_current_user_token)):
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



@router.delete("/{employee_id}", response_model=api_Employee, tags=["employees"])
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
