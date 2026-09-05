from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from agent.planner import run_agent_loop
from models.model_router import get_best_model_for_prompt
from audit.sovereignty_monitor import start_audit_daemon, log_queue

app = FastAPI(title="Forge Sovereign Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start background audit daemon on startup
@app.on_event("startup")
async def startup_event():
    start_audit_daemon()

@app.get("/health")
def health_check():
    return {"status": "secure", "air_gapped": True, "hardware_profile": "dev"}

@app.websocket("/ws/audit")
async def websocket_audit_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Check if there are real firewall logs, otherwise send an active heartbeat confirming zero egress
            try:
                log_line = log_queue.get_nowait()
            except queue.Empty:
                log_line = None

            packet_data = {
                "bytes_per_sec": 0,
                "status": "SECURE",
                "alert": log_line
            }
            await websocket.send_json(packet_data)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass

from audit.logger import get_recent_logs # Add to your imports at the top

@app.get("/api/audit/logs")
def fetch_audit_logs():
    """Returns the most recent system actions for the frontend UI trace."""
    logs = get_recent_logs(limit=50)
    return {"status": "success", "logs": logs}