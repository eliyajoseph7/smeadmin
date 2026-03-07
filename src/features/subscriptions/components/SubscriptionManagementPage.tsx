import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/layout/PageHeader';
import { subscriptionApiService } from '../../../services/api/subscription-api-service';
import type { Subscription, SubscriptionStatus } from '../../../types/subscription';
import { 
  CreditCard, 
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SubscriptionManagementPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;
      filters.page = currentPage;
      filters.size = pageSize;

      const response = await subscriptionApiService.getSubscriptions(filters);
      setSubscriptions(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subscriptions');
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter, searchQuery, currentPage]);

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'EXPIRED':
        return <XCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <Pause className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = async (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSubscription(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Management"
        description="Manage customer subscriptions and billing"
        icon={CreditCard}
      />

      {/* Filters and Search */}
      <div className="px-2 py-6">
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | '')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <Button
              onClick={loadSubscriptions}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <div className="px-2 py-8">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(pageSize)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No subscriptions found</p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.subscriptionCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {subscription.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscription.customerName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.customerPhone || subscription.customerEmail || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {getStatusIcon(subscription.status)}
                          <span>{subscription.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(subscription.pricePaid, subscription.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.startDate && subscription.endDate
                          ? `${formatDate(subscription.startDate)} - ${formatDate(subscription.endDate)}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(subscription.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(subscription)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {subscriptions.length} of {totalElements} subscriptions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Subscription Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        title="Subscription Details"
      >
        {selectedSubscription && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Subscription Code</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedSubscription.subscriptionCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubscription.status)}`}>
                    {getStatusIcon(selectedSubscription.status)}
                    <span>{selectedSubscription.status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Subscription ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedSubscription.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Customer ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedSubscription.customerId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price Paid</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedSubscription.pricePaid, selectedSubscription.currency)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Currency</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Auto Renew</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.autoRenew ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Renewal Count</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.renewalCount}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Customer Name</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.customerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Customer Phone</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.customerPhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Customer Email</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.mobileNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.endDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Activation Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.activationDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Payment Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.lastPaymentDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Next Billing Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.nextBillingDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cancellation Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSubscription.cancellationDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Plan Name</label>
                  <p className="text-sm text-gray-900">{selectedSubscription.planName || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Information */}
            {selectedSubscription.cancellationDate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Information</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Cancellation Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedSubscription.cancellationDate)}</p>
                  </div>
                  {selectedSubscription.cancellationReason && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Cancellation Reason</label>
                      <p className="text-sm text-gray-900">{selectedSubscription.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
