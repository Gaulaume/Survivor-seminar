from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from authentificationAPI import Role, get_current_user_token, last_connection_employees
from pymongo import MongoClient
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from io import BytesIO
from fastapi.responses import StreamingResponse
import os
from authentificationAPI import create_access_token
import random
import string
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
import secrets

router = APIRouter()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

# Configuration MongoDB
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

# Modèles Pydantic
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
    email: EmailStr

class api_Employee_login_cred(BaseModel):
    message: str
    access_token: str

class TokenData(BaseModel):
    email: str
    id: int
    role: int

class VerificationResponse(BaseModel):
    message: str

class LoginRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    code: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))


@router.get("/", response_model=List[api_Employee], tags=["employees"])
async def get_employees(current_user: TokenData = Security(get_current_user_token)):
    if current_user.role == Role.Manager.value:
        collection = database.employees
        employees = list(collection.find({}, {"_id": 0, "image": 0}))
    else:
        raise HTTPException(status_code=403, detail="Authorization denied")
    return employees

@router.post("/login", response_model=VerificationResponse, tags=["employees"])
async def login_employee(request: LoginRequest):
    collection = database.employees
    user = collection.find_one({"email": request.email})
    if user is None:
        raise HTTPException(status_code=401, detail="Employee not found")

    verification_code = generate_verification_code()
    expiration_time = datetime.utcnow() + timedelta(minutes=10)

    collection.update_one(
        {"email": request.email},
        {
            "$set": {
                "verification_code": verification_code,
                "verification_code_expires": expiration_time,
                "verification_email": request.email,
                "id": user['id']
            }
        }
    )

    message = MessageSchema(
        subject="Your Verification Code",
        recipients=[request.email],
        body=f"Your verification code is: {verification_code}",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    return VerificationResponse(message="Verification code sent to your email.")

@router.post("/verify", response_model=LoginResponse, tags=["employees"])
async def verify_code(request: VerifyCodeRequest):
    collection = database.employees
    user = collection.find_one({"verification_code": request.code})
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid verification code")

    if datetime.utcnow() > user.get("verification_code_expires", datetime.min):
        raise HTTPException(status_code=401, detail="Verification code has expired")

    email = user.get("verification_email")
    if email is None:
        raise HTTPException(status_code=401, detail="Email not found for verification")

    collection.update_one(
        {"email": email},
        {"$unset": {"verification_code": "", "verification_code_expires": "", "verification_email": ""}}
    )

    role = Role.Coach if user['work'] == "Coach" else Role.Manager

    last_connection_employees(user['id'])
    access_token = create_access_token(data={"email": email, "id": user['id'], "role": role.value})
    return LoginResponse(
        access_token=access_token,
        token_type="bearer"
    )



# @router.get('/confirm_email/{token}')
# async def confirm_email(token: str):
#     try:
#         email = serializer.loads(token, salt="email-confirm")
#         user = database.employees.find_one({"email": email})
#         if user:
#             return {"message": "Email vérifié avec succès"}
#         else:
#             return {"message": "Email non trouvé"}
#     except SignatureExpired:
#         raise HTTPException(status_code=400, detail="Le lien a expiré")
#     except BadSignature:
#         raise HTTPException(status_code=400, detail="Le lien n'est pas valide")


@router.get("/me", response_model=api_Employee, tags=["employees"])
async def get_employee_me(current_user: TokenData = Security(get_current_user_token)):
    collection = database.employees
    employee = collection.find_one({"email": current_user.email})
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


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
        if token.role != Role.Manager.value:
            raise HTTPException(status_code=403, detail="Authorization denied")
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
        if token.role != Role.Manager.value:
            raise HTTPException(status_code=403, detail="Authorization denied")
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
        if token.role != Role.Manager.value:
            raise HTTPException(status_code=403, detail="Authorization denied")
        collection = database.employees
        result = collection.delete_one({"id": employee_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": "Employee deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))