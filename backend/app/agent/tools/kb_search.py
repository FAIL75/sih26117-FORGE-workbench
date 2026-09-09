import os
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "vector_db"))

model = None
collection = None
client = OpenAI(base_url="http://localhost:11434/v1", api_key="sih-local-key")

def init_db():
    global model, collection
    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        os.makedirs(BASE_DIR, exist_ok=True)
        chroma_client = chromadb.PersistentClient(path=BASE_DIR)
        collection = chroma_client.get_or_create_collection(name="mrpl_sops")

def grade_document(query: str, document: str) -> bool:
    """
    CRAG Evaluation: Uses the ultra-fast 0.5B model to grade if the chunk actually answers the query.
    """
    system_prompt = (
        "You are an evaluator for an industrial safety system. "
        "Read the User Query and the Retrieved Document. "
        "If the document contains information that helps answer the query, output exactly 'YES'. "
        "If it is unrelated, output exactly 'NO'. Do not output any other text."
    )
    
    try:
        response = client.chat.completions.create(
            model="qwen2.5:0.5b",  # Using the fast router model for grading
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"User Query: {query}\n\nRetrieved Document: {document}"}
            ],
            temperature=0.0,
            max_tokens=5
        )
        return "YES" in response.choices[0].message.content.strip().upper()
    except Exception as e:
        print(f"⚠️ [CRAG Error]: {e}")
        return True # Failsafe: assume relevant if grading fails

def search_knowledge_base(query: str) -> str:
    """
    Searches the internal DB and applies Self-Corrective RAG (CRAG) filtering.
    """
    init_db()
    
    if collection.count() == 0:
        return "Error: The knowledge base is currently empty. No documents have been ingested."
    
    query_embedding = model.encode(query).tolist()
    
    # Retrieve more chunks initially (e.g., top 5) to allow for filtering
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5
    )
    
    if not results['documents'][0]:
        return "No documents found."
        
    formatted_results = "INTERNAL KNOWLEDGE BASE MATCHES:\n"
    relevant_chunks_found = 0
    
    print(f"🔍 [CRAG] Evaluating {len(results['documents'][0])} chunks for relevance to: '{query}'")
    
    for i, doc in enumerate(results['documents'][0]):
        source = results['metadatas'][0][i]['source']
        
        # Step 2: Grade the chunk
        is_relevant = grade_document(query, doc)
        
        if is_relevant:
            relevant_chunks_found += 1
            formatted_results += f"--- Source: {source} ---\n{doc}\n\n"
            print(f"   ✅ Chunk {i+1}: RELEVANT")
        else:
            print(f"   ❌ Chunk {i+1}: IRRELEVANT (Discarded)")
            
    if relevant_chunks_found == 0:
        return (
            "CRAG EVALUATION FAILED: The database found documents, but they were graded as irrelevant "
            "to your specific query. Please try searching with different, more specific keywords."
        )
        
    return formatted_results