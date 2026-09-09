# backend/app/audit/logger.py

import os
import json
import uuid
import hashlib
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

def get_previous_hash(log_file: Path) -> str:
    """
    Retrieves the hash of the last log entry to maintain the cryptographic chain.
    If the file is new or empty, returns a genesis hash.
    """
    genesis_hash = hashlib.sha256(b"forge_sovereign_genesis_block").hexdigest()
    
    if not log_file.exists():
        return genesis_hash
        
    try:
        # Read the last line of the file efficiently
        with open(log_file, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()
            if not lines:
                return genesis_hash
                
            last_line = lines[-1]
            last_entry = json.loads(last_line)
            return last_entry.get("current_hash", genesis_hash)
            
    except (json.JSONDecodeError, OSError):
        return genesis_hash

def log_event(session_id: str, event_type: str, action: str, metadata: dict = None):
    """
    Writes an immutable, SHA-256 hash-chained event to the daily JSONL audit log.
    event_type: 'USER_PROMPT', 'MODEL_SWAP', 'TOOL_CALL', 'TOOL_RESULT', 'FINAL_ANSWER', 'ERROR'
    """
    log_file = get_today_log_file()
    previous_hash = get_previous_hash(log_file)
    
    # 1. Create the base entry with the previous block's hash included
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "event_type": event_type,
        "action": action,
        "metadata": metadata or {},
        "previous_hash": previous_hash
    }
    
    # 2. Cryptographically hash the current entry
    # Using sort_keys=True is critical to ensure deterministic JSON stringification
    entry_string = json.dumps(log_entry, sort_keys=True)
    current_hash = hashlib.sha256(entry_string.encode('utf-8')).hexdigest()
    
    # 3. Append the current hash to the finalized payload
    log_entry["current_hash"] = current_hash
    
    # 4. Write to the append-only ledger
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")
        
    print(f"📝 [Audit] {event_type} | Hash: {current_hash[:8]}...")

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