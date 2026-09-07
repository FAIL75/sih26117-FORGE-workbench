# backend/app/agent/tool_registry.py

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