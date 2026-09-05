import os
import json
import uuid
from datetime import datetime
from pathlib import Path

# Define the absolute path to the air-gapped audit folder
BASE_DIR = Path(__file__).resolve().parents[3] / "data" / "audit_logs"

def get_today_log_file() -> Path:
    """Returns the path for today's append-only JSONL log file."""
    os.makedirs(BASE_DIR, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    return BASE_DIR / f"audit_log_{today}.jsonl"

def generate_session_id() -> str:
    return uuid.uuid4().hex[:12]

def log_event(session_id: str, event_type: str, action: str, metadata: dict = None):
    """
    Writes an immutable event to the daily JSONL audit log.
    event_type: 'USER_PROMPT', 'MODEL_SWAP', 'TOOL_CALL', 'TOOL_RESULT', 'FINAL_ANSWER', 'ERROR'
    """
    log_file = get_today_log_file()
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "event_type": event_type,
        "action": action,
        "metadata": metadata or {}
    }
    
    # Append-only lock (simulated via standard file append for the prototype)
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")
        
    print(f"📝 [Audit Log] {event_type}: {action}")

def get_recent_logs(limit: int = 50) -> list:
    """Reads the most recent log entries for the UI dashboard."""
    log_file = get_today_log_file()
    if not log_file.exists():
        return []
        
    logs = []
    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                logs.append(json.loads(line))
                
    # Return the newest logs first
    return logs[-limit:][::-1]