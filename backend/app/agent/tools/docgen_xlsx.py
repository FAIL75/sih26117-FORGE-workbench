import os
import json
from openpyxl import Workbook

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", "data", "generated_outputs"))

def generate_xlsx_report(filename: str, sheet_name: str, data_json_str: str) -> str:
    """
    Generates an Excel spreadsheet (.xlsx). 
    data_json_str must be a stringified list of lists (e.g., '[["Header1", "Header2"], ["Val1", "Val2"]]').
    """
    os.makedirs(BASE_DIR, exist_ok=True)
    
    if not filename.endswith(".xlsx"):
        filename += ".xlsx"
    file_path = os.path.join(BASE_DIR, os.path.basename(filename))
    
    try:
        data = json.loads(data_json_str)
        if not isinstance(data, list):
            raise ValueError("Data must be a JSON array of arrays.")
            
        wb = Workbook()
        ws = wb.active
        ws.title = sheet_name[:31] # Excel limits sheet names to 31 chars
        
        for row in data:
            ws.append(row)
            
        wb.save(file_path)
        return f"Success: Excel file generated and saved at {file_path}"
        
    except json.JSONDecodeError:
        return "Error: data_json_str could not be parsed as valid JSON."
    except Exception as e:
        return f"Error generating Excel file: {str(e)}"