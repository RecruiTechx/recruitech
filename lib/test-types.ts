/**
 * Programming test types and interfaces
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
  isHidden?: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  testCases: TestCase[];
  templateCode: string;
  timeLimit: number; // in milliseconds
}

export interface TestResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  executionTime: number; // in milliseconds
}

export interface SubmissionResult {
  questionId: string;
  code: string;
  results: TestResult[];
  totalPassed: number;
  totalTests: number;
  success: boolean;
  executionTime: number;
  error?: string;
}
