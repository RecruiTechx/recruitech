import type { Question, TestResult, SubmissionResult } from '@/lib/test-types';

/**
 * Piston API Code Execution
 * Uses the public Piston API to execute code safely
 */

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: {
    name?: string;
    content: string;
  }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
    message: string | null;
    status: string | null;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
    message: string | null;
    status: string | null;
  };
}

/**
 * Execute code using Piston API
 */
async function executePistonCode(
  code: string,
  language: string = 'javascript',
  version: string = '18.15.0',
  stdin: string = '',
  timeout: number = 3000
): Promise<PistonExecuteResponse> {
  // Determine file extension based on language
  const fileExtensions: Record<string, string> = {
    javascript: 'js',
    python: 'py',
  };
  const fileName = `main.${fileExtensions[language] || 'txt'}`;

  const response = await fetch(`${PISTON_API_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language,
      version,
      files: [
        {
          name: fileName,
          content: code,
        },
      ],
      stdin,
      run_timeout: timeout,
    } as PistonExecuteRequest),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Parse a test case value (string representation)
 */
function parseValue(str: string): any {
  try {
    // Remove surrounding whitespace
    const trimmed = str.trim();

    // Try JSON parse first
    return JSON.parse(trimmed);
  } catch {
    // If JSON parse fails, try to evaluate as JavaScript
    try {
      // Handle format like "nums = [2,7,11,15], target = 9"
      // Convert '=' to ':' for proper object literal syntax
      const objectStr = str.replace(/(\w+)\s*=/g, '$1:');
      // eslint-disable-next-line no-eval
      const evaluated = eval('({' + objectStr + '})');
      return evaluated;
    } catch (e) {
      // If that fails, try direct eval with parentheses
      try {
        // eslint-disable-next-line no-eval
        return eval('(' + str + ')');
      } catch {
        // Return as string if all else fails
        return str;
      }
    }
  }
}

/**
 * Run user code against a single test case using Piston API
 */
async function runTestCase(
  userCode: string,
  functionName: string,
  input: string,
  expectedOutput: string,
  timeLimit: number,
  language: string = 'javascript'
): Promise<TestResult> {
  const testCaseIndex = 0;
  const startTime = Date.now();

  try {
    // Parse the input
    const inputValue = parseValue(input);
    
    // Create the test wrapper code based on language
    let testCode: string;
    let languageVersion: string;

    if (language === 'python') {
      // Python test wrapper
      const inputStr = JSON.stringify(inputValue);
      testCode = `
import json

${userCode}

# Test execution - parse input data
input_value = json.loads(r'''${inputStr}''')

# Call the function with appropriate arguments
if isinstance(input_value, dict):
    # For functions with multiple parameters (e.g., two_sum(nums, target))
    # Extract values in order they appear (Python 3.7+ preserves dict order)
    values = list(input_value.values())
    
    if len(values) >= 2:
        # Two or more parameters
        result = ${functionName}(values[0], values[1])
        # If result is None (in-place modification), use the first argument
        if result is None:
            result = values[0]
    elif len(values) == 1:
        # Single parameter from dict
        arg = values[0]
        result = ${functionName}(arg)
        # If result is None (in-place modification), use the argument
        if result is None:
            result = arg
    else:
        result = None
elif isinstance(input_value, list):
    # For functions that take a list argument
    result = ${functionName}(input_value)
    if result is None:
        result = input_value
else:
    # For single primitive argument (int, str, etc.)
    result = ${functionName}(input_value)

# Output result as JSON
print(json.dumps(result))
`;
      languageVersion = '3.10.0';
    } else {
      // JavaScript test wrapper
      testCode = `
${userCode}

// Test execution
const input = ${JSON.stringify(inputValue)};
let result;

// Call the function with appropriate arguments
if (Array.isArray(input) && input.length === 2 && typeof input[1] === 'number') {
  // For twoSum(nums, target)
  result = ${functionName}(input[0], input[1]);
} else {
  // For single argument functions
  result = ${functionName}(input);
}

// Output result as JSON
console.log(JSON.stringify(result));
`;
      languageVersion = '18.15.0';
    }

    // Execute code using Piston
    const pistonResponse = await executePistonCode(
      testCode,
      language,
      languageVersion,
      '',
      timeLimit
    );

    const executionTime = Date.now() - startTime;

    // Check for errors
    if (pistonResponse.run.stderr) {
      return {
        testCaseIndex,
        input,
        expectedOutput,
        actualOutput: '',
        passed: false,
        error: pistonResponse.run.stderr.trim(), // Full error message
        executionTime,
      };
    }

    // Check for timeout or other issues
    if (pistonResponse.run.signal === 'SIGKILL') {
      return {
        testCaseIndex,
        input,
        expectedOutput,
        actualOutput: '',
        passed: false,
        error: 'Time Limit Exceeded',
        executionTime,
      };
    }

    // Get the output
    const actualOutput = pistonResponse.run.stdout.trim();

    // Compare outputs
    const expected = parseValue(expectedOutput);
    const actual = parseValue(actualOutput);

    const passed = JSON.stringify(expected) === JSON.stringify(actual);

    return {
      testCaseIndex,
      input,
      expectedOutput,
      actualOutput,
      passed,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      testCaseIndex,
      input,
      expectedOutput,
      actualOutput: '',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
    };
  }
}

/**
 * Extract function name from code
 */
function extractFunctionName(code: string, language: string = 'javascript'): string {
  if (language === 'python') {
    // Match Python function definitions: def function_name(
    const pythonMatch = code.match(/def\s+(\w+)\s*\(/);
    if (pythonMatch) {
      return pythonMatch[1];
    }
    return 'solution';
  } else {
    // Match JavaScript function declarations: function name() or const name = function()
    const functionMatch = code.match(/function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*function|const\s+(\w+)\s*=\s*\(/);
    if (functionMatch) {
      return functionMatch[1] || functionMatch[2] || functionMatch[3];
    }
    return 'solution';
  }
}

/**
 * Submit code and run all test cases using Piston API
 */
export async function submitCode(
  question: Question,
  code: string,
  language: 'javascript' | 'python' = 'javascript'
): Promise<SubmissionResult> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  try {
    // Extract function name from code
    const functionName = extractFunctionName(code, language);

    // Run each test case sequentially (to respect rate limits)
    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];
      
      // Small delay between requests to respect rate limiting (5 req/sec = 200ms)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const result = await runTestCase(
        code,
        functionName,
        testCase.input,
        testCase.expectedOutput,
        question.timeLimit,
        language
      );
      result.testCaseIndex = i;
      results.push(result);
    }

    const totalPassed = results.filter((r) => r.passed).length;
    const totalTests = results.length;
    const executionTime = Date.now() - startTime;

    return {
      questionId: question.id,
      code,
      results,
      totalPassed,
      totalTests,
      success: totalPassed === totalTests,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      questionId: question.id,
      code,
      results,
      totalPassed: 0,
      totalTests: question.testCases.length,
      success: false,
      executionTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run code with Piston API
 */
export async function runCodeWithTimeout(
  code: string,
  timeLimit: number
): Promise<string> {
  try {
    const result = await executePistonCode(code, 'javascript', '18.15.0', '', timeLimit);
    
    if (result.run.stderr) {
      throw new Error(result.run.stderr);
    }
    
    return result.run.stdout;
  } catch (error) {
    throw error;
  }
}
