# Python Test Solutions

This document contains the correct Python solutions for all test questions.

---

## Question 1: Two Sum

**Problem**: Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to target.

### ✅ Correct Python Solution:

```python
def two_sum(nums, target):
    # Create a dictionary to store numbers and their indices
    seen = {}
    
    # Iterate through the array with index
    for i, num in enumerate(nums):
        # Calculate the complement we're looking for
        complement = target - num
        
        # Check if complement exists in our dictionary
        if complement in seen:
            # Found it! Return both indices
            return [seen[complement], i]
        
        # Store current number and its index
        seen[num] = i
    
    # No solution found (shouldn't happen per problem constraints)
    return []
```

**Time Complexity**: O(n)  
**Space Complexity**: O(n)

**How it works**:
1. Use a dictionary to store each number we've seen and its index
2. For each number, calculate what value we need to reach the target
3. If we've already seen that value, we found our pair!
4. Otherwise, store the current number for future lookups

---

## Question 2: Reverse String

**Problem**: Reverse a string given as an array of characters. Must modify in-place with O(1) extra memory.

### ✅ Correct Python Solution:

```python
def reverse_string(s):
    # Two pointers approach
    left = 0
    right = len(s) - 1
    
    # Swap elements from both ends moving towards center
    while left < right:
        # Swap characters at left and right positions
        s[left], s[right] = s[right], s[left]
        
        # Move pointers towards center
        left += 1
        right -= 1
    
    # Return the modified list for testing
    # (In-place modification means the original list is changed,
    # but we return it so the test system can verify the result)
    return s
```

**Alternative Solution (Python-specific)**:
```python
def reverse_string(s):
    # Python's built-in reverse (still in-place)
    s.reverse()
    return s
```

**Alternative Solution (Slicing)**:
```python
def reverse_string(s):
    # Use slice assignment for in-place reversal
    s[:] = s[::-1]
    return s
```

**Time Complexity**: O(n)  
**Space Complexity**: O(1)

---

## Question 3: Palindrome Number

**Problem**: Determine if an integer is a palindrome (reads the same backward as forward).

### ✅ Correct Python Solution (String Approach):

```python
def is_palindrome(x):
    # Negative numbers are not palindromes
    if x < 0:
        return False
    
    # Convert to string and compare with reversed version
    str_x = str(x)
    return str_x == str_x[::-1]
```

### ✅ Alternative Solution (Mathematical Approach):

```python
def is_palindrome(x):
    # Negative numbers and numbers ending in 0 (except 0) are not palindromes
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    
    # Reverse half of the number
    reversed_half = 0
    while x > reversed_half:
        reversed_half = reversed_half * 10 + x % 10
        x //= 10
    
    # Check if the number equals its reverse
    # For odd-length numbers, we can ignore the middle digit
    return x == reversed_half or x == reversed_half // 10
```

**Time Complexity**: O(log n) for mathematical, O(n) for string  
**Space Complexity**: O(1) for mathematical, O(n) for string

---

## Testing Your Solutions

To test these solutions in the code editor:

1. **Switch to Python mode** using the language toggle in the editor
2. **Copy the solution** into the editor
3. **Click "Run Code"** to test against all test cases
4. **All tests should pass** ✅

## Tips for Python in the Editor

- Function names use `snake_case` (e.g., `two_sum`, not `twoSum`)
- Use `True`/`False` (capitalized) for booleans
- Use `None` instead of `null`
- List indexing and slicing: `s[0]`, `s[::-1]`, etc.
- Dictionary methods: `in`, `dict.get()`, `enumerate()`
- Python swap: `a, b = b, a`

## Common Python Patterns

### Dictionary/HashMap
```python
seen = {}
seen[key] = value
if key in seen:
    value = seen[key]
```

### Two Pointers
```python
left, right = 0, len(arr) - 1
while left < right:
    # Process
    left += 1
    right -= 1
```

### Enumerate (Index + Value)
```python
for i, value in enumerate(arr):
    print(f"Index {i}: {value}")
```

---

**Good luck with your coding test!** 🐍✨
