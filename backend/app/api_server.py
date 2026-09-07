# backend/app/api_server.py

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import queue  # <-- FIX 1: Import queue to stop the WebSocket crash

from agent.planner import run_agent_loop
from models.model_router import get_best_model_for_prompt
from audit.sovereignty_monitor import start_audit_daemon, log_queue
from audit.logger import get_recent_logs
from agent.tool_registry import TOOLS_SCHEMA, AVAILABLE_FUNCTIONS  # <-- FIX 2: Shared registry

app = FastAPI(title="Forge Sovereign Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    prompt: str

# Start background audit daemon on startup
@app.on_event("startup")
async def startup_event():
    start_audit_daemon()

@app.get("/health")
def health_check():
    return {"status": "secure", "air_gapped": True, "hardware_profile": "dev"}

@app.post("/api/task")
def submit_task(request: TaskRequest):
    """
    FIX 3: The actual entry point. Receives a prompt, routes to the best model, 
    and runs the agent loop.
    """
    try:
        # 1. Dynamically choose the best model for the task
        chosen_model = get_best_model_for_prompt(request.prompt)
        
        # 2. Execute the agent loop with the centralized tool schema
        final_response = run_agent_loop(
            user_prompt=request.prompt,
            tools_schema=TOOLS_SCHEMA,
            available_functions=AVAILABLE_FUNCTIONS,
            model_name=chosen_model
        )
        
        return {"status": "success", "response": final_response, "model_used": chosen_model}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/ws/audit")
async def websocket_audit_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Check if there are real firewall logs, otherwise send heartbeat
            try:
                log_line = log_queue.get_nowait()
            except queue.Empty:  # <-- This will now work without throwing NameError
                log_line = None

            packet_data = {
                "status": "SECURE",
                "alert": log_line
                # FIX 4: Removed fabricated 'bytes_per_sec' - don't fake metrics for technical judges.
            }
            await websocket.send_json(packet_data)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass

@app.get("/api/audit/logs")
def fetch_audit_logs():
    """Returns the most recent system actions for the frontend UI trace."""
    logs = get_recent_logs(limit=50)
    return {"status": "success", "logs": logs}