import os

# Define the absolute path to your air-gapped data folder
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "generated_outputs"))

def write_file(filename: str, content: str) -> str:
    """Writes content to a file in the generated_outputs directory."""
    # Ensure the directory exists
    os.makedirs(BASE_DIR, exist_ok=True)
    
    # Secure the path to prevent directory traversal attacks
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(BASE_DIR, safe_filename)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    return f"Success: File written to {file_path}"

def read_file(filename: str) -> str:
    """Reads content from a file in the generated_outputs directory."""
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(BASE_DIR, safe_filename)
    
    if not os.path.exists(file_path):
        return f"Error: File {safe_filename} does not exist."
        
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()