import subprocess
import threading
import queue
import re

log_queue = queue.Queue()

def tail_kernel_audit_logs():
    """
    Tails the system journal for iptables DROP logs matching the sovereign breach prefix.
    """
    cmd = ["journalctl", "-f", "-n", "0", "--grep", "SOVEREIGN_BREACH_ALERT"]
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        for line in process.stdout:
            if line:
                log_queue.put(line.strip())
    except Exception as e:
        # Fallback for environments where journalctl isn't active (e.g. Windows host testing)
        log_queue.put(f"[Audit Monitor Notice]: Live journalctl unavailable on this host ({str(e)}). Running mock telemetry.")

def start_audit_daemon():
    t = threading.Thread(target=tail_kernel_audit_logs, daemon=True)
    t.start()