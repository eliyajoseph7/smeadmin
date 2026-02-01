import React from "react";
import { Card } from "../../../components/ui/Card";
import { PageHeader } from "../../../components/layout/PageHeader";
import {
  Users,
  ShoppingBag,
  DollarSign,
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  Package,
} from "lucide-react";

const recentActivity = [
  {
    id: 1,
    user: "John Doe",
    action: "Created new product",
    time: "2 minutes ago",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "Updated inventory",
    time: "5 minutes ago",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Processed order #1234",
    time: "10 minutes ago",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "Added new customer",
    time: "15 minutes ago",
  },
];

export const Dashboard: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome to your RINO Admin dashboard"
        icon={LayoutDashboard}
      >
        {/* Stats Cards - Matching smeweb Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider font-medium text-slate-500 mb-1">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-slate-900">2,847</p>
                <p className="text-xs text-emerald-600 font-medium">
                  +12% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Total Products Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 rounded-xl border border-slate-200/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-200/50 group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider font-medium text-slate-500 mb-1">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-slate-900">1,234</p>
                <p className="text-xs text-emerald-600 font-medium">
                  +8% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 rounded-xl border border-slate-200/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-200/50 group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-50 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider font-medium text-slate-500 mb-1">
                  Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900">$89,432</p>
                <p className="text-xs text-emerald-600 font-medium">
                  +23% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50 rounded-xl border border-slate-200/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-200/50 group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-50 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider font-medium text-slate-500 mb-1">
                  Orders
                </p>
                <p className="text-2xl font-bold text-slate-900">456</p>
                <p className="text-xs text-red-600 font-medium">
                  -2% from last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 py-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Analytics */}
          <Card className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Analytics
              </h3>
              <select className="input-modern text-sm py-2">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  Chart will be implemented with ApexCharts
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="btn-primary">
                <Users className="h-5 w-5 mr-2" />
                Add User
              </button>
              <button className="btn-secondary">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add Product
              </button>
              <button className="btn-secondary">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Reports
              </button>
              <button className="btn-secondary">
                <DollarSign className="h-5 w-5 mr-2" />
                Process Payment
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="dashboard-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                  </div>
                  <div className="text-sm text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="#"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all activity →
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
