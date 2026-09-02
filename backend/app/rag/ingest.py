import os
import chromadb
from sentence_transformers import SentenceTransformer

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
RAW_DOCS_DIR = os.path.join(BASE_DIR, "knowledge_base", "raw_docs")
DB_DIR = os.path.join(BASE_DIR, "data", "vector_db")

def ingest_documents():
    print("🚀 Starting Local RAG Ingestion...")
    
    # 1. Initialize local ChromaDB client (saves to disk)
    os.makedirs(DB_DIR, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=DB_DIR)
    
    # 2. Create or get the collection (table)
    collection = chroma_client.get_or_create_collection(name="mrpl_sops")
    
    # 3. Load an ultra-lightweight CPU embedding model (<150MB)
    print("🧠 Loading local CPU embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 4. Read all files in the raw_docs folder
    for filename in os.listdir(RAW_DOCS_DIR):
        if filename.endswith(".txt"):
            file_path = os.path.join(RAW_DOCS_DIR, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Basic chunking (splitting by newlines for simplicity in the MVP)
            chunks = [chunk.strip() for chunk in content.split("\n") if chunk.strip()]
            
            print(f"📄 Processing {filename} ({len(chunks)} chunks)...")
            
            # 5. Generate embeddings and store in Chroma
            for i, chunk in enumerate(chunks):
                doc_id = f"{filename}_chunk_{i}"
                embedding = model.encode(chunk).tolist()
                
                collection.upsert(
                    documents=[chunk],
                    embeddings=[embedding],
                    metadatas=[{"source": filename}],
                    ids=[doc_id]
                )
                
    print("✅ Ingestion complete. Database secured on local disk.")

if __name__ == "__main__":
    ingest_documents()