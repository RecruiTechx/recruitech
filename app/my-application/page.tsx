"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getUserApplication } from "@/app/actions/application"
import { SiteHeader } from "@/components/site-header"
import Link from "next/link"

export default function MyApplicationPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [application, setApplication] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [interviews, setInterviews] = useState<any[]>([])

    useEffect(() => {
        const loadApplication = async () => {
            if (!user) {
                router.push("/auth")
                return
            }

            const result = await getUserApplication(user.id)
            if (result.success && result.data) {
                setApplication(result.data)

                // Load interviews if status is interview
                if (result.data.status === 'interview') {
                    const { getInterviewsByApplication } = await import('@/app/actions/interviews')
                    const interviewResult = await getInterviewsByApplication(result.data.id)
                    if (interviewResult.success && interviewResult.data) {
                        setInterviews(interviewResult.data)
                    }
                }
            }
            setLoading(false)
        }

        loadApplication()
    }, [user, router])

    if (loading) {
        return (
            <>
                <SiteHeader />
                <main className="mx-auto max-w-7xl px-8 py-12 pt-24">
                    <div className="text-center">
                        <p className="text-gray-600">Loading your application...</p>
                    </div>
                </main>
            </>
        )
    }

    if (!application) {
        return (
            <>
                <SiteHeader />
                <main className="mx-auto max-w-7xl px-8 py-12 pt-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">No Application Found</h1>
                        <p className="text-gray-600 mb-8">You haven't submitted an application yet.</p>
                        <Link
                            href="/open"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                        >
                            Browse Positions
                        </Link>
                    </div>
                </main>
            </>
        )
    }

    const personalInfo = application.personal_information
    const documents = application.documents

    const statusColors = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        document_screening: "bg-yellow-100 text-yellow-800",
        interview: "bg-purple-100 text-purple-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    }

    const statusLabels = {
        draft: "Draft",
        submitted: "Submitted",
        document_screening: "Document Screening",
        interview: "Interview",
        accepted: "Accepted",
        rejected: "Rejected",
    }

    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-8 py-12 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-pink-600 mb-2">My Application</h1>
                    <p className="text-gray-600">View your application status and details</p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                {application.position.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h2>
                            <p className="text-sm text-gray-500">Applied on {new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[application.status as keyof typeof statusColors]}`}>
                            {statusLabels[application.status as keyof typeof statusLabels]}
                        </span>
                    </div>

                    {application.status === 'draft' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Your application is still in draft. Please complete and submit it.
                            </p>
                            <Link
                                href={`/document-screening?position=${application.position}`}
                                className="inline-block mt-3 px-6 py-2 bg-yellow-600 text-white font-semibold rounded-full hover:bg-yellow-700 transition-colors"
                            >
                                Continue Application
                            </Link>
                        </div>
                    )}

                    {application.status === 'submitted' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800 mb-3">
                                📝 Your application has been submitted! Take the technical test to proceed.
                            </p>
                            <Link
                                href="/take-test"
                                className="inline-block px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                            >
                                Take Technical Test
                            </Link>
                        </div>
                    )}
                </div>

                {/* Personal Information */}
                {personalInfo && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                <p className="font-semibold text-gray-800">{personalInfo.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">NPM</p>
                                <p className="font-semibold text-gray-800">{personalInfo.npm}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Department</p>
                                <p className="font-semibold text-gray-800">{personalInfo.department}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Major</p>
                                <p className="font-semibold text-gray-800">{personalInfo.major}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Force</p>
                                <p className="font-semibold text-gray-800">{personalInfo.force}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Email</p>
                                <p className="font-semibold text-gray-800">{personalInfo.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                <p className="font-semibold text-gray-800">{personalInfo.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">LINE ID</p>
                                <p className="font-semibold text-gray-800">{personalInfo.id_line}</p>
                            </div>
                            {personalInfo.other_contacts && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Other Contacts</p>
                                    <p className="font-semibold text-gray-800">{personalInfo.other_contacts}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents */}
                {documents && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Uploaded Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.cv_url && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Curriculum Vitae (CV)</p>
                                    <a
                                        href={documents.cv_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                        </svg>
                                        View Document
                                    </a>
                                </div>
                            )}
                            {documents.motivation_letter_url && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Motivation Letter</p>
                                    <a
                                        href={documents.motivation_letter_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                        </svg>
                                        View Document
                                    </a>
                                </div>
                            )}
                            {documents.follow_proof_url && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Follow Proof</p>
                                    <a
                                        href={documents.follow_proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                        </svg>
                                        View Document
                                    </a>
                                </div>
                            )}
                            {documents.twibbon_url && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-2">Twibbon</p>
                                    <a
                                        href={documents.twibbon_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                        </svg>
                                        View Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    {application.status === 'draft' && (
                        <Link
                            href={`/document-screening?position=${application.position}`}
                            className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                        >
                            Complete Application
                        </Link>
                    )}
                    <Link
                        href="/open"
                        className="px-8 py-3 border-2 border-pink-500 text-pink-500 font-semibold rounded-full hover:bg-pink-50 transition-colors"
                    >
                        Browse Positions
                    </Link>
                </div>
            </main>
        </>
    )
}
