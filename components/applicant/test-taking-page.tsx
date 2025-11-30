"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { getActiveTestForPosition, submitTestAttempt, getTestAttempt } from "@/app/actions/tests"
import { calculateScore } from "@/lib/test-utils"

interface TestTakingPageProps {
    applicationId: string
    position: string
    userId: string
}

export function TestTakingPage({ applicationId, position, userId }: TestTakingPageProps) {
    const router = useRouter()
    const [test, setTest] = useState<any>(null)
    const [existingAttempt, setExistingAttempt] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [startTime, setStartTime] = useState<number>(0)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState<any>(null)

    useEffect(() => {
        loadTest()
    }, [])

    useEffect(() => {
        if (test && timeRemaining > 0 && !submitted) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [test, timeRemaining, submitted])

    const loadTest = async () => {
        setLoading(true)

        console.log('[DEBUG] Loading test for position:', position)
        const testResult = await getActiveTestForPosition(position)
        console.log('[DEBUG] Test result:', testResult)

        if (!testResult.success || !testResult.data) {
            alert("No active test found for your position")
            router.push("/my-application")
            return
        }

        const testData = testResult.data
        console.log('[DEBUG] Test data:', testData)
        console.log('[DEBUG] Test questions:', testData.test_questions)
        console.log('[DEBUG] Number of questions:', testData.test_questions?.length)

        const attemptResult = await getTestAttempt(testData.id, applicationId)

        if (attemptResult.success && attemptResult.data) {
            // Check if test has been updated since attempt
            const attempt = attemptResult.data
            const questions = testData.test_questions

            let latestUpdate = new Date(testData.updated_at).getTime()
            if (questions && questions.length > 0) {
                const questionUpdates = questions.map((q: any) => new Date(q.updated_at).getTime())
                const maxQuestionUpdate = Math.max(...questionUpdates)
                latestUpdate = Math.max(latestUpdate, maxQuestionUpdate)
            }

            const attemptTime = new Date(attempt.submitted_at || attempt.created_at).getTime()

            // If test was updated AFTER the attempt was submitted (with 5 second buffer for safety)
            if (latestUpdate > attemptTime + 5000) {
                console.log('[DEBUG] Test outdated, resetting attempt...')
                // Reset attempt
                const { resetTestAttempt } = await import("@/app/actions/tests")
                await resetTestAttempt(testData.id, applicationId)

                // Start fresh
                setTest(testData)
                setTimeRemaining(testData.duration_minutes * 60)
                setStartTime(Date.now())
                alert("The test has been updated since your last attempt. You must retake it.")
            } else {
                setExistingAttempt(attemptResult.data)
                setSubmitted(true)
                setResult(attemptResult.data)
                setTest(testData)
            }
        } else {
            setTest(testData)
            setTimeRemaining(testData.duration_minutes * 60)
            setStartTime(Date.now())
        }

        setLoading(false)
    }

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer })
    }

    const handleSubmit = async () => {
        if (submitting || submitted) return

        setSubmitting(true)

        const questions = test.test_questions.map((q: any) => ({
            id: q.id,
            correct_answer: q.correct_answer,
            points: q.points,
        }))

        const scoreResult = calculateScore(questions, answers)
        const timeTaken = Math.floor((Date.now() - startTime) / 1000)

        const passed = scoreResult.percentage >= test.passing_score

        const result = await submitTestAttempt({
            test_id: test.id,
            application_id: applicationId,
            user_id: userId,
            answers,
            score: scoreResult.score,
            total_points: scoreResult.totalPoints,
            percentage: scoreResult.percentage,
            passed,
            time_taken_seconds: timeTaken,
        })

        if (result.success) {
            setSubmitted(true)
            setResult({ ...scoreResult, passed, time_taken_seconds: timeTaken })
        } else {
            alert(result.error || "Failed to submit test")
        }

        setSubmitting(false)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-600">Loading test...</p>
            </div>
        )
    }

    if (submitted && result) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    {result.passed ? (
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    ) : (
                        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    )}

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {result.passed ? "Congratulations!" : "Test Complete"}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {result.passed
                            ? "You have passed the technical test!"
                            : "Unfortunately, you did not meet the passing score."}
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Score</p>
                            <p className="text-2xl font-bold text-gray-800">{result.score}/{result.total_points || result.totalPoints}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Percentage</p>
                            <p className="text-2xl font-bold text-gray-800">{result.percentage}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Passing Score</p>
                            <p className="text-2xl font-bold text-gray-800">{test.passing_score}%</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => router.push("/my-application")}
                        className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                        Back to My Application
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
                        <p className="text-gray-600">{test.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-pink-600">
                        <Clock className="w-6 h-6" />
                        <span className="text-2xl font-bold">{formatTime(timeRemaining)}</span>
                    </div>
                </div>

                {timeRemaining < 60 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-semibold">Less than 1 minute remaining!</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {test.test_questions
                    .sort((a: any, b: any) => a.order_index - b.order_index)
                    .map((question: any, index: number) => (
                        <div key={question.id} className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <p className="text-gray-800 font-medium mb-4">{question.question_text}</p>
                                    <p className="text-sm text-gray-500 mb-4">{question.points} points</p>

                                    {question.question_type === 'mcq' && question.options ? (
                                        <div className="space-y-2">
                                            {Object.entries(question.options).map(([key, value]) => (
                                                <label
                                                    key={key}
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-pink-300 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={key}
                                                        checked={answers[question.id] === key}
                                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                        className="w-5 h-5 text-pink-600"
                                                    />
                                                    <span className="text-gray-700">{key.toUpperCase()}. {value as string}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <textarea
                                            value={answers[question.id] || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            rows={question.question_type === 'coding' ? 8 : 4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Enter your answer here..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        Answered: {Object.keys(answers).length} / {test.test_questions.length}
                    </p>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Test"}
                    </button>
                </div>
            </div>
        </div>
    )
}
