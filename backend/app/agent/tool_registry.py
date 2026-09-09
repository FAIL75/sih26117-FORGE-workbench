from agent.tools.file_io import write_file, read_file
from agent.tools.code_sandbox import execute_python_code
from agent.tools.docgen_docx import generate_docx_report
from agent.tools.docgen_xlsx import generate_xlsx_report     # NEW
from agent.tools.docgen_pptx import generate_pptx_report     # NEW
from agent.tools.kb_search import search_knowledge_base
from agent.tools.ocr_vision import analyze_image

TOOLS_SCHEMA = [
    {"type": "function", "function": {"name": "write_file", "description": "Writes text to a file.", "parameters": {"type": "object", "properties": {"filename": {"type": "string"}, "content": {"type": "string"}}, "required": ["filename", "content"]}}},
    {"type": "function", "function": {"name": "execute_python_code", "description": "Executes Python code isolated in a sandbox. Good for math.", "parameters": {"type": "object", "properties": {"code": {"type": "string"}}, "required": ["code"]}}},
    {"type": "function", "function": {"name": "generate_docx_report", "description": "Generates a Word doc.", "parameters": {"type": "object", "properties": {"filename": {"type": "string"}, "title": {"type": "string"}, "content": {"type": "string"}}, "required": ["filename", "title", "content"]}}},
    
    # NEW SCHEMA: Excel
    {"type": "function", "function": {"name": "generate_xlsx_report", "description": "Generates an Excel spreadsheet.", "parameters": {"type": "object", "properties": {"filename": {"type": "string"}, "sheet_name": {"type": "string"}, "data_json_str": {"type": "string", "description": "A JSON string of a 2D array, e.g. '[[\"Col1\",\"Col2\"],[\"1\",\"2\"]]'"}}, "required": ["filename", "sheet_name", "data_json_str"]}}},
    
    # NEW SCHEMA: PowerPoint
    {"type": "function", "function": {"name": "generate_pptx_report", "description": "Generates a PowerPoint presentation.", "parameters": {"type": "object", "properties": {"filename": {"type": "string"}, "title": {"type": "string"}, "slides_json_str": {"type": "string", "description": "A JSON string of slide dictionaries, e.g. '[{\"title\":\"Slide 1\",\"content\":\"Text\"}]'"}}, "required": ["filename", "title", "slides_json_str"]}}},
    
    {"type": "function", "function": {"name": "search_knowledge_base", "description": "Searches the internal DB.", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}},
    {"type": "function", "function": {"name": "analyze_image", "description": "Extracts text from an image.", "parameters": {"type": "object", "properties": {"image_filename": {"type": "string"}, "query": {"type": "string"}}, "required": ["image_filename"]}}}
]

AVAILABLE_FUNCTIONS = {
    "write_file": write_file,
    "execute_python_code": execute_python_code,
    "generate_docx_report": generate_docx_report,
    "generate_xlsx_report": generate_xlsx_report,    # NEW
    "generate_pptx_report": generate_pptx_report,    # NEW
    "search_knowledge_base": search_knowledge_base,
    "analyze_image": analyze_image
}