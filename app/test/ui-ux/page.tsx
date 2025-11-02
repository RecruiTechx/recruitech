'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockQuestionsUIUX } from '@/lib/mock-questions-uiux';
import type { SubmissionResult } from '@/lib/test-types';
import { Timer } from '@/components/timer';
import { QuestionPanel } from '@/components/question-panel';
import { SiteHeader } from '@/components/site-header';

export default function UIUXTestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [totalTimeInSeconds] = useState(60 * 60); // 60 minutes for design
  const [questionResponses, setQuestionResponses] = useState<Record<number, string[]>>({});

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  const currentQuestion = mockQuestionsUIUX[currentQuestionIndex];

  // Initialize response
  useEffect(() => {
    if (currentQuestion) {
      setUserResponse(questionResponses[currentQuestionIndex]?.[0] || '');
      setShowSubmissions(false);
    }
  }, [currentQuestionIndex, currentQuestion, questionResponses]);

  const handleSaveResponse = () => {
    if (!currentQuestion) return;

    const responses = questionResponses[currentQuestionIndex] || [];
    const newResponses = {
      ...questionResponses,
      [currentQuestionIndex]: [...responses, userResponse],
    };
    setQuestionResponses(newResponses);

    toast({
      title: 'Response Saved',
      description: `Saved ${responses.length + 1} version(s) of your response.`,
    });
  };

  const handleSubmitTest = async () => {
    if (!user) return;

    // In a real app, you would send this to backend
    toast({
      title: 'Test Submitted! 🎉',
      description: 'Your UI/UX design responses have been submitted for review.',
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    toast({
      title: 'Time\'s Up!',
      description: 'Your test session has ended.',
      variant: 'destructive',
    });
    // Auto-submit after 3 seconds
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestionsUIUX.length - 1) {
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
                  <h2 className="text-lg font-semibold">Q{currentQuestionIndex + 1}/{mockQuestionsUIUX.length}</h2>
                  <span className="text-sm text-gray-500">
                    {questionResponses[currentQuestionIndex]?.length || 0} saves
                  </span>
                </div>

                {/* Toggle View */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowSubmissions(!showSubmissions)}
                    className="w-full px-3 py-2 text-sm rounded border hover:bg-gray-50 transition"
                  >
                    {showSubmissions ? 'View Question' : 'View Saves'}
                  </button>
                </div>

                {/* Problem or Saves */}
                {!showSubmissions ? (
                  <QuestionPanel question={currentQuestion} />
                ) : (
                  <div>
                    {questionResponses[currentQuestionIndex]?.length ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-3">
                          Saved {questionResponses[currentQuestionIndex].length} version(s)
                        </p>
                        {questionResponses[currentQuestionIndex].map((response, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded border">
                            <p className="text-sm font-semibold mb-1">Save #{idx + 1}</p>
                            <p className="text-xs text-gray-600 line-clamp-3">{response}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No saves yet</p>
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
                    disabled={currentQuestionIndex === mockQuestionsUIUX.length - 1}
                    className="flex-1 px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50 transition text-sm font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Response Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Timer */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <Timer
                  initialSeconds={totalTimeInSeconds}
                  onTimeUp={handleTimeUp}
                />
              </div>

              {/* Response Area */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="border-b p-4">
                  <h3 className="text-lg font-semibold">Your Response</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Explain your design thinking, approach, and reasoning.
                  </p>
                </div>

                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  disabled={timeUp}
                  spellCheck="true"
                  className="w-full p-4 min-h-96 resize-none focus:outline-none font-sans text-sm"
                  placeholder="Write your design response here. Consider design principles, accessibility, user experience, and technical feasibility..."
                />

                {/* Stats */}
                <div className="border-t px-4 py-2 text-xs text-gray-600 flex justify-between bg-gray-50">
                  <span>Characters: {userResponse.length}</span>
                  <span>Words: {userResponse.trim().split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveResponse}
                  disabled={timeUp || !userResponse.trim()}
                  className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  Save Response
                </button>
                {currentQuestionIndex === mockQuestionsUIUX.length - 1 && (
                  <button
                    onClick={handleSubmitTest}
                    disabled={timeUp}
                    className="flex-1 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
                  >
                    Submit Test
                  </button>
                )}
              </div>

              {/* Question Info */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Question Info</p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-semibold">Difficulty:</span>{' '}
                    <span className={
                      currentQuestion.difficulty === 'easy'
                        ? 'text-green-600'
                        : currentQuestion.difficulty === 'medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }>
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Time Suggested:</span> {Math.round(currentQuestion.timeLimit / 1000 / 60)} minutes
                  </p>
                  <p>
                    <span className="font-semibold">Progress:</span> {currentQuestionIndex + 1}/{mockQuestionsUIUX.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
