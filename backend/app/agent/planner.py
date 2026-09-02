import json
from openai import OpenAI

# Initialize local client
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="sih-local-key"
)

def run_agent_loop(user_prompt: str, tools_schema: list, available_functions: dict, model_name: str = "qwen2.5:3b", max_steps: int = 5):
    print(f"\n🎯 [Agent Task]: {user_prompt}")
    
    # 1. We made the system prompt much more aggressive
    messages = [
        {"role": "system", "content": "You are a specialized agent. You MUST use the tools provided to you. If you need to calculate math, you MUST call 'execute_python_code'. If you need to save a result, you MUST call 'write_file'. Do not try to answer without using tools."},
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
        
        # 2. If it stops without calling tools, let's print exactly what it said
        if not ai_message.tool_calls:
            print("✅ [Agent Finished without calling more tools]")
            # Return the text, or a warning if it spit out blank text
            if ai_message.content:
                return ai_message.content
            else:
                return "[Warning: The model returned a blank response. It might have gotten confused.]"

        messages.append(ai_message)

        for tool_call in ai_message.tool_calls:
            function_name = tool_call.function.name
            
            # 3. Small models sometimes mess up JSON syntax. This try/except block stops the app from crashing.
            try:
                args_str = tool_call.function.arguments
                args = json.loads(args_str) if args_str else {}
            except json.JSONDecodeError:
                print(f"⚠️  [Warning]: Model generated invalid JSON for tool {function_name}. Retrying...")
                args = {}
                
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