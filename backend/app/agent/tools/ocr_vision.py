import os
import base64
import yaml
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="sih-local-key")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "uploads"))

def get_vision_model() -> str:
    """Reads the configured vision model from the hardware registry."""
    registry_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models/registries/registry.dev.yaml"))
    with open(registry_path, "r") as f:
        registry = yaml.safe_load(f)["models"]
    return registry.get("vision", {}).get("id", "moondream")

def analyze_image(image_filename: str, query: str = "Extract all text and summarize the key findings.") -> str:
    # SECURE: Strip any directory paths to prevent path traversal attacks (e.g. ../../secret.png)
    safe_filename = os.path.basename(image_filename)
    file_path = os.path.join(BASE_DIR, safe_filename)
    
    if not os.path.exists(file_path):
        return f"Error: Image '{safe_filename}' not found."
        
    # DYNAMIC: Fetch the model from the registry instead of hardcoding
    vision_model = get_vision_model()
    print(f"👁️ [Vision] Scanning '{safe_filename}' with {vision_model}...")
    
    with open(file_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
    mime_type = "image/png" if safe_filename.lower().endswith(".png") else "image/jpeg"
        
    try:
        response = client.chat.completions.create(
            model=vision_model,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": query},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}}
                ]
            }],
            temperature=0.1 
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error analyzing image: {str(e)}"