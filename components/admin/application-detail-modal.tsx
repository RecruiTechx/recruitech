"use client"

import { X, Mail, Phone, FileText, Download, ExternalLink } from "lucide-react"

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
        department: string
        major: string
        force: string
        id_line: string
        other_contacts: string | null
    } | null
    documents?: {
        cv_url: string | null
        motivation_letter_url: string | null
        follow_proof_url: string | null
        twibbon_url: string | null
    } | null
}

interface ApplicationDetailModalProps {
    application: Application | null
    isOpen: boolean
    onClose: () => void
    onStatusUpdate: (applicationId: string, newStatus: string) => void
}

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "document_screening", label: "Document Screening" },
    { value: "interview", label: "Interview" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
]

export function ApplicationDetailModal({ application, isOpen, onClose, onStatusUpdate }: ApplicationDetailModalProps) {
    if (!isOpen || !application) return null

    const personalInfo = application.personal_information
    const documents = application.documents

    const handleStatusChange = (newStatus: string) => {
        if (confirm(`Are you sure you want to change the status to "${newStatus.replace('_', ' ')}"?`)) {
            onStatusUpdate(application.id, newStatus)
            onClose()
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{personalInfo?.full_name || 'Application Details'}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Applied for {application.position.replace(/-/g, ' ')} • {formatDate(application.created_at)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-8">
                    {/* Warning for incomplete applications */}
                    {!personalInfo && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Incomplete Application:</strong> This applicant has not filled out their personal information or uploaded documents yet. The application is in draft state.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Personal Information */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Email</p>
                                    <p className="text-sm font-medium text-gray-800">{personalInfo?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Phone</p>
                                    <p className="text-sm font-medium text-gray-800">{personalInfo?.phone_number || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">NPM</p>
                                <p className="text-sm font-medium text-gray-800">{personalInfo?.npm || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Department</p>
                                <p className="text-sm font-medium text-gray-800">{personalInfo?.department || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Major</p>
                                <p className="text-sm font-medium text-gray-800">{personalInfo?.major || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Force</p>
                                <p className="text-sm font-medium text-gray-800">{personalInfo?.force || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">LINE ID</p>
                                <p className="text-sm font-medium text-gray-800">{personalInfo?.id_line || 'N/A'}</p>
                            </div>
                            {personalInfo?.other_contacts && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Other Contacts</p>
                                    <p className="text-sm font-medium text-gray-800">{personalInfo.other_contacts}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Documents */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'CV / Resume', url: documents?.cv_url },
                                { label: 'Motivation Letter', url: documents?.motivation_letter_url },
                                { label: 'Follow Proof', url: documents?.follow_proof_url },
                                { label: 'Twibbon', url: documents?.twibbon_url },
                            ].map((doc) => (
                                <div key={doc.label} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <p className="text-sm font-medium text-gray-700">{doc.label}</p>
                                    </div>
                                    {doc.url ? (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Document
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400">Not uploaded</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Status Management */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Management</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                                <p className="text-lg font-semibold text-gray-800 capitalize">
                                    {application.status.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Update Status</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={application.status === option.value}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${application.status === option.value
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Application Created</p>
                                    <p className="text-xs text-gray-500">{formatDate(application.created_at)}</p>
                                </div>
                            </div>
                            {application.updated_at !== application.created_at && (
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Last Updated</p>
                                        <p className="text-xs text-gray-500">{formatDate(application.updated_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
