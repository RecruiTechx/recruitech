"use client"

import { useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { TestEditor } from "./test-editor"

interface Test {
    id: string
    title: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
    duration_minutes: number
    passing_score: number
    is_active: boolean
    position: {
        id: string
        name: string
        slug: string
    }
    test_questions: any[]
    created_at: string
}

interface TestsTabProps {
    tests: Test[]
    positions: any[]
    onRefresh: () => void
}

const DIFFICULTY_COLORS = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
}

export function TestsTab({ tests, positions, onRefresh }: TestsTabProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState("all")
    const [positionFilter, setPositionFilter] = useState("all")
    const [selectedTest, setSelectedTest] = useState<Test | null>(null)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    const filteredTests = tests.filter((test) => {
        const matchesSearch = !searchQuery ||
            test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDifficulty = difficultyFilter === "all" || test.difficulty === difficultyFilter
        const matchesPosition = positionFilter === "all" || test.position.id === positionFilter

        return matchesSearch && matchesDifficulty && matchesPosition
    })

    const handleCreateNew = () => {
        setSelectedTest(null)
        setIsCreating(true)
        setIsEditorOpen(true)
    }

    const handleEdit = (test: Test) => {
        setSelectedTest(test)
        setIsCreating(false)
        setIsEditorOpen(true)
    }

    const handleCloseEditor = () => {
        setIsEditorOpen(false)
        setSelectedTest(null)
        setIsCreating(false)
        onRefresh()
    }

    if (isEditorOpen) {
        return (
            <TestEditor
                test={selectedTest}
                positions={positions}
                onClose={handleCloseEditor}
                isCreating={isCreating}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Technical Tests</h2>
                    <p className="text-gray-600">Create and manage technical tests for recruitment</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Create Test
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search tests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none bg-white"
                        >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {/* Position Filter */}
                    <div className="relative">
                        <select
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none bg-white"
                        >
                            <option value="all">All Positions</option>
                            {positions.map((pos) => (
                                <option key={pos.id} value={pos.id}>{pos.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                    Showing {filteredTests.length} of {tests.length} tests
                </div>
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No tests found. Create your first test!
                    </div>
                ) : (
                    filteredTests.map((test) => (
                        <div
                            key={test.id}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleEdit(test)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{test.title}</h3>
                                    <p className="text-sm text-gray-500">{test.position.name}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${DIFFICULTY_COLORS[test.difficulty]}`}>
                                    {test.difficulty}
                                </span>
                            </div>

                            {test.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Questions</p>
                                    <p className="font-semibold text-gray-800">{test.test_questions?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Duration</p>
                                    <p className="font-semibold text-gray-800">{test.duration_minutes} min</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Passing Score</p>
                                    <p className="font-semibold text-gray-800">{test.passing_score}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <p className={`font-semibold ${test.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        {test.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-400">
                                    Created {new Date(test.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
