import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
  Users, 
  Store, 
  Package, 
  UserCheck, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { platformSummaryService } from '../../services/api/platform-summary-api-service';
import type { PlatformSummary as PlatformSummaryData } from '../../types/platform-summary';
import { toast } from 'react-hot-toast';

export const PlatformSummary: React.FC = () => {
  const [summary, setSummary] = useState<PlatformSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlatformSummary();
  }, []);

  const loadPlatformSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformSummaryService.getPlatformSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load platform summary:', err);
      setError('Failed to load platform summary');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('TZS', currency);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPlatformSummary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Owners */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Owners</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalRegisteredOwners)}</p>
            </div>
          </div>
        </Card>

        {/* Total Stores */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalStores)}</p>
              <p className="text-xs text-green-600">{formatNumber(summary.activeStores)} active</p>
            </div>
          </div>
        </Card>

        {/* Total Products */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalProducts)}</p>
            </div>
          </div>
        </Card>

        {/* Total Staff */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalStaff)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue Statistics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Payments</span>
              <span className="font-semibold">{formatNumber(summary.revenueStats.totalPaymentsCount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Payments</span>
              <span className="font-semibold text-green-600">{formatNumber(summary.revenueStats.todayPaymentsCount)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(summary.revenueStats.totalPaymentsCollected, summary.revenueStats.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Revenue</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(summary.revenueStats.todayPaymentsCollected, summary.revenueStats.currency)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* SMS Expenses */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">SMS Expenses</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total SMS Sent</span>
              <span className="font-semibold">{formatNumber(summary.smsExpenses.totalSmsSent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's SMS</span>
              <span className="font-semibold text-blue-600">{formatNumber(summary.smsExpenses.todaySmsSent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost per SMS</span>
              <span className="font-semibold">
                {formatCurrency(summary.smsExpenses.costPerSms, summary.smsExpenses.currency)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total SMS Cost</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(summary.smsExpenses.totalSmsCost, summary.smsExpenses.currency)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Statistics */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Subscription Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatNumber(summary.subscriptionStats.activeSubscriptions)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-xl font-bold text-yellow-600">{formatNumber(summary.subscriptionStats.pendingSubscriptions)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-blue-500 mr-1" />
              <span className="text-sm text-gray-600">Trial</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatNumber(summary.subscriptionStats.trialSubscriptions)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-1" />
              <span className="text-sm text-gray-600">Expired</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{formatNumber(summary.subscriptionStats.expiredSubscriptions)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-5 h-5 text-red-500 mr-1" />
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
            <p className="text-xl font-bold text-red-600">{formatNumber(summary.subscriptionStats.cancelledSubscriptions)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500 mr-1" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{formatNumber(summary.subscriptionStats.totalSubscriptions)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
