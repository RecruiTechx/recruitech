"use client";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { StatisticsCards, StatusBreakdown, PositionBreakdown } from "@/components/admin/statistics-cards";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { ApplicationDetailModal } from "@/components/admin/application-detail-modal";
import { TestsTab } from "@/components/admin/tests-tab";

export default function AdminDashboardClient({
  positions,
  dashboardStats,
  applications,
  tests,
  userEmail
}: {
  positions: any[];
  dashboardStats: any;
  applications: any[];
  tests: any[];
  userEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'positions' | 'applications' | 'tests'>('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOTE: All data is loaded server-side and passed as props. If you want to add client-side editing, use API routes or mutate state here.

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-8 py-12 pt-32">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage recruitment process, positions, and applications</p>
        </div>
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'dashboard' ? 'text-pink-600' : 'text-gray-600 hover:text-gray-800'}`}>Dashboard{activeTab === 'dashboard' && (<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>)}</button>
          <button onClick={() => setActiveTab('applications')} className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'applications' ? 'text-pink-600' : 'text-gray-600 hover:text-gray-800'}`}>Applications{activeTab === 'applications' && (<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>)}</button>
          <button onClick={() => setActiveTab('positions')} className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'positions' ? 'text-pink-600' : 'text-gray-600 hover:text-gray-800'}`}>Positions{activeTab === 'positions' && (<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>)}</button>
          <button onClick={() => setActiveTab('tests')} className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'tests' ? 'text-pink-600' : 'text-gray-600 hover:text-gray-800'}`}>Tests{activeTab === 'tests' && (<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>)}</button>
        </div>
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {dashboardStats ? (
              <>
                <StatisticsCards stats={dashboardStats} isLoading={false} />
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
              onViewDetails={app => { setSelectedApplication(app); setIsModalOpen(true); }}
              onStatusUpdate={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
        {activeTab === 'tests' && (
          <TestsTab tests={tests} positions={positions} onRefresh={() => {}} />
        )}
        {activeTab === 'positions' && (
          <div className="space-y-6">
            {/* You can add position management UI here if needed */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-12 text-center text-gray-500">Position management coming soon.</div>
            </div>
          </div>
        )}
      </main>
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedApplication(null); }}
        onStatusUpdate={() => {}}
      />
    </>
  );
}
