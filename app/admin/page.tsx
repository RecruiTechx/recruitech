import { getAllPositions, checkIsAdmin } from "@/app/actions/positions";
import { getDashboardStats } from "@/app/actions/statistics";
import { getAllApplications } from "@/app/actions/application";
import { getAllTests } from "@/app/actions/tests";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { cookies } from "next/headers";

// Helper to get user email from cookie/session (for demo, you may want to use your real auth logic)
async function getUserEmailFromCookie() {
  // This is a placeholder. Replace with your real session/cookie logic.
  const cookieStore = await cookies();
  // Example: get from a cookie named "user_email"
  const cookie = cookieStore.get ? cookieStore.get("user_email") : undefined;
  const email = cookie?.value;
  return email || "";
}

export default async function AdminDashboardPage() {
  // Get user email from cookie/session
  const userEmail = await getUserEmailFromCookie();
  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Not Authenticated</h1>
          <p className="text-gray-600">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }
  // Check admin
  const adminCheck = await checkIsAdmin(userEmail);
  if (!adminCheck.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  // Load all data server-side
  const [positionsRes, dashboardStatsRes, applicationsRes, testsRes] = await Promise.all([
    getAllPositions(),
    getDashboardStats(),
    getAllApplications(),
    getAllTests(),
  ]);
  return (
    <AdminDashboardClient
      positions={positionsRes.success ? positionsRes.data : []}
      dashboardStats={dashboardStatsRes.success ? dashboardStatsRes.data : null}
      applications={Array.isArray(applicationsRes?.data) ? applicationsRes.data : []}
      tests={Array.isArray(testsRes?.data) ? testsRes.data : []}
      userEmail={userEmail}
    />
  );
}
