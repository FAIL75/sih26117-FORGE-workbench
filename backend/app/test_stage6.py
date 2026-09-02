from agent.tools.code_sandbox import execute_python_code

def test_sandbox_security():
    print("🧪 Running Stage 6 Docker Sandbox Verification...\n")
    
    # Test 1: Standard computation
    print("--- Test 1: Standard Math Execution ---")
    calc_code = "print('Calculated:', sum(i**2 for i in range(10)))"
    res1 = execute_python_code(calc_code)
    print(f"Result:\n{res1}\n")

    # Test 2: Network Exfiltration Attempt (Must fail under --network none)
    print("--- Test 2: Outbound Call Block Verification ---")
    exfil_code = """
import urllib.request
try:
    urllib.request.urlopen('http://www.google.com', timeout=3)
    print('FAIL: Outbound network connection succeeded!')
except Exception as e:
    print('PASS: Outbound connection blocked as expected:', type(e).__name__)
"""
    res2 = execute_python_code(exfil_code)
    print(f"Result:\n{res2}\n")

if __name__ == "__main__":
    test_sandbox_security()