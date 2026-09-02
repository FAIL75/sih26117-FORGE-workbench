import os
import base64
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="sih-local-key")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "uploads"))

def analyze_image(image_filename: str, query: str = "Extract all text and summarize the key findings.") -> str:
    file_path = os.path.join(BASE_DIR, image_filename)
    if not os.path.exists(file_path):
        return f"Error: Image '{image_filename}' not found."
        
    print(f"👁️ [Vision] Scanning '{image_filename}' with Moondream...")
    
    with open(file_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
    mime_type = "image/png" if image_filename.lower().endswith(".png") else "image/jpeg"
        
    try:
        response = client.chat.completions.create(
            model="moondream",
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