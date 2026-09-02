import requests
import time

OLLAMA_BASE_URL = "http://localhost:11434"

def load_model(model_name: str):
    print(f"⏳ [VRAM] Loading {model_name} into GPU...")
    start_time = time.time()
    
    # Sending an empty request with keep_alive forces Ollama to load it into VRAM
    requests.post(f"{OLLAMA_BASE_URL}/api/generate", json={
        "model": model_name,
        "keep_alive": "5m"
    })
    
    elapsed = round(time.time() - start_time, 2)
    print(f"✅ [VRAM] {model_name} loaded in {elapsed}s")

def unload_model(model_name: str):
    print(f"🧹 [VRAM] Evicting {model_name} to free space...")
    requests.post(f"{OLLAMA_BASE_URL}/api/generate", json={
        "model": model_name,
        "keep_alive": 0  # 0 forces immediate eviction
    })