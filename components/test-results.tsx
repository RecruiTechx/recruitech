'use client';

import type { TestResult } from '@/lib/test-types';

interface TestResultsProps {
  results: TestResult[];
  totalPassed: number;
  totalTests: number;
  error?: string;
  executionTime: number;
}

/**
 * Test results component
 * Displays results of all test cases
 */
export function TestResults({
  results,
  totalPassed,
  totalTests,
  error,
  executionTime,
}: TestResultsProps) {
  const passPercentage = Math.round((totalPassed / totalTests) * 100);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Results</h2>

        {/* Summary Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span
              className={`font-semibold ${
                totalPassed === totalTests ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalPassed === totalTests ? 'Accepted' : 'Failed'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Passed:</span>
            <span className="font-semibold">
              {totalPassed} / {totalTests}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="font-semibold">{passPercentage}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-mono text-sm">{executionTime}ms</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              totalPassed === totalTests ? 'bg-green-600' : 'bg-red-600'
            }`}
            style={{ width: `${passPercentage}%` }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border-b border-border bg-red-50">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Error:</h3>
          <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">
            {error}
          </pre>
        </div>
      )}

      {/* Test Cases */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {results.map((result, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border ${
              result.passed
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-lg font-bold ${
                  result.passed ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {result.passed ? '✓' : '✗'}
              </span>
              <span className="font-semibold text-sm">
                Test Case {result.testCaseIndex + 1}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {result.executionTime}ms
              </span>
            </div>

            {result.error && (
              <div className="mb-2 p-2 bg-red-100 rounded text-xs text-red-800 font-mono">
                {result.error}
              </div>
            )}

            {!result.error && !result.passed && (
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-semibold">Expected:</span>
                  <div className="font-mono text-xs bg-white p-1 rounded mt-0.5">
                    {result.expectedOutput}
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Got:</span>
                  <div className="font-mono text-xs bg-white p-1 rounded mt-0.5">
                    {result.actualOutput}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
