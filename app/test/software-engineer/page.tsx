'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockQuestions } from '@/lib/mock-questions';
import { submitCode } from '@/lib/code-runner';
import type { SubmissionResult } from '@/lib/test-types';
import { Timer } from '@/components/timer';
import { QuestionPanel } from '@/components/question-panel';
import { CodeEditor } from '@/components/code-editor';
import { TestResults } from '@/components/test-results';
import { SiteHeader } from '@/components/site-header';

export default function SoftwareEngineerTestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [totalTimeInSeconds] = useState(30 * 60); // 30 minutes
  const [questionAttempts, setQuestionAttempts] = useState<Record<number, SubmissionResult[]>>({});
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Initialize code with template
  useEffect(() => {
    if (currentQuestion) {
      const template = language === 'python' 
        ? (currentQuestion.templateCodePython || currentQuestion.templateCode)
        : currentQuestion.templateCode;
      setUserCode(template);
      setSubmissionResult(null);
      setShowSubmissions(false);
    }
  }, [currentQuestionIndex, currentQuestion, language]);

  const handleRunCode = async () => {
    if (!currentQuestion) return;

    setIsRunning(true);
    try {
      const result = await submitCode(currentQuestion, userCode, language);
      setSubmissionResult(result);
      
      // Store attempts
      const attempts = questionAttempts[currentQuestionIndex] || [];
      setQuestionAttempts({
        ...questionAttempts,
        [currentQuestionIndex]: [...attempts, result],
      });

      // Show feedback
      if (result.success) {
        toast({
          title: 'All Tests Passed! ✨',
          description: 'Your solution is correct. You can submit or try the next question.',
        });
      } else {
        toast({
          title: 'Some Tests Failed',
          description: `${result.totalPassed}/${result.totalTests} test cases passed.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Code execution error:', error);
      toast({
        title: 'Execution Error',
        description: error instanceof Error ? error.message : 'Failed to run code',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    setIsRunning(true);
    try {
      const result = await submitCode(currentQuestion, userCode, language);
      
      if (result.success) {
        toast({
          title: 'Solution Submitted! 🎉',
          description: 'Your solution passed all test cases!',
        });

        // Move to next question after 2 seconds
        setTimeout(() => {
          if (currentQuestionIndex < mockQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
            // All questions completed
            router.push('/dashboard');
          }
        }, 2000);
      } else {
        toast({
          title: 'Solution Incomplete',
          description: 'Please ensure all test cases pass before submitting.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'Failed to submit',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    toast({
      title: 'Time\'s Up!',
      description: 'Your test session has ended.',
      variant: 'destructive',
    });
    // Auto-submit current work
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-12 w-12 mx-auto"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto p-4 max-w-7xl">

        {timeUp ? (
          <div className="border rounded-lg p-8 text-center bg-white shadow-sm">
            <h1 className="text-3xl font-bold mb-4">Test Session Ended</h1>
            <p className="text-gray-600 mb-6">Time limit reached. Your test has been auto-submitted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Question */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto bg-white shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Q{currentQuestionIndex + 1}/{mockQuestions.length}</h2>
                  <span className="text-sm text-gray-500">
                    {questionAttempts[currentQuestionIndex]?.length || 0} attempts
                  </span>
                </div>

                {/* Toggle Submissions View */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowSubmissions(!showSubmissions)}
                    className="w-full px-3 py-2 text-sm rounded border hover:bg-gray-50 transition"
                  >
                    {showSubmissions ? 'View Problem' : 'View Attempts'}
                  </button>
                </div>

                {/* Problem or Submissions */}
                {!showSubmissions ? (
                  <QuestionPanel question={currentQuestion} />
                ) : (
                  <div>
                    {questionAttempts[currentQuestionIndex]?.length ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-3">
                          Attempts: {questionAttempts[currentQuestionIndex].length}
                        </p>
                        {questionAttempts[currentQuestionIndex].map((attempt, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded border">
                            <div className="flex items-center justify-between text-sm">
                              <span>Attempt {idx + 1}</span>
                              <span className={attempt.success ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                {attempt.success ? '✓ Passed' : '✗ Failed'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {attempt.totalPassed}/{attempt.totalTests} tests passed • {attempt.executionTime}ms
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No attempts yet</p>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50 transition text-sm font-medium"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === mockQuestions.length - 1}
                    className="flex-1 px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50 transition text-sm font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Editor & Timer */}
            <div className="lg:col-span-2 space-y-4">
              {/* Timer */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <Timer
                  initialSeconds={totalTimeInSeconds}
                  onTimeUp={handleTimeUp}
                />
              </div>

              {/* Code Editor */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: '500px' }}>
                <CodeEditor
                  initialCode={userCode}
                  onChange={setUserCode}
                  onRun={handleRunCode}
                  onSubmit={handleSubmit}
                  isLoading={isRunning}
                  language={language}
                  onLanguageChange={setLanguage}
                />
              </div>

              {/* Action Buttons */}
              <div className="border rounded-lg p-4 bg-white shadow-sm flex gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || timeUp}
                  className="flex-1 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning || timeUp || !submissionResult?.success}
                  className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  {isRunning ? 'Submitting...' : 'Submit'}
                </button>
              </div>

              {/* Test Results */}
              {submissionResult && (
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <TestResults
                    results={submissionResult.results}
                    totalPassed={submissionResult.totalPassed}
                    totalTests={submissionResult.totalTests}
                    error={submissionResult.error}
                    executionTime={submissionResult.executionTime}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
