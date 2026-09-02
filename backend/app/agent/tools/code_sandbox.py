import subprocess
import os
import uuid

# We will run the code inside our data folder so it doesn't clutter our backend code
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "generated_outputs"))

def execute_python_code(code: str) -> str:
    """
    Saves the provided Python code to a temporary file, executes it, 
    and returns the standard output (print statements) or errors.
    """
    os.makedirs(BASE_DIR, exist_ok=True)
    
    # Generate a random filename so concurrent tasks don't overwrite each other
    script_name = f"sandbox_script_{uuid.uuid4().hex[:6]}.py"
    script_path = os.path.join(BASE_DIR, script_name)
    
    # Write the LLM's code to the file
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(code)
        
    try:
        # Execute the script using Python. 
        # timeout=10 prevents the LLM from writing an infinite `while True:` loop that freezes your PC.
        result = subprocess.run(
            ["python", script_path],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        # Combine standard output and any error messages
        output = result.stdout
        if result.stderr:
            output += f"\n[ERRORS]:\n{result.stderr}"
            
        # If the code ran but didn't print anything, tell the LLM so it knows it worked
        if not output.strip():
            return "[Success]: Code executed without errors, but nothing was printed to stdout."
            
        return output
        
    except subprocess.TimeoutExpired:
        return "[Error]: Execution timed out after 10 seconds. You might have an infinite loop."
    except Exception as e:
        return f"[System Error]: {str(e)}"