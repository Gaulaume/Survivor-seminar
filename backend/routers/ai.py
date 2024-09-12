from fastapi import APIRouter, Security, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from authentificationAPI import Role, get_current_user_token
from pymongo import MongoClient
import os
import requests
from fastapi.responses import JSONResponse
import datetime

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
client = MongoClient(MONGO_URL)
database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]

class AnalyzeVideoRequest(BaseModel):
    video_url: str

@router.post("/analyze_video", tags=["ai"])
async def analyze_video(file: UploadFile = File(...), token: str = Security(get_current_user_token)):
    try:
        video_bytes = await file.read()

        base_url = os.getenv("AI_VIDEO_ANALYSIS_API_URL")
        api_url = f"{base_url}/analyze_video/"
        response = requests.post(api_url, files={"file": ("video.mp4", video_bytes)})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json().get("error", "Unknown error"))

        result = response.json()

        return JSONResponse(content=result)

    except Exception as e:
        print(e)
        return JSONResponse(content={"error": str(e)}, status_code=500)
