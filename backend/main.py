from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime
from datetime import timezone
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import logging
import json
import re
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

#Load gemini, mongo, & fastapi
genai_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
app = FastAPI()
client = MongoClient("mongodb://mongo:27017")
db = client.phishing_app

class EmailRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_email(req: EmailRequest):
    prompt = f"""
    You are a phishing detection expert. The date is {datetime.today()} for your analysis information. Given the email below, provide:
    {{
      "risk_score": <0-100>,
      "summary": "<short summary>",
      "flags": ["flag1", "flag2"]
    }}
    Email: \"\"\"{req.text}\"\"\"
    Respond with only JSON, no markdown or code fences.
    """
    try:
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt)

        # Parse gemini response
        text_output = response.text
        print("Raw Gemini response:", repr(text_output)) 
        ai_result = json.loads(text_output)

    except Exception as e:
        logging.error(f"AI or JSON parsing error: {e}")
        return {"error": "Failed to analyze email"}

    doc = {
        "text": req.text,
        "risk_score": ai_result.get("risk_score", 0),
        "summary": ai_result.get("summary", ""),
        "flags": ai_result.get("flags", []),
        "created_at": datetime.now(timezone.utc)
    }
    insert_result = db.scans.insert_one(doc)

    response_doc = {
        "_id": str(insert_result.inserted_id),
        "text": doc["text"],
        "risk_score": doc["risk_score"],
        "summary": doc["summary"],
        "flags": doc["flags"],
        "created_at": doc["created_at"].isoformat()
    }
    return response_doc
    
def clean_gemini_response(text: str) -> str:
    # Remove json markers & whitespace just in case
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()
    return text

@app.get("/history")
async def get_history():
    scans = list(db.scans.find().sort("created_at", -1).limit(10))
    for scan in scans:
        if "_id" in scan:
            scan["_id"] = str(scan["_id"])
    return scans

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)