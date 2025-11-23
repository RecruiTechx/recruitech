"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from "@/lib/auth-context"
import { checkIsAdmin } from "@/app/actions/positions"
import {
  getAllApplications,
  getApplicationsByStatus,
  getApplicationsByPosition,
  deleteApplication,
  bulkDeleteApplications,
  updateApplicationStatus,
} from "@/app/actions/application"

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPosition, setFilterPosition] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      if (authLoading) return

      if (!user || !user.email) {
        setIsCheckingAuth(false)
        router.push("/auth")
        return
      }

      const adminCheck = await checkIsAdmin(user.email)

      if (!adminCheck.isAdmin) {
        setIsCheckingAuth(false)
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)
      setIsCheckingAuth(false)
      loadApplications()
    }

    checkAdminAndLoadData()
  }, [user, authLoading, router])

  const loadApplications = async () => {
    setIsLoading(true)

    let result
    if (filterStatus !== "all") {
      result = await getApplicationsByStatus(filterStatus)
    } else if (filterPosition !== "all") {
      result = await getApplicationsByPosition(filterPosition)
    } else {
      result = await getAllApplications()
    }

    if (result.success) {
      setApplications(result.data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isAdmin) {
      loadApplications()
    }
  }, [filterStatus, filterPosition, isAdmin])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return
    }

    const result = await deleteApplication(id)
    if (result.success) {
      loadApplications()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} applications? This action cannot be undone.`)) {
      return
    }

    const result = await bulkDeleteApplications(Array.from(selectedIds))
    if (result.success) {
      setSelectedIds(new Set())
      loadApplications()
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updateApplicationStatus(id, newStatus as any)
    if (result.success) {
      loadApplications()
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(applications.map(app => app.id)))
    }
  }

  if (isCheckingAuth || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-blue-100 text-blue-800",
    document_screening: "bg-yellow-100 text-yellow-800",
    interview: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-8 py-12 pt-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Manage Applications</h1>
            <p className="text-gray-600">View, filter, and manage all applicant submissions</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
              >
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="document_screening">Document Screening</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Position</label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Positions</option>
                <option value="ui-ux">UI/UX Designer</option>
                <option value="software-engineer">Software Engineer</option>
                <option value="project-manager">Project Manager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No applications found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === applications.length && applications.length > 0}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 text-pink-600 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applicant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applied</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => {
                    const personalInfo = app.personal_information
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(app.id)}
                            onChange={() => toggleSelection(app.id)}
                            className="w-5 h-5 text-pink-600 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">
                            {personalInfo?.full_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">{personalInfo?.npm || "N/A"}</div>
                          <div className="text-sm text-gray-500">{personalInfo?.email || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.position.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[app.status as keyof typeof statusColors]} border-0`}
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="document_screening">Document Screening</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/admin/applications/${app.id}`)}
                              className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-pink-600">{applications.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Submitted</h3>
            <p className="text-3xl font-bold text-blue-600">
              {applications.filter(a => a.status === 'submitted').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Accepted</h3>
            <p className="text-3xl font-bold text-green-600">
              {applications.filter(a => a.status === 'accepted').length}
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
