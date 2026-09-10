FROM python:3.11-slim

# Install system dependencies required for Docker-in-Docker and ChromaDB
RUN apt-get update && apt-get install -y \
    docker.io \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install the Python dependencies directly
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    openai \
    chromadb \
    sentence-transformers \
    python-docx \
    openpyxl \
    python-pptx \
    pyyaml \
    requests

# Expose the FastAPI port
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]