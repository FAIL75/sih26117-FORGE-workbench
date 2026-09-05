import json
from openai import OpenAI
from audit.logger import log_event, generate_session_id # <--- NEW IMPORT

client = OpenAI(base_url="http://localhost:11434/v1", api_key="sih-local-key")

def run_agent_loop(user_prompt: str, tools_schema: list, available_functions: dict, model_name: str = "qwen2.5:3b", max_steps: int = 5):
    session_id = generate_session_id() # <--- NEW
    
    log_event(session_id, "USER_PROMPT", "Received new task from terminal", {"prompt": user_prompt})
    print(f"\n🎯 [Agent Task]: {user_prompt}")
    
    system_prompt = (
        "You are a specialized agent. You MUST use the tools provided to you. "
        "If you need to calculate math or process data, call 'execute_python_code'. "
        "CRITICAL RULE: Code run via execute_python_code is fully isolated — it CANNOT call write_file, "
        "read_file, or any other tool. It can only use standard Python and print() its output. "
        "To save a result to a file, first compute it in execute_python_code, read the printed output, "
        "and then call write_file as a SEPARATE tool call with that result."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    step = 0
    while step < max_steps:
        step += 1
        
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            tools=tools_schema,
            tool_choice="auto" 
        )
        
        ai_message = response.choices[0].message
        
        if not ai_message.tool_calls:
            log_event(session_id, "FINAL_ANSWER", "Agent completed task", {"content": ai_message.content})
            return ai_message.content if ai_message.content else "[Warning: Blank response]"

        messages.append(ai_message)

        for tool_call in ai_message.tool_calls:
            function_name = tool_call.function.name
            
            valid_json = True
            try:
                args_str = tool_call.function.arguments
                args = json.loads(args_str) if args_str else {}
            except json.JSONDecodeError:
                args = {}
                valid_json = False
                
            if not valid_json:
                tool_result = "Error: Invalid JSON."
                log_event(session_id, "ERROR", "LLM Hallucinated invalid JSON", {"function": function_name})
            else:
                log_event(session_id, "TOOL_CALL", f"Executing {function_name}", {"args": args})
                
                if function_name in available_functions:
                    function_to_call = available_functions[function_name]
                    try:
                        tool_result = function_to_call(**args)
                        log_event(session_id, "TOOL_RESULT", f"Success: {function_name}", {"result": str(tool_result)[:500]})
                    except Exception as e:
                        tool_result = f"Error executing tool: {str(e)}"
                        log_event(session_id, "ERROR", f"Tool execution failed: {function_name}", {"error": str(e)})
                else:
                    tool_result = f"Error: Tool {function_name} not found."
            
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": function_name,
                "content": str(tool_result)
            })

    error_msg = "Reached maximum steps without completing the task."
    log_event(session_id, "ERROR", error_msg, {"max_steps": max_steps})
    return f"⚠️ [Agent Error]: {error_msg}"