import { BarChart3, Bell, BriefcaseBusinessIcon, ChartAreaIcon, ConstructionIcon, FoldersIcon, LayoutDashboard, MapPinCheckIcon, Search, Settings, Users } from 'lucide-react';
import React, { Suspense} from 'react';
const DashboardSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/DashboardSkeletonLoader"));

const Dashboard = () => {
  return (
    <section>
      <Suspense fallback={<DashboardSkeletonLoader />}>
        <div className="min-h-screen bg-gray-50">

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
              <p className="text-gray-600 mt-1">Here's what's happening with your application today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 transform transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-50">Total Users</p>
                    <p className="text-3xl font-bold text-white mt-2">--</p>
                  </div>
                  <Users className="w-12 h-12 text-gray-50 opacity-40" />
                </div>
              </div>

              <div className="bg-linear-to-br from-sky-500 to-sky-600 rounded-lg p-6 transform transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-50">Analytics</p>
                    <p className="text-3xl font-bold text-white mt-2">--</p>
                  </div>
                  <ChartAreaIcon className="w-12 h-12 text-gray-50 opacity-40" />
                </div>
              </div>

              <div className="bg-linear-to-br from-slate-400 to-slate-500 rounded-lg p-6 transform transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-50">Visits</p>
                    <p className="text-3xl font-bold text-white mt-2">--</p>
                  </div>
                  <MapPinCheckIcon className="w-12 h-12 text-gray-50 opacity-40" />
                </div>
              </div>

              <div className="bg-linear-to-br from-orange-400 to-orange-500 rounded-lg p-6 transform transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-50">Assets</p>
                    <p className="text-3xl font-bold text-white mt-2">--</p>
                  </div>
                  <FoldersIcon className="w-12 h-12 text-gray-50 opacity-40" />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
                    <ConstructionIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Application in Development</h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This is a placeholder dashboard. Content and functionality will be added as development progresses.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Suspense>
    </section>
  )
}

export default Dashboard