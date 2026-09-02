from agent.planner import run_agent_loop
from models.model_router import get_best_model_for_prompt
from agent.tools.file_io import write_file, read_file
from agent.tools.code_sandbox import execute_python_code
from agent.tools.docgen_docx import generate_docx_report
from agent.tools.kb_search import search_knowledge_base
from agent.tools.ocr_vision import analyze_image

TOOLS_SCHEMA = [
    {"type": "function", "function": {"name": "write_file", "description": "Writes text to a file.", "parameters": {"type": "object", "properties": {"filename": {"type": "string"}, "content": {"type": "string"}}, "required": ["filename", "content"]}}},
    {"type": "function", "function": {"name": "execute_python_code", "description": "Executes Python code.", "parameters": {"type": "object", "properties": {"code": {"type": "string"}}, "required": ["code"]}}},
    {"type": "function", "function": {"name": "generate_docx_report", "description": "Generates a Word doc.", "parameters": {"type": "object", "properties": {"filename": {"type": "string"}, "title": {"type": "string"}, "content": {"type": "string"}}, "required": ["filename", "title", "content"]}}},
    {"type": "function", "function": {"name": "search_knowledge_base", "description": "Searches the internal DB.", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}},
    {
        "type": "function",
        "function": {
            "name": "analyze_image",
            "description": "Reads and extracts text/data from a scanned image (PNG/JPG).",
            "parameters": {
                "type": "object",
                "properties": {
                    "image_filename": {"type": "string", "description": "The name of the file (e.g., test_report.png)"},
                    "query": {"type": "string", "description": "What specifically to look for in the image."}
                },
                "required": ["image_filename"]
            }
        }
    }
]

AVAILABLE_FUNCTIONS = {
    "write_file": write_file,
    "execute_python_code": execute_python_code,
    "generate_docx_report": generate_docx_report,
    "search_knowledge_base": search_knowledge_base,
    "analyze_image": analyze_image
}

def test_stage_5_vision():
    print("🚀 Starting Stage 5: Multimodal Processing...")
    
    # The prompt tests the agent's ability to orchestrate vision and document generation
    user_prompt = (
        "Read the scanned document 'test_report.png'. "
        "Extract the key findings, and then use that information to generate a formal Word document "
        "named 'scanned_report_summary.docx' summarizing what you found in the image."
    )
    
    chosen_model = get_best_model_for_prompt(user_prompt)
    
    final_response = run_agent_loop(
        user_prompt=user_prompt,
        tools_schema=TOOLS_SCHEMA,
        available_functions=AVAILABLE_FUNCTIONS,
        model_name=chosen_model
    )
    
    print(f"\n🤖 Final Agent Response:\n{final_response}")

if __name__ == "__main__":
    test_stage_5_vision()