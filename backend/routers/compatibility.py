from fastapi import APIRouter, Security, HTTPException
from typing import List
from pydantic import BaseModel
from authentificationAPI import Role, get_current_user_token
from pymongo import MongoClient
import os
from .customers import api_customer_id

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

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

@router.post("/api/compatibility", tags=["compatibility"])
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
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")