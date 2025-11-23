"use client"

import { useState } from "react"
import { X, Save } from "lucide-react"

interface QuestionEditorProps {
    question: any | null
    onSave: (questionData: any) => Promise<boolean>
    onClose: () => void
}

export function QuestionEditor({ question, onSave, onClose }: QuestionEditorProps) {
    const [questionType, setQuestionType] = useState(question?.question_type || 'mcq')
    const [questionText, setQuestionText] = useState(question?.question_text || '')
    const [options, setOptions] = useState<Record<string, string>>(
        question?.options || { a: '', b: '', c: '', d: '' }
    )
    const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || '')
    const [explanation, setExplanation] = useState(question?.explanation || '')
    const [points, setPoints] = useState(question?.points || 10)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!questionText || !correctAnswer) {
            alert("Please fill in all required fields")
            return
        }

        if (questionType === 'mcq' && (!options.a || !options.b || !options.c || !options.d)) {
            alert("Please fill in all MCQ options")
            return
        }

        setSaving(true)

        const questionData = {
            question_type: questionType,
            question_text: questionText,
            options: questionType === 'mcq' ? options : null,
            correct_answer: correctAnswer,
            explanation,
            points,
        }

        const success = await onSave(questionData)
        setSaving(false)

        if (success) {
            onClose()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {question ? "Edit Question" : "Add Question"}
                    </h2>
                    <p className="text-gray-600">Configure question settings</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Question Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type *</label>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="mcq">Multiple Choice (MCQ)</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="coding">Coding Challenge</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text *</label>
                        <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Enter your question here..."
                        />
                    </div>

                    {questionType === 'mcq' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Options *</label>
                            <div className="space-y-2">
                                {['a', 'b', 'c', 'd'].map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-600 w-8">{key.toUpperCase()})</span>
                                        <input
                                            type="text"
                                            value={options[key]}
                                            onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder={`Option ${key.toUpperCase()}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Correct Answer * {questionType === 'mcq' && "(Enter letter: a, b, c, or d)"}
                        </label>
                        <input
                            type="text"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder={questionType === 'mcq' ? 'e.g., a' : 'Enter the correct answer'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Provide an explanation for the solution..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Points</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            min="1"
                            max="100"
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? "Saving..." : "Save Question"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
