import os
import chromadb
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "vector_db"))

model = None
collection = None

def init_db():
    global model, collection
    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        # Ensure the directory exists just in case
        os.makedirs(BASE_DIR, exist_ok=True)
        chroma_client = chromadb.PersistentClient(path=BASE_DIR)
        
        # RESILIENCE FIX: This guarantees it will never crash even if the DB is empty
        collection = chroma_client.get_or_create_collection(name="mrpl_sops")

def search_knowledge_base(query: str) -> str:
    """
    Searches the secure internal local knowledge base for relevant documents.
    """
    init_db()
    
    # Check if the collection actually has any documents in it
    if collection.count() == 0:
        return "Error: The knowledge base is currently empty. No documents have been ingested."
    
    query_embedding = model.encode(query).tolist()
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    
    if not results['documents'][0]:
        return "No relevant internal documents found."
        
    formatted_results = "INTERNAL KNOWLEDGE BASE MATCHES:\n"
    for i, doc in enumerate(results['documents'][0]):
        source = results['metadatas'][0][i]['source']
        formatted_results += f"--- Source: {source} ---\n{doc}\n\n"
        
    return formatted_results