import subprocess
import uuid

def execute_python_code(code: str) -> str:
    """
    Executes Python code in a containerized environment isolated from the host.
    Enforces:
      - --network none: Zero outbound network connectivity
      - --memory 256m: Strict memory ceiling
      - --cpus 0.5: CPU thread throttling
      - In-Memory Execution: Code is piped via stdin, requiring no host volume mounts.
    """
    script_id = uuid.uuid4().hex[:8]
    
    # Notice the '-i' (interactive) flag, and the '-' at the end telling Python to read from stdin
    docker_cmd = [
        "docker", "run", "-i", "--rm",
        "--name", f"sandbox_{script_id}",
        "--network", "none",
        "--memory", "256m",
        "--cpus", "0.5",
        "python:3.11-slim",
        "python3", "-" 
    ]

    try:
        # We pass the LLM's code directly into the container using the 'input' argument
        result = subprocess.run(
            docker_cmd,
            input=code,
            capture_output=True,
            text=True,
            timeout=15
        )

        output = result.stdout
        if result.stderr:
            output += f"\n[CONTAINER STDERR]:\n{result.stderr}"

        if not output.strip() and result.returncode == 0:
            return "[Success]: Script ran with exit code 0, but produced no stdout. Ensure print() is used."

        return output.strip()

    except subprocess.TimeoutExpired:
        # Terminate hung container
        subprocess.run(["docker", "rm", "-f", f"sandbox_{script_id}"], capture_output=True)
        return "[Error]: Execution aborted: 15-second CPU timeout exceeded."

    except FileNotFoundError:
        return "[Fatal]: Docker daemon is not accessible. Verify Docker socket is mounted."

    except Exception as e:
        return f"[Execution Error]: {str(e)}"