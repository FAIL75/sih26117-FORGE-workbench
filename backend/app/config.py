import os
import yaml
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parents[1]

HARDWARE_PROFILE = os.getenv("HARDWARE_PROFILE", "dev")
REGISTRY_PATH = BASE_DIR / "models" / "registries" / f"registry.{HARDWARE_PROFILE}.yaml"

def get_registry() -> dict:
    """Loads the active hardware profile based on HARDWARE_PROFILE env variable."""
    if not REGISTRY_PATH.exists():
        fallback = BASE_DIR / "models" / "registries" / "registry.dev.yaml"
        with open(fallback, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)["models"]
            
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)["models"]