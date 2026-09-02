def fibonacci(n):
 a, b = 0, 1
 for _ in range(n):
 a, b = b, a + b
 return a
def sum_first_n_fibonacci(n):
 return sum(fibonacci(i) for i in range(1, n+1))
result = sum_first_n_fibonacci(50)
write_file(filename='fibonacci_result.txt', content=str(result))