import json
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="sih-local-key")

def run_agent_loop(user_prompt: str, tools_schema: list, available_functions: dict, model_name: str = "qwen2.5:3b", max_steps: int = 5):
    print(f"\n🎯 [Agent Task]: {user_prompt}")
    
    # 1. FIXED PROMPT: Explicitly explain the sandbox isolation boundary
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
        print(f"\n🔄 [Step {step}] Thinking...")

        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            tools=tools_schema,
            tool_choice="auto" 
        )
        
        ai_message = response.choices[0].message
        
        if not ai_message.tool_calls:
            print("✅ [Agent Finished without calling more tools]")
            return ai_message.content if ai_message.content else "[Warning: Blank response]"

        messages.append(ai_message)

        for tool_call in ai_message.tool_calls:
            function_name = tool_call.function.name
            
            # 2. FIXED JSON HANDLING: Give feedback to the LLM instead of failing silently
            valid_json = True
            try:
                args_str = tool_call.function.arguments
                args = json.loads(args_str) if args_str else {}
            except json.JSONDecodeError:
                print(f"⚠️  [Warning]: Model generated invalid JSON for tool {function_name}. Forcing retry...")
                args = {}
                valid_json = False
                
            if not valid_json:
                tool_result = "Error: You provided invalid JSON arguments. Please fix your syntax and call the tool again."
            else:
                print(f"🛠️  [Executing Tool]: {function_name} | Args: {args}")
                if function_name in available_functions:
                    function_to_call = available_functions[function_name]
                    try:
                        tool_result = function_to_call(**args)
                        print(f"📄 [Tool Result]: {tool_result}")
                    except Exception as e:
                        tool_result = f"Error executing tool: {str(e)}"
                        print(f"❌ [Tool Error]: {tool_result}")
                else:
                    tool_result = f"Error: Tool {function_name} not found."
            
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": function_name,
                "content": str(tool_result)
            })

    return "⚠️ [Agent Error]: Reached maximum steps without completing the task."