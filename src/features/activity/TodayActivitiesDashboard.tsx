import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/layout/PageHeader';
import { toast } from 'react-hot-toast';
import { 
  Activity, 
  Clock, 
  Users, 
  Store, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { activityApiService } from '../../services/api/activity-api-service';
import type { 
  ActivityResponse, 
  ActivityType as ActivityTypeEnum 
} from '../../types/activity';

export const TodayActivitiesDashboard: React.FC = () => {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTodayActivities = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const response = await activityApiService.getTodayActivitiesEndpoint();
      setData(response);
    } catch (error: any) {
      console.error('Failed to load today\'s activities:', error);
      toast.error(error.message || 'Failed to load today\'s activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodayActivities(false);
  };

  useEffect(() => {
    loadTodayActivities();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString();
  };

  const getActivityIcon = (type: ActivityTypeEnum) => {
    switch (type) {
      case 'SALE':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'SALE_DRAFT':
        return <ShoppingCart className="w-5 h-5 text-yellow-600" />;
      case 'SALE_CANCELLED':
        return <ShoppingCart className="w-5 h-5 text-red-600" />;
      case 'PURCHASE':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'PURCHASE_DRAFT':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'PURCHASE_CANCELLED':
        return <Package className="w-5 h-5 text-red-600" />;
      case 'PRODUCT_CREATE':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'PRODUCT_UPDATE':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'STOCK_ADJUSTMENT':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityTypeEnum) => {
    switch (type) {
      case 'SALE':
        return 'bg-green-50 border-green-200';
      case 'SALE_DRAFT':
        return 'bg-yellow-50 border-yellow-200';
      case 'SALE_CANCELLED':
        return 'bg-red-50 border-red-200';
      case 'PURCHASE':
        return 'bg-blue-50 border-blue-200';
      case 'PURCHASE_DRAFT':
        return 'bg-yellow-50 border-yellow-200';
      case 'PURCHASE_CANCELLED':
        return 'bg-red-50 border-red-200';
      case 'PRODUCT_CREATE':
        return 'bg-green-50 border-green-200';
      case 'PRODUCT_UPDATE':
        return 'bg-orange-50 border-orange-200';
      case 'STOCK_ADJUSTMENT':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityTypeLabel = (type: ActivityTypeEnum) => {
    switch (type) {
      case 'SALE':
        return 'Sale Completed';
      case 'SALE_DRAFT':
        return 'Sale Draft';
      case 'SALE_CANCELLED':
        return 'Sale Cancelled';
      case 'PURCHASE':
        return 'Purchase Completed';
      case 'PURCHASE_DRAFT':
        return 'Purchase Draft';
      case 'PURCHASE_CANCELLED':
        return 'Purchase Cancelled';
      case 'PRODUCT_CREATE':
        return 'Product Created';
      case 'PRODUCT_UPDATE':
        return 'Product Updated';
      case 'STOCK_ADJUSTMENT':
        return 'Stock Adjusted';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Today's Activities"
          description="All activities from today (since midnight)"
          icon={Calendar}
        />
        <div className="space-y-6 px-2 py-8">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded-full"></div>
                  </div>
                  <div className="animate-pulse bg-gray-200 h-8 w-20 mb-2 rounded"></div>
                </div>
              ))}
            </div>

            {/* Activities List Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4">
                    <div className="animate-pulse bg-gray-200 w-10 h-10 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="animate-pulse bg-gray-200 h-4 w-48 rounded"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-32 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Today's Activities"
        description="All activities from today (since midnight)"
        icon={Calendar}
      />

      <div className="space-y-6 px-2 py-8">
        {data ? (
          <>
            {/* Header with Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Today's Summary</h2>
                <p className="text-gray-600 mt-1">
                  {data.activities.length} activities from {data.summary.activeUsersCount} users across {data.summary.activeStoresCount} stores
                </p>
              </div>
              
              <Button
                onClick={handleRefresh}
                variant="secondary"
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.totalActivities}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sales</p>
                    <p className="text-2xl font-bold text-green-600">{data.summary.totalSales}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Purchases</p>
                    <p className="text-2xl font-bold text-blue-600">{data.summary.totalPurchases}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Product Updates</p>
                    <p className="text-2xl font-bold text-orange-600">{data.summary.totalProductUpdates}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-full">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Today's Activities List */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Activities Today ({data.activities.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  From {new Date(data.summary.periodStart).toLocaleTimeString()} to {new Date(data.summary.periodEnd).toLocaleTimeString()}
                </p>
              </div>
              
              {data.activities.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activities found for today</p>
                  <p className="text-gray-400 text-sm">Activities will appear here as they happen</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {data.activities.map((activity) => (
                    <div key={activity.activityId} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full border ${getActivityColor(activity.activityType)}`}>
                          {getActivityIcon(activity.activityType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.description}
                              </p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {getActivityTypeLabel(activity.activityType)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-600 space-x-4">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {activity.userName || 'System'}
                            </span>
                            <span className="flex items-center">
                              <Store className="w-3 h-3 mr-1" />
                              {activity.storeName || 'Unknown Store'}
                            </span>
                            {activity.amount && (
                              <span className="flex items-center font-medium text-green-600">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-1 text-xs text-gray-500">
                            Ref: {activity.entityReference} • {activity.serviceName} • {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Period Info */}
            <Card className="p-4">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Today: {new Date(data.summary.periodStart).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{data.summary.activeUsersCount} active users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4" />
                  <span>{data.summary.activeStoresCount} active stores</span>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No activity data available for today</p>
            <p className="text-gray-400 text-sm">Check back later or try refreshing</p>
          </div>
        )}
      </div>
    </>
  );
};
