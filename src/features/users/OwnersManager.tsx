import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/layout/PageHeader';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Eye, 
  Store, 
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Package,
  Users2
} from 'lucide-react';
import { OwnersApiService } from './services/owner.service';
import type { Owner, OwnersQueryParams } from './types/owner';

export const OwnersManager: React.FC = () => {
  const navigate = useNavigate();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Pagination and sorting state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const ownersService = new OwnersApiService();

  const loadOwners = async () => {
    try {
      setLoading(true);
      const params: OwnersQueryParams = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sortDir
      };
      const response = await ownersService.getOwners(params);
      
      // Service returns the response object directly, so access data from response.data
      const ownersData = response.data?.content || [];
      const paginationData = {
        page: response.data?.number || 0,
        size: response.data?.size || 20,
        totalPages: response.data?.totalPages || 0,
        totalElements: response.data?.totalElements || 0
      };
      
      setOwners(ownersData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Failed to load owners:', error);
      toast.error('Failed to load owners data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, [pagination.page, pagination.size, sortBy, sortDir]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const handleViewOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };

  const handleViewMoreInCustomerSupport = (owner: Owner) => {
    // Navigate to customer support page with phone number as URL parameter
    navigate(`/customer-support?phone=${encodeURIComponent(owner.phoneNumber)}`);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('TZS', currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Store Owners"
        description="Manage and view registered store owners"
        icon={Users}
      />

      <div className="space-y-6 px-2 py-8">

      {/* Owners Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Registered Owners ({pagination.totalElements})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading owners...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No owners found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('fullName')}
                        className="flex items-center space-x-1 hover:text-slate-800"
                      >
                        <span>Owner Details</span>
                        {sortBy === 'fullName' && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Stores
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('registeredAt')}
                        className="flex items-center space-x-1 hover:text-slate-800"
                      >
                        <span>Registered</span>
                        {sortBy === 'registeredAt' && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {owners.map((owner) => (
                    <tr key={owner.ownerId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800">
                              {owner.fullName}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="flex items-center text-xs text-slate-500">
                                <Mail className="w-3 h-3 mr-1" />
                                {owner.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="flex items-center text-xs text-slate-500">
                                <Phone className="w-3 h-3 mr-1" />
                                {owner.phoneNumber}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium hidden ${
                                owner.webActivated 
                                  ? 'bg-green-50 text-green-700' 
                                  : 'bg-red-50 text-red-700'
                              }`}>
                                {owner.webActivated ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Web Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Web Inactive
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-900">
                            <Store className="w-4 h-4 mr-1 text-slate-400" />
                            {owner.activeStores}/{owner.totalStores} Active
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Users2 className="w-3 h-3 mr-1" />
                            {owner.totalStaff} Staff
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Package className="w-3 h-3 mr-1" />
                            {owner.totalProducts} Products
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getSubscriptionStatusColor(owner.subscription?.status)}`}>
                            {owner.subscription?.status || 'N/A'}
                          </span>
                          <div className="text-xs text-slate-600">
                            <div>{owner.subscription?.planName || 'No Plan'}</div>
                            <div>{owner.subscription?.startDate ? formatDate(owner.subscription.startDate) : 'N/A'} - {owner.subscription?.endDate ? formatDate(owner.subscription.endDate) : 'N/A'}</div>
                            {owner.subscription?.autoRenew && (
                              <div className="text-green-600">Auto-renew: On</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-900 hidden">
                            {/* <DollarSign className="w-4 h-4 mr-1 text-green-500" /> */}
                            {formatCurrency(owner.sales.totalRevenue, 'TZS')}
                          </div>
                          <div className="text-xs text-slate-600">
                            <div>{owner.sales.totalSalesCount} sales</div>
                            <div className="hidden">Profit: {formatCurrency(owner.sales.totalProfit, 'TZS')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-900">
                          {formatDate(owner.registeredAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => handleViewOwner(owner)}
                            variant="ghost"
                            className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200/60"
                            title="View owner details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {pagination.page * pagination.size + 1} to{' '}
              {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
              {pagination.totalElements} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 0}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i;
                  return (
                    <Button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      variant={pagination.page === page ? "primary" : "secondary"}
                      size="sm"
                      className="w-8 h-8"
                    >
                      {page + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages - 1}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Owner Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Owner Details"
        size="lg"
      >
        {selectedOwner && (
          <div className="space-y-6">
            {/* Owner Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOwner.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOwner.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOwner.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Web Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      selectedOwner.webActivated 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {selectedOwner.webActivated ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Business Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Total Stores</span>
                    <span className="text-sm font-medium text-gray-900">{selectedOwner.totalStores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Active Stores</span>
                    <span className="text-sm font-medium text-green-600">{selectedOwner.activeStores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Total Staff</span>
                    <span className="text-sm font-medium text-gray-900">{selectedOwner.totalStaff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Total Products</span>
                    <span className="text-sm font-medium text-gray-900">{selectedOwner.totalProducts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Subscription Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getSubscriptionStatusColor(selectedOwner.subscription.status)}`}>
                    {selectedOwner.subscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOwner.subscription.planName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Auto Renew</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    selectedOwner.subscription.autoRenew 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    {selectedOwner.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedOwner.subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedOwner.subscription.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Renewal Count</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOwner.subscription.renewalCount}</p>
                </div>
              </div>
            </div>

            {/* Sales Performance */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sales Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Sales</p>
                  <p className="text-lg font-bold text-gray-900">{selectedOwner.sales.totalSalesCount}</p>
                </div>
                <div className="hidden">
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedOwner.sales.totalRevenue, 'TZS')}
                  </p>
                </div>
                <div className="hidden">
                  <p className="text-xs text-gray-500">Total Profit</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(selectedOwner.sales.totalProfit, 'TZS')}
                  </p>
                </div>
                <div className="hidden">
                  <p className="text-xs text-gray-500">Payments Collected</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(selectedOwner.sales.totalPaymentsCollected, 'TZS')}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Date */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Registration Information</h4>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-900">
                  Registered on {new Date(selectedOwner.registeredAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowViewModal(false)}
                variant="secondary"
              >
                Close
              </Button>
              <Button
                onClick={() => handleViewMoreInCustomerSupport(selectedOwner)}
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700"
              >
                View More in Customer Support
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </>
  );
};
