"use client"

import { useState } from "react"
import { X, Sparkles, Loader2 } from "lucide-react"

interface AiTestGeneratorProps {
    position: string
    difficulty: 'easy' | 'medium' | 'hard'
    onGenerate: (questions: any[]) => void
    onClose: () => void
}

export function AiTestGenerator({ position, difficulty, onGenerate, onClose }: AiTestGeneratorProps) {
    const [questionCount, setQuestionCount] = useState(5)
    const [questionTypes, setQuestionTypes] = useState<string[]>(['mcq', 'short_answer'])
    const [generating, setGenerating] = useState(false)
    const [preview, setPreview] = useState<any[]>([])
    const [generationMode, setGenerationMode] = useState<'intent' | 'custom'>('intent')
    const [customPrompt, setCustomPrompt] = useState('')

    const toggleQuestionType = (type: string) => {
        if (questionTypes.includes(type)) {
            setQuestionTypes(questionTypes.filter(t => t !== type))
        } else {
            setQuestionTypes([...questionTypes, type])
        }
    }

    const handleGenerate = async () => {
        if (questionTypes.length === 0) {
            alert("Please select at least one question type")
            return
        }

        setGenerating(true)

        try {
            const response = await fetch('/api/ai/generate-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    position,
                    difficulty,
                    questionCount,
                    questionTypes,
                    generationMode,
                    customPrompt,
                }),
            })

            const data = await response.json()

            if (data.success && data.questions) {
                setPreview(data.questions)
            } else {
                alert(data.error || "Failed to generate questions")
            }
        } catch (error) {
            console.error("Error generating test:", error)
            alert("Failed to generate questions. Please try again.")
        } finally {
            setGenerating(false)
        }
    }

    const handleUseQuestions = () => {
        onGenerate(preview)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Test Generator</h2>
                    <p className="text-gray-600">Generate questions using AI</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generation Settings</h3>

                <div className="space-y-4">
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Generation Mode</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setGenerationMode('intent')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${generationMode === 'intent'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Intent Based
                            </button>
                            <button
                                onClick={() => setGenerationMode('custom')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${generationMode === 'custom'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Custom Prompt
                            </button>
                        </div>
                    </div>

                    {generationMode === 'intent' ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-gray-800 font-medium">{position}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-gray-800 font-medium capitalize">{difficulty}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Number of Questions: {questionCount}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Types</label>
                                <div className="flex flex-wrap gap-2" >
                                    {[
                                        { value: 'mcq', label: 'Multiple Choice' },
                                        { value: 'short_answer', label: 'Short Answer' },
                                        { value: 'coding', label: 'Coding Challenge' },
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => toggleQuestionType(type.value)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${questionTypes.includes(type.value)
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Prompt</label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="E.g., Generate 5 difficult questions about React Hooks focusing on performance optimization..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[200px]"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Note: We will automatically append formatting instructions to ensure the output is compatible with our system.
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || (generationMode === 'intent' && questionTypes.length === 0) || (generationMode === 'custom' && !customPrompt.trim())}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate Questions
                        </>
                    )}
                </button>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview ({preview.length} questions)</h3>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {preview.map((q, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                                        {q.question_type.toUpperCase()}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                                        {q.points} pts
                                    </span>
                                </div>
                                <p className="text-gray-800 font-medium mb-2">{q.question_text}</p>
                                {q.question_type === 'mcq' && q.options && (
                                    <div className="text-sm text-gray-600 space-y-1 mb-2">
                                        {Object.entries(q.options).map(([key, value]) => (
                                            <div key={key} className={key === q.correct_answer ? 'text-green-600 font-semibold' : ''}>
                                                {key}) {value as string}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {q.explanation && (
                                    <p className="text-sm text-gray-500 italic">💡 {q.explanation}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={handleUseQuestions}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                        >
                            Use These Questions
                        </button>
                        <button
                            onClick={() => setPreview([])}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                        >
                            Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
