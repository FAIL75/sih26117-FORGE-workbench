import os
import yaml
from openai import OpenAI
from .swap_manager import load_model, unload_model

client = OpenAI(base_url="http://localhost:11434/v1", api_key="sih-local-key")

def load_registry():
    # Load the dev profile YAML
    registry_path = os.path.join(os.path.dirname(__file__), "registries", "registry.dev.yaml")
    with open(registry_path, "r") as f:
        return yaml.safe_load(f)["models"]

def classify_task(prompt: str, router_model: str) -> str:
    """Uses the tiny router model to classify the user's intent."""
    print(f"🧠 [Router] Classifying task using {router_model}...")
    
    system_prompt = (
        "You are a router. Read the user's prompt and output EXACTLY ONE WORD from this list: "
        "[CODE, DOC, GENERAL]. "
        "If they ask for math, python, or calculation, output CODE. "
        "If they ask to summarize a report or write a document, output DOC. "
        "Otherwise output GENERAL."
    )
    
    response = client.chat.completions.create(
        model=router_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,
        max_tokens=10
    )
    
    category = response.choices[0].message.content.strip().upper()
    
    if "CODE" in category: return "code"
    if "DOC" in category: return "general"
    return "general"

def get_best_model_for_prompt(prompt: str) -> str:
    """Classifies the prompt, unloads the router, and loads the target model."""
    registry = load_registry()
    router_id = registry["router"]["id"]
    
    # 1. Load the router model to classify the task
    load_model(router_id)
    task_type = classify_task(prompt, router_id)
    print(f"🎯 [Router] Task classified as: {task_type.upper()}")
    
    # 2. Look up the best model for this task in the registry
    target_model_id = registry[task_type]["id"]
    
    # 3. Swap VRAM!
    if target_model_id != router_id:
        unload_model(router_id)
        load_model(target_model_id)
        
    return target_model_id