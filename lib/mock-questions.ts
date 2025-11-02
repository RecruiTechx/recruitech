import type { Question } from '@/lib/test-types';

/**
 * Mock programming questions for the test
 */
export const mockQuestions: Question[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nYou may assume that each input has exactly one solution, and you cannot use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'easy',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 9, so we return [0, 1]',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, so we return [1, 2]',
      },
    ],
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        expectedOutput: '[0,1]',
        description: 'Basic case',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]',
        description: 'Different order',
      },
      {
        input: 'nums = [3,3], target = 6',
        expectedOutput: '[0,1]',
        description: 'Duplicate numbers',
      },
    ],
    templateCode: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
    timeLimit: 3000,
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    description:
      'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    difficulty: 'easy',
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'The string "hello" reversed is "olleh"',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: 'The string "Hannah" reversed is "hannaH"',
      },
    ],
    testCases: [
      {
        input: 's = ["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
        description: 'Simple string',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
        description: 'Mixed case string',
      },
      {
        input: 's = ["a"]',
        expectedOutput: '["a"]',
        description: 'Single character',
      },
    ],
    templateCode: `function reverseString(s) {
  // Write your solution here
  
}`,
    timeLimit: 3000,
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    description:
      'Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward.',
    difficulty: 'easy',
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.',
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.',
      },
      {
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.',
      },
    ],
    testCases: [
      {
        input: '121',
        expectedOutput: 'true',
        description: 'Positive palindrome',
      },
      {
        input: '-121',
        expectedOutput: 'false',
        description: 'Negative number',
      },
      {
        input: '10',
        expectedOutput: 'false',
        description: 'Trailing zero',
      },
      {
        input: '0',
        expectedOutput: 'true',
        description: 'Zero',
      },
    ],
    templateCode: `function isPalindrome(x) {
  // Write your solution here
  
}`,
    timeLimit: 3000,
  },
];

/**
 * Get a question by ID
 */
export function getQuestionById(id: string): Question | undefined {
  return mockQuestions.find((q) => q.id === id);
}
