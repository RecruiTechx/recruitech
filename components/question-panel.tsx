'use client';

import type { Question } from '@/lib/test-types';

interface QuestionPanelProps {
  question: Question;
}

/**
 * Question panel component
 * Displays problem description, examples, and constraints
 */
export function QuestionPanel({ question }: QuestionPanelProps) {
  return (
    <div className="h-full flex flex-col overflow-auto bg-card border-r border-border">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{question.title}</h1>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${
                question.difficulty === 'easy'
                  ? 'bg-green-100 text-green-800'
                  : question.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {question.difficulty.charAt(0).toUpperCase() +
                question.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {question.description}
          </p>
        </div>

        {/* Examples */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Examples</h2>
          <div className="space-y-3">
            {question.examples.map((example, idx) => (
              <div key={idx} className="bg-slate-900 text-slate-50 p-4 rounded">
                <div className="mb-2">
                  <span className="font-semibold">Example {idx + 1}:</span>
                </div>
                <div className="space-y-1 font-mono text-sm">
                  <div>
                    <span className="text-blue-400">Input:</span> {example.input}
                  </div>
                  <div>
                    <span className="text-blue-400">Output:</span> {example.output}
                  </div>
                  <div>
                    <span className="text-blue-400">Explanation:</span>{' '}
                    {example.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases Info */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Test Cases</h2>
          <p className="text-muted-foreground">
            {question.testCases.length} test cases available
            {question.testCases.some((tc) => tc.isHidden) &&
              ` (${question.testCases.filter((tc) => tc.isHidden).length} hidden)`}
          </p>
        </div>

        {/* Constraints */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Constraints</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Time Limit: {question.timeLimit / 1000} seconds</li>
            <li>Memory Limit: 256 MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
