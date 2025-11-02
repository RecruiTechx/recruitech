import type { Question, TestResult, SubmissionResult } from '@/lib/test-types';

/**
 * Safe code execution environment
 * Evaluates user code and checks against test cases
 */

interface ExecutionContext {
  // Allow common functions
  console: Console;
  Math: Math;
  Array: ArrayConstructor;
  String: StringConstructor;
  Number: NumberConstructor;
  Object: ObjectConstructor;
  JSON: JSON;
  parseInt: typeof parseInt;
  parseFloat: typeof parseFloat;
  isNaN: typeof isNaN;
}

/**
 * Create a safe execution context
 */
function createExecutionContext(): ExecutionContext {
  return {
    console,
    Math,
    Array,
    String,
    Number,
    Object,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
  };
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
    // If JSON parse fails, try to evaluate
    try {
      // eslint-disable-next-line no-eval
      return eval('(' + str + ')');
    } catch {
      // Return as string if all else fails
      return str;
    }
  }
}

/**
 * Run user code against a single test case
 */
function runTestCase(
  userCode: string,
  input: string,
  expectedOutput: string,
  timeLimit: number
): TestResult {
  const testCaseIndex = 0;
  const startTime = Date.now();

  try {
    // Create execution context
    const context = createExecutionContext();

    // Create a function that executes the user code and test
    const testFunction = new Function(
      ...Object.keys(context),
      `
      ${userCode}
      // Parse input and expected output
      const testInput = ${JSON.stringify(input)};
      const inputValue = (${parseValue.toString()})(testInput);
      
      // Execute the user's function
      let result;
      if (typeof inputValue === 'string') {
        result = eval('twoSum' in this ? twoSum(inputValue) : isPalindrome(inputValue) : reverseString(inputValue)');
      } else if (Array.isArray(inputValue)) {
        result = eval('twoSum' in this ? twoSum(inputValue.slice(0, -1), inputValue[inputValue.length - 1]) : reverseString(inputValue)');
      } else {
        result = eval(Object.keys(this).filter(k => typeof this[k] === 'function')[0] + '(' + JSON.stringify(inputValue) + ')');
      }
      
      return JSON.stringify(result);
      `
    );

    const actualOutput = testFunction(...Object.values(context));
    const executionTime = Date.now() - startTime;

    // Check if time limit exceeded
    if (executionTime > timeLimit) {
      return {
        testCaseIndex,
        input,
        expectedOutput,
        actualOutput: '',
        passed: false,
        error: `Time Limit Exceeded (${executionTime}ms > ${timeLimit}ms)`,
        executionTime,
      };
    }

    // Compare outputs
    const expected = parseValue(expectedOutput);
    const actual = parseValue(actualOutput);

    const passed =
      JSON.stringify(expected) === JSON.stringify(actual);

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
 * Submit code and run all test cases
 */
export async function submitCode(
  question: Question,
  code: string
): Promise<SubmissionResult> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  try {
    // Run each test case
    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];
      const result = runTestCase(
        code,
        testCase.input,
        testCase.expectedOutput,
        question.timeLimit
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
 * Run code with a timeout
 */
export function runCodeWithTimeout(
  code: string,
  timeLimit: number
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Execution timeout'));
    }, timeLimit);

    try {
      const context = createExecutionContext();
      const fn = new Function(...Object.keys(context), code);
      const result = fn(...Object.values(context));
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}
