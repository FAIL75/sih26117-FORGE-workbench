def fibonacci(n):
 a, b = 0, 1
 for _ in range(n):
 a, b = b, a + b

result = sum_first_n_fibonacci(50)
write_file(filename='fibonacci_result.txt', content=str(result))