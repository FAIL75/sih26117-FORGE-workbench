import os
import chromadb
from sentence_transformers import SentenceTransformer

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "vector_db"))
# Keep model loaded in memory globally so it doesn't reload on every search
model = None
collection = None

def init_db():
    global model, collection
    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        chroma_client = chromadb.PersistentClient(path=BASE_DIR)
        collection = chroma_client.get_collection(name="mrpl_sops")

def search_knowledge_base(query: str) -> str:
    """
    Searches the secure internal local knowledge base for relevant documents.
    """
    init_db()
    
    # Embed the user's question
    query_embedding = model.encode(query).tolist()
    
    # Search ChromaDB for the top 3 closest matches
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    
    if not results['documents'][0]:
        return "No relevant internal documents found."
        
    # Format the results for the LLM to read
    formatted_results = "INTERNAL KNOWLEDGE BASE MATCHES:\n"
    for i, doc in enumerate(results['documents'][0]):
        source = results['metadatas'][0][i]['source']
        formatted_results += f"--- Source: {source} ---\n{doc}\n\n"
        
    return formatted_results