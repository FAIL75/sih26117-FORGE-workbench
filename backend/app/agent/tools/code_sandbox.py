import subprocess
import os
import uuid
from pathlib import Path

# Base directory for sandboxed scripts
SANDBOX_DIR = Path(__file__).resolve().parents[3] / "data" / "sandbox_workspace"

def execute_python_code(code: str) -> str:
    """
    Executes Python code in a containerized environment isolated from the host.
    Enforces:
      - --network none: Zero outbound network connectivity
      - --memory 256m: Strict memory ceiling
      - --cpus 0.5: CPU thread throttling
      - Read/Write isolation restricted only to the workspace mount
    """
    SANDBOX_DIR.mkdir(parents=True, exist_ok=True)
    
    script_id = uuid.uuid4().hex[:8]
    script_filename = f"task_{script_id}.py"
    host_script_path = SANDBOX_DIR / script_filename

    # Write code to the host directory mounted into the container
    with open(host_script_path, "w", encoding="utf-8") as f:
        f.write(code)

    # Convert Windows path format for Docker volume binding
    docker_mount_path = str(SANDBOX_DIR).replace("\\", "/")

    docker_cmd = [
        "docker", "run", "--rm",
        "--name", f"sandbox_{script_id}",
        "--network", "none",
        "--memory", "256m",
        "--cpus", "0.5",
        "-v", f"{docker_mount_path}:/workspace:rw",
        "-w", "/workspace",
        "python:3.11-slim",
        "python", script_filename
    ]

    try:
        result = subprocess.run(
            docker_cmd,
            capture_output=True,
            text=True,
            timeout=15
        )

        output = result.stdout
        if result.stderr:
            output += f"\n[CONTAINER STDERR]:\n{result.stderr}"

        if not output.strip():
            return "[Success]: Script ran with exit code 0, but produced no stdout. Ensure print() is used."

        return output.strip()

    except subprocess.TimeoutExpired:
        # Terminate hung container
        subprocess.run(["docker", "rm", "-f", f"sandbox_{script_id}"], capture_output=True)
        return "[Error]: Execution aborted: 15-second CPU timeout exceeded."

    except FileNotFoundError:
        return "[Fatal]: Docker daemon is not accessible. Verify Docker Desktop is active."

    except Exception as e:
        return f"[Execution Error]: {str(e)}"

    finally:
        # Cleanup executed script file
        if host_script_path.exists():
            try:
                os.remove(host_script_path)
            except OSError:
                pass