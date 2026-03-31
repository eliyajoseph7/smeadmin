import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { activityApiService } from '../../services/api/activity-api-service';
import type { ActiveUsersPerServiceResponse } from '../../types/activity';

interface ActiveUsersPerServiceProps {
  className?: string;
}

export const ActiveUsersPerService: React.FC<ActiveUsersPerServiceProps> = ({ className = '' }) => {
  const [data, setData] = useState<ActiveUsersPerServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | 'today'>('1h');
  const [refreshing, setRefreshing] = useState(false);

  const loadActiveUsers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      let response: ActiveUsersPerServiceResponse;
      switch (timeRange) {
        case '24h':
          response = await activityApiService.getActiveUsersLast24Hours();
          break;
        case 'today':
          response = await activityApiService.getActiveUsersToday();
          break;
        default:
          response = await activityApiService.getActiveUsersLastHour();
      }
      
      setData(response);
    } catch (error: any) {
      console.error('Failed to load active users per service:', error);
      toast.error(error.message || 'Failed to load active users data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActiveUsers(false);
  };

  useEffect(() => {
    loadActiveUsers();
  }, [timeRange]);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'sale-service':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'purchase-service':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'product-service':
        return <Package className="w-5 h-5 text-orange-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'sale-service':
        return 'bg-green-50 border-green-200';
      case 'purchase-service':
        return 'bg-blue-50 border-blue-200';
      case 'product-service':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getServiceName = (service: string) => {
    switch (service) {
      case 'sale-service':
        return 'Sales';
      case 'purchase-service':
        return 'Purchases';
      case 'product-service':
        return 'Products';
      default:
        return service;
    }
  };

  const getTotalActiveUsers = () => {
    if (!data) return 0;
    return Object.values(data).reduce((sum, count) => sum + count, 0);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '1h':
        return 'Last Hour';
      case '24h':
        return 'Last 24 Hours';
      case 'today':
        return 'Today';
      default:
        return 'Last Hour';
    }
  };

  if (loading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="animate-pulse bg-gray-200 h-6 w-40 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                <div className="animate-pulse bg-gray-200 w-10 h-10 rounded-full"></div>
                <div className="flex-1">
                  <div className="animate-pulse bg-gray-200 h-4 w-20 mb-2 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Active Users by Service
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getTotalActiveUsers()} total active users • {getTimeRangeLabel()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-gray-700">Period:</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {[
                  { key: '1h', label: '1h' },
                  { key: '24h', label: '24h' },
                  { key: 'today', label: 'Today' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTimeRange(key as any)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      timeRange === key
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              disabled={refreshing}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {data && Object.keys(data).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data).map(([service, count]) => (
              <div
                key={service}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors hover:shadow-sm ${getServiceColor(service)}`}
              >
                <div className="p-2 rounded-full bg-white border">
                  {getServiceIcon(service)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getServiceName(service)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {count}
                    </p>
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="w-3 h-3 mr-1" />
                      <span>users</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active users data available</p>
            <p className="text-gray-400 text-sm">Try refreshing or check back later</p>
          </div>
        )}

        {data && getTotalActiveUsers() > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>
                Total of {getTotalActiveUsers()} active users across all services in the {getTimeRangeLabel().toLowerCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
