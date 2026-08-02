import os
import json
from dotenv import load_dotenv
from groq import Groq
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()

my_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=my_api_key)

# Open and read your JSON profile
with open("profile.json", "r") as file:
    my_data = json.load(file)

#Ai ko structured format me data diya
profile_text = json.dumps(my_data)


system_prompt = f"""You are the official AI representative of the candidate whose profile is provided below. 
Your goal is to answer questions from recruiters about this candidate.

STRICT RULES:
1. Answer ONLY using the information provided in the candidate's profile.
2. NEVER hallucinate, invent, or assume any information, skills, or experience that are not explicitly stated.
3. If a question asks for information that is missing from the profile, you must clearly and directly state that you do not have that information.
4. Always maintain an honest, objective, and professional tone.

CANDIDATE PROFILE:
{profile_text}
"""
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (you can restrict this to your frontend URL later)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    job_description: str | None = None  # Optional field for the job description

def generate_response(chat_messages: list[Message], job_description: str | None = None):
    # Base system prompt
    current_system_prompt = system_prompt
    
    # If a job description is provided, augment the persona/instructions
    if job_description and job_description.strip():
        current_system_prompt += f"""

---
HR JOB DESCRIPTION EVALUATION MODE:
An HR representative has provided the following Job Description:
\"\"\"{job_description}\"\"\"

Evaluate the candidate (Anish Singh) specifically against this job description. Answer user queries by analyzing:
1. Is this candidate suitable? (Provide a clear assessment)
2. What skills are missing? (Identify any gaps)
3. What are the candidate's strengths? (Highlight matching skills/experience)
4. Should we interview this person? (Give a professional hiring recommendation)
"""

    formatted_messages = [{"role": "system", "content": current_system_prompt}]
    
    for msg in chat_messages:
        groq_role = "assistant" if msg.role == "ai" else msg.role
        formatted_messages.append({"role": groq_role, "content": msg.content})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=formatted_messages,
        stream=True
    )
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        generate_response(request.messages, request.job_description), 
        media_type="text/plain"
    )

#streaming karenge ab
def generate_response(chat_messages: list[Message],job_description: str | None = None):
    # Start with the system prompt
    formatted_messages = [{"role": "system", "content": system_prompt}]
    
    for msg in chat_messages:
        # Map frontend "ai" role to Groq's expected "assistant" role
        groq_role = "assistant" if msg.role == "ai" else msg.role
        formatted_messages.append({"role": groq_role, "content": msg.content})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=formatted_messages,
        stream=True
    )
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(generate_response(request.messages), media_type="text/plain")
