from fastapi import APIRouter, Security, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from authentificationAPI import Role, get_current_user_token
from pymongo import MongoClient
import os
import requests
from fastapi.responses import JSONResponse
import traceback
from gradio_client import file, Client
from io import BytesIO
from tempfile import NamedTemporaryFile


# gradio_client = Client("https://b3ee-34-238-252-102.ngrok-free.app/")

router = APIRouter()

# MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongod:27017/")
# client = MongoClient(MONGO_URL)
# database = client[os.getenv("MONGO_INITDB_DATABASE", "soul-connection")]


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
        return JSONResponse(content={"error": str(e)}, status_code=500)


@router.post("/VTON", tags=["ai"])
async def VTON(person: UploadFile = File(...), clothe: UploadFile = File(...), token: str = Security(get_current_user_token)):
    try:
        # Save uploaded files to temporary files
            # with NamedTemporaryFile(delete=False) as temp_person:
            #     person_path = temp_person.name
            #     person_bytes = await person.read()
            #     temp_person.write(person_bytes)

            # with NamedTemporaryFile(delete=False) as temp_clothe:
            #     clothe_path = temp_clothe.name
            #     clothe_bytes = await clothe.read()
            #     temp_clothe.write(clothe_bytes)

        # Send file paths to the Gradio client
        # result = gradio_client.predict(
        #     dict={"background": file(person_path), "layers": [], "composite": None},
        #     garm_img=file(clothe_path),
        #     garment_des="Hello!!",
        #     is_checked=True,
        #     is_checked_crop=False,
        #     denoise_steps=40,
        #     seed=42,
        #     api_name="/tryon"
        # )

        # Clean up temporary files
        # os.remove(person_path)
        # os.remove(clothe_path)
        result = {"success": True}

        return JSONResponse(content=result)

    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(content={"error": str(e)}, status_code=500)