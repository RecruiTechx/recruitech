"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from "@/lib/auth-context"
import {
  getAllPositions,
  updatePosition,
  createPosition,
  deletePosition,
  checkIsAdmin,
  type Position,
} from "@/app/actions/positions"
import { getDashboardStats, type DashboardStats } from "@/app/actions/statistics"
import { getAllApplications, updateApplicationStatus, deleteApplication } from "@/app/actions/application"
import { getAllTests } from "@/app/actions/tests"
import { StatisticsCards, StatusBreakdown, PositionBreakdown } from "@/components/admin/statistics-cards"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { ApplicationDetailModal } from "@/components/admin/application-detail-modal"
import { TestsTab } from "@/components/admin/tests-tab"

type TabType = 'dashboard' | 'positions' | 'applications' | 'tests'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [positions, setPositions] = useState<Position[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    total_quota: 14,
    filled_quota: 0,
    is_active: true,
  })

  useEffect(() => {
    console.log('Admin page useEffect triggered, authLoading:', authLoading, 'user:', user)

    const checkAdminAndLoadData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('Auth still loading...')
        return
      }

      // DEBUG: Test simple action
      import('@/app/actions/test-simple').then(async ({ testSimpleAction }) => {
        try {
          const res = await testSimpleAction()
          console.log('[DEBUG] Simple Action Result:', res)
        } catch (e) {
          console.error('[DEBUG] Simple Action Failed:', e)
        }
      })

      console.log('Auth loaded, checking admin status...')

      if (!user || !user.email) {
        console.log('No user or email found, redirecting to auth')
        setIsCheckingAuth(false)
        router.push("/auth")
        return
      }

      console.log('User email:', user.email)

      // Check if user is admin
      const adminCheck = await checkIsAdmin(user.email)
      console.log('Admin check result:', adminCheck, 'for email:', user.email)

      if (!adminCheck.isAdmin) {
        console.log('User is not admin, redirecting to dashboard')
        setIsCheckingAuth(false)
        router.push("/dashboard")
        return
      }

      console.log('User is admin! Loading data...')
      setIsAdmin(true)
      setIsCheckingAuth(false)
      loadAllData()
    }

    checkAdminAndLoadData()
  }, [user, authLoading, router])

  const loadAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadPositions(),
      loadDashboardStats(),
      loadApplications(),
      loadTests(),
    ])
    setIsLoading(false)
  }

  const loadPositions = async () => {
    const result = await getAllPositions()
    if (result.success) {
      setPositions(result.data)
    }
  }

  const loadDashboardStats = async () => {
    const result = await getDashboardStats()
    if (result.success && result.data) {
      setDashboardStats(result.data)
    }
  }

  const loadApplications = async () => {
    const result = await getAllApplications()
    if (result.success) {
      setApplications(result.data || [])
    }
  }

  const loadTests = async () => {
    const result = await getAllTests()
    if (result.success) {
      setTests(result.data || [])
    }
  }

  const handleEdit = (position: Position) => {
    setEditingId(position.id)
    setFormData({
      name: position.name,
      slug: position.slug,
      description: position.description,
      total_quota: position.total_quota,
      filled_quota: position.filled_quota,
      is_active: position.is_active,
    })
  }

  const handleSave = async (id: string) => {
    const result = await updatePosition(id, formData)
    if (result.success) {
      setEditingId(null)
      loadPositions()
    }
  }

  const handleCreate = async () => {
    const result = await createPosition(formData)
    if (result.success) {
      setShowCreateForm(false)
      setFormData({
        name: "",
        slug: "",
        description: "",
        total_quota: 14,
        filled_quota: 0,
        is_active: true,
      })
      loadPositions()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this position?")) {
      const result = await deletePosition(id)
      if (result.success) {
        loadPositions()
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowCreateForm(false)
    setFormData({
      name: "",
      slug: "",
      description: "",
      total_quota: 14,
      filled_quota: 0,
      is_active: true,
    })
  }

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    const result = await updateApplicationStatus(applicationId, newStatus as any)
    if (result.success) {
      // Reload data
      await Promise.all([loadApplications(), loadDashboardStats()])
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return
    }

    const result = await deleteApplication(applicationId)
    if (result.success) {
      // Reload data
      await Promise.all([loadApplications(), loadDashboardStats()])
    } else {
      alert(result.error || "Failed to delete application")
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

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-8 py-12 pt-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage recruitment process, positions, and applications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'dashboard'
              ? 'text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Dashboard
            {activeTab === 'dashboard' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'applications'
              ? 'text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Applications
            {activeTab === 'applications' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'positions'
              ? 'text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Positions
            {activeTab === 'positions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'tests'
              ? 'text-pink-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Tests
            {activeTab === 'tests' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {dashboardStats ? (
              <>
                <StatisticsCards stats={dashboardStats} isLoading={isLoading} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StatusBreakdown stats={dashboardStats} />
                  <PositionBreakdown stats={dashboardStats} />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading statistics...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <ApplicationsTable
              applications={applications}
              onViewDetails={handleViewDetails}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteApplication}
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <TestsTab tests={tests} positions={positions} onRefresh={loadTests} />
        )}

        {activeTab === 'positions' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                + Add New Position
              </button>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Position</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Position Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="e.g., UI/UX Designer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL-friendly)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="e.g., ui-ux"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Position description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Quota</label>
                        <input
                          type="number"
                          value={formData.total_quota}
                          onChange={(e) => setFormData({ ...formData, total_quota: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Filled Quota</label>
                        <input
                          type="number"
                          value={formData.filled_quota}
                          onChange={(e) => setFormData({ ...formData, filled_quota: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700">
                        Active (visible to applicants)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                      Create Position
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Positions Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quota</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {positions.map((position) => (
                        <tr key={position.id} className="hover:bg-gray-50">
                          {editingId === position.id ? (
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={formData.slug}
                                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={formData.filled_quota}
                                    onChange={(e) => setFormData({ ...formData, filled_quota: parseInt(e.target.value) })}
                                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                  <span className="py-2">/</span>
                                  <input
                                    type="number"
                                    value={formData.total_quota}
                                    onChange={(e) => setFormData({ ...formData, total_quota: parseInt(e.target.value) })}
                                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={formData.is_active}
                                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                  className="w-5 h-5 text-pink-600 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSave(position.id)}
                                    className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-800">{position.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{position.description}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{position.slug}</td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <span className="font-semibold text-pink-600">{position.filled_quota}</span>
                                  <span className="text-gray-400"> / </span>
                                  <span className="text-gray-600">{position.total_quota}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-pink-500 h-2 rounded-full"
                                    style={{ width: `${(position.filled_quota / position.total_quota) * 100}%` }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {position.is_active ? (
                                  <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(position)}
                                    className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(position.id)}
                                    className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedApplication(null)
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  )
}
