"use client"

import { DashboardStats } from "@/app/actions/statistics"
import { TrendingUp, Users, FileText, CheckCircle } from "lucide-react"

interface StatisticsCardsProps {
    stats: DashboardStats
    isLoading?: boolean
}

export function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        )
    }

    const cards = [
        {
            title: "Total Applications",
            value: stats.totalApplications,
            icon: FileText,
            color: "bg-blue-500",
            textColor: "text-blue-600",
            bgLight: "bg-blue-50",
        },
        {
            title: "In Review",
            value: stats.applicationsByStatus.submitted + stats.applicationsByStatus.document_screening,
            icon: Users,
            color: "bg-orange-500",
            textColor: "text-orange-600",
            bgLight: "bg-orange-50",
        },
        {
            title: "Accepted",
            value: stats.applicationsByStatus.accepted,
            icon: CheckCircle,
            color: "bg-green-500",
            textColor: "text-green-600",
            bgLight: "bg-green-50",
        },
        {
            title: "Recent (7 days)",
            value: stats.recentApplications,
            icon: TrendingUp,
            color: "bg-pink-500",
            textColor: "text-pink-600",
            bgLight: "bg-pink-50",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <div
                        key={card.title}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                            </div>
                            <div className={`${card.bgLight} p-3 rounded-xl`}>
                                <Icon className={`w-6 h-6 ${card.textColor}`} />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

interface StatusBreakdownProps {
    stats: DashboardStats
}

export function StatusBreakdown({ stats }: StatusBreakdownProps) {
    const statusItems = [
        { label: "Draft", count: stats.applicationsByStatus.draft, color: "bg-gray-500" },
        { label: "Submitted", count: stats.applicationsByStatus.submitted, color: "bg-blue-500" },
        { label: "Screening", count: stats.applicationsByStatus.document_screening, color: "bg-yellow-500" },
        { label: "Interview", count: stats.applicationsByStatus.interview, color: "bg-purple-500" },
        { label: "Accepted", count: stats.applicationsByStatus.accepted, color: "bg-green-500" },
        { label: "Rejected", count: stats.applicationsByStatus.rejected, color: "bg-red-500" },
    ]

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications by Status</h3>
            <div className="space-y-3">
                {statusItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

interface PositionBreakdownProps {
    stats: DashboardStats
}

export function PositionBreakdown({ stats }: PositionBreakdownProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications by Position</h3>
            <div className="space-y-4">
                {stats.applicationsByPosition.map((pos) => {
                    const percentage = pos.quota > 0 ? (pos.count / pos.quota) * 100 : 0
                    return (
                        <div key={pos.position}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{pos.position}</span>
                                <span className="text-sm font-bold text-gray-800">
                                    {pos.count} / {pos.quota}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {stats.acceptanceRate > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Acceptance Rate</span>
                        <span className="text-lg font-bold text-green-600">{stats.acceptanceRate}%</span>
                    </div>
                </div>
            )}
        </div>
    )
}
