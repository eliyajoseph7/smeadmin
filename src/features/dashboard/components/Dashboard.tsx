import React from "react";
import { Card } from "../../../components/ui/Card";
import { PageHeader } from "../../../components/layout/PageHeader";
import { PlatformSummary } from "../../../components/dashboard/PlatformSummary";
import {
  Users,
  ShoppingBag,
  DollarSign,
  BarChart3,
  LayoutDashboard,
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
      />

      {/* Platform Summary */}
      <div className="px-2 py-6">
        <PlatformSummary />
      </div>

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
