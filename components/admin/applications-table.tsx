"use client"

import { useState, useMemo } from "react"
import { Search, Filter, ChevronDown, Eye, Edit } from "lucide-react"

interface Application {
    id: string
    position: string
    status: string
    created_at: string
    updated_at: string
    personal_information?: {
        full_name: string
        email: string
        npm: string
        phone_number: string
    } | null
    documents?: {
        cv_url: string | null
        motivation_letter_url: string | null
    } | null
}

interface ApplicationsTableProps {
    applications: Application[]
    onViewDetails: (application: Application) => void
    onStatusUpdate: (applicationId: string, newStatus: string) => void
    onDelete: (applicationId: string) => void
}

const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "document_screening", label: "Document Screening" },
    { value: "interview", label: "Interview" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
]

const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    document_screening: "bg-yellow-100 text-yellow-700",
    interview: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
}

export function ApplicationsTable({ applications, onViewDetails, onStatusUpdate, onDelete }: ApplicationsTableProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [positionFilter, setPositionFilter] = useState("all")

    // Get unique positions
    const positions = useMemo(() => {
        const uniquePositions = Array.from(new Set(applications.map(app => app.position)))
        return [{ value: "all", label: "All Positions" }, ...uniquePositions.map(pos => ({ value: pos, label: pos }))]
    }, [applications])

    // Filter applications
    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const personalInfo = app.personal_information

            // Search filter
            const matchesSearch = !searchQuery ||
                personalInfo?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                personalInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                personalInfo?.npm?.toLowerCase().includes(searchQuery.toLowerCase())

            // Status filter
            const matchesStatus = statusFilter === "all" || app.status === statusFilter

            // Position filter
            const matchesPosition = positionFilter === "all" || app.position === positionFilter

            return matchesSearch && matchesStatus && matchesPosition
        })
    }, [applications, searchQuery, statusFilter, positionFilter])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Filters and Search */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or NPM..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none bg-white"
                        >
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Position Filter */}
                    <div className="relative">
                        <select
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none bg-white"
                        >
                            {positions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                    Showing {filteredApplications.length} of {applications.length} applications
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Submitted</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredApplications.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No applications found
                                </td>
                            </tr>
                        ) : (
                            filteredApplications.map((app) => {
                                const personalInfo = app.personal_information
                                return (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">{personalInfo?.full_name || 'N/A'}</span>
                                                <span className="text-sm text-gray-500">{personalInfo?.email || 'N/A'}</span>
                                                <span className="text-xs text-gray-400">{personalInfo?.npm || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700 capitalize">{app.position.replace(/-/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {formatStatus(app.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{formatDate(app.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onViewDetails(app)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => onDelete(app.id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
