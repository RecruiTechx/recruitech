"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, GripVertical, Sparkles, Save } from "lucide-react"
import { createTest, updateTest, deleteTest, addQuestion, updateQuestion, deleteQuestion, reorderQuestions } from "@/app/actions/tests"
import { QuestionEditor } from "./question-editor"
import { AiTestGenerator } from "./ai-test-generator"

interface TestEditorProps {
    test: any | null
    positions: any[]
    onClose: () => void
    isCreating: boolean
}

export function TestEditor({ test, positions, onClose, isCreating }: TestEditorProps) {
    const [title, setTitle] = useState(test?.title || "")
    const [description, setDescription] = useState(test?.description || "")
    const [positionId, setPositionId] = useState(test?.position?.id || "")
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(test?.difficulty || 'medium')
    const [durationMinutes, setDurationMinutes] = useState(test?.duration_minutes || 60)
    const [passingScore, setPassingScore] = useState(test?.passing_score || 70)
    const [isActive, setIsActive] = useState(test?.is_active ?? true)
    const [questions, setQuestions] = useState(test?.test_questions || [])
    const [showAiGenerator, setShowAiGenerator] = useState(false)
    const [showQuestionEditor, setShowQuestionEditor] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [currentTestId, setCurrentTestId] = useState(test?.id)

    const handleSaveTest = async () => {
        if (!title || !positionId) {
            alert("Please fill in all required fields")
            return
        }

        setSaving(true)

        const testData = {
            position_id: positionId,
            title,
            description,
            difficulty,
            duration_minutes: durationMinutes,
            passing_score: passingScore,
            is_active: isActive,
        }

        let savedTestId = currentTestId

        if (!currentTestId) {
            // Create new test
            const result = await createTest(testData)
            if (result.success && result.data) {
                savedTestId = result.data.id
                setCurrentTestId(savedTestId)
                // Don't alert here yet, wait for questions
            } else {
                alert(result.error || "Failed to create test")
                setSaving(false)
                return
            }
        } else {
            // Update existing test
            const result = await updateTest(currentTestId, testData)
            if (!result.success) {
                alert(result.error || "Failed to update test")
                setSaving(false)
                return
            }
        }

        // Save any unsaved questions (e.g. from AI generation)
        const unsavedQuestions = questions.filter((q: any) => q.id.toString().startsWith('temp-'))

        if (unsavedQuestions.length > 0 && savedTestId) {
            let savedCount = 0
            const updatedQuestions = [...questions]

            for (const q of unsavedQuestions) {
                const questionData = {
                    test_id: savedTestId,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    points: q.points,
                    order_index: q.order_index,
                }

                const result = await addQuestion(questionData)
                if (result.success && result.data) {
                    savedCount++
                    // Update the question in the local state with the real ID
                    const index = updatedQuestions.findIndex(uq => uq.id === q.id)
                    if (index !== -1) {
                        updatedQuestions[index] = result.data
                    }
                }
            }

            setQuestions(updatedQuestions)

            if (savedCount === unsavedQuestions.length) {
                alert("Test and all questions saved successfully!")
            } else {
                alert(`Test saved, but only ${savedCount}/${unsavedQuestions.length} questions were saved.`)
            }
        } else {
            alert("Test saved successfully!")
        }

        setSaving(false)
    }

    const handleDeleteTest = async () => {
        if (!currentTestId) return

        if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
            return
        }

        const result = await deleteTest(currentTestId)
        if (result.success) {
            alert("Test deleted successfully!")
            onClose()
        } else {
            alert(result.error || "Failed to delete test")
        }
    }

    const handleAddQuestion = () => {
        setEditingQuestion(null)
        setShowQuestionEditor(true)
    }

    const handleEditQuestion = (question: any) => {
        setEditingQuestion(question)
        setShowQuestionEditor(true)
    }

    const handleSaveQuestion = async (questionData: any) => {
        if (!currentTestId) {
            alert("Please save the test first before adding questions")
            return false
        }

        if (editingQuestion) {
            // Update existing question
            const result = await updateQuestion(editingQuestion.id, questionData)
            if (result.success) {
                setQuestions(questions.map((q: any) => q.id === editingQuestion.id ? result.data : q))
                return true
            } else {
                alert(result.error || "Failed to update question")
                return false
            }
        } else {
            // Add new question
            const newQuestionData = {
                ...questionData,
                test_id: currentTestId,
                order_index: questions.length,
            }
            const result = await addQuestion(newQuestionData)
            if (result.success) {
                setQuestions([...questions, result.data])
                return true
            } else {
                alert(result.error || "Failed to add question")
                return false
            }
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm("Are you sure you want to delete this question?")) {
            return
        }

        const result = await deleteQuestion(questionId)
        if (result.success) {
            setQuestions(questions.filter((q: any) => q.id !== questionId))
        } else {
            alert(result.error || "Failed to delete question")
        }
    }

    const handleAiGenerated = (generatedQuestions: any[]) => {
        // Add generated questions to the test
        setQuestions([...questions, ...generatedQuestions.map((q, idx) => ({
            ...q,
            id: `temp-${Date.now()}-${idx}`, // Temporary ID
            order_index: questions.length + idx,
        }))])
        setShowAiGenerator(false)
    }

    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0)

    if (showQuestionEditor) {
        return (
            <QuestionEditor
                question={editingQuestion}
                onSave={handleSaveQuestion}
                onClose={() => {
                    setShowQuestionEditor(false)
                    setEditingQuestion(null)
                }}
            />
        )
    }

    if (showAiGenerator) {
        return (
            <AiTestGenerator
                position={positions.find(p => p.id === positionId)?.name || ""}
                difficulty={difficulty}
                onGenerate={handleAiGenerated}
                onClose={() => setShowAiGenerator(false)}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isCreating ? "Create New Test" : "Edit Test"}
                    </h2>
                    <p className="text-gray-600">Configure test settings and manage questions</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Test Configuration */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Test Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="e.g., React Frontend Developer Assessment"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Brief description of the test..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                        <select
                            value={positionId}
                            onChange={(e) => setPositionId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="">Select Position</option>
                            {positions.map((pos) => (
                                <option key={pos.id} value={pos.id}>{pos.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                        <input
                            type="number"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                        <input
                            type="number"
                            value={passingScore}
                            onChange={(e) => setPassingScore(parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            min="0"
                            max="100"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700">
                            Active (visible to applicants)
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button
                        onClick={handleSaveTest}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? "Saving..." : "Save Test"}
                    </button>

                    {currentTestId && !isCreating && (
                        <button
                            onClick={handleDeleteTest}
                            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                        >
                            Delete Test
                        </button>
                    )}
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Questions ({questions.length})</h3>
                        <p className="text-sm text-gray-500">Total Points: {totalPoints}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAiGenerator(true)}
                            disabled={!positionId}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Generate
                        </button>
                        <button
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Manually
                        </button>
                    </div>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="mb-4">No questions yet. Add questions manually or use AI to generate them.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {questions.map((question: any, index: number) => (
                            <div
                                key={question.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-semibold text-gray-500">Q{index + 1}</span>
                                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                                                        {question.question_type.toUpperCase()}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                                                        {question.points} pts
                                                    </span>
                                                </div>
                                                <p className="text-gray-800 font-medium mb-2">{question.question_text}</p>
                                                {question.question_type === 'mcq' && question.options && (
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        {Object.entries(question.options).map(([key, value]) => (
                                                            <div key={key} className={key === question.correct_answer ? 'text-green-600 font-semibold' : ''}>
                                                                {key}) {value as string}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {question.explanation && (
                                                    <p className="text-sm text-gray-500 mt-2 italic">
                                                        💡 {question.explanation}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditQuestion(question)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(question.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
