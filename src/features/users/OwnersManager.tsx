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
  Users2,
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { OwnersApiService } from './services/owner.service';
import type { Owner, OwnersQueryParams } from './types/owner';

type OwnerFilters = {
  query: string;
  name: string;
  phoneNumber: string;
  sources: string[];
  webActivated: string;
  expiredPlan: string;
  registeredFrom: string;
  registeredTo: string;
  minStores: string;
  maxStores: string;
  minActiveStores: string;
  maxActiveStores: string;
  minProducts: string;
  maxProducts: string;
  minActiveProducts: string;
  maxActiveProducts: string;
  minSales: string;
  maxSales: string;
  minStaff: string;
  maxStaff: string;
  minPurchases: string;
  maxPurchases: string;
};

const defaultFilters: OwnerFilters = {
  query: '',
  name: '',
  phoneNumber: '',
  sources: [],
  webActivated: '',
  expiredPlan: '',
  registeredFrom: '',
  registeredTo: '',
  minStores: '',
  maxStores: '',
  minActiveStores: '',
  maxActiveStores: '',
  minProducts: '',
  maxProducts: '',
  minActiveProducts: '',
  maxActiveProducts: '',
  minSales: '',
  maxSales: '',
  minStaff: '',
  maxStaff: '',
  minPurchases: '',
  maxPurchases: '',
};

const sourceOptions = ['WEB', 'MOBILE', 'DEMO'];

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
  const [filters, setFilters] = useState<OwnerFilters>(defaultFilters);
  const [advancedDraft, setAdvancedDraft] = useState<OwnerFilters>(defaultFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const ownersService = new OwnersApiService();

  const buildFilterParams = (filterState: OwnerFilters = filters): OwnersQueryParams => {
    const params: OwnersQueryParams = {};

    Object.entries(filterState).forEach(([key, value]) => {
      if (key === 'sources') {
        if (filterState.sources.length > 0) {
          params.sources = filterState.sources;
        }
        return;
      }

      if (typeof value === 'string' && value.trim() !== '') {
        (params as Record<string, string>)[key] = value.trim();
      }
    });

    return params;
  };

  const loadOwners = async (filterState: OwnerFilters = filters) => {
    try {
      setLoading(true);
      const params: OwnersQueryParams = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sortDir,
        ...buildFilterParams(filterState)
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 }));
      if (pagination.page === 0) {
        loadOwners();
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [filters.query, filters.name, filters.phoneNumber]);

  const handleFilterChange = (field: keyof OwnerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAdvancedDraftChange = (field: keyof OwnerFilters, value: string) => {
    setAdvancedDraft(prev => ({ ...prev, [field]: value }));
  };

  const toggleDraftSource = (source: string) => {
    setAdvancedDraft(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(item => item !== source)
        : [...prev.sources, source]
    }));
  };

  const applyFilters = (nextFilters: OwnerFilters = filters) => {
    setFilters(nextFilters);
    setPagination(prev => ({ ...prev, page: 0 }));
    if (pagination.page === 0) {
      loadOwners(nextFilters);
    }
  };

  const resetAdvancedFilters = (baseFilters: OwnerFilters = filters) => ({
    ...baseFilters,
    sources: [],
    webActivated: '',
    expiredPlan: '',
    registeredFrom: '',
    registeredTo: '',
    minStores: '',
    maxStores: '',
    minActiveStores: '',
    maxActiveStores: '',
    minProducts: '',
    maxProducts: '',
    minActiveProducts: '',
    maxActiveProducts: '',
    minSales: '',
    maxSales: '',
    minStaff: '',
    maxStaff: '',
    minPurchases: '',
    maxPurchases: '',
  });

  const openAdvancedFilters = () => {
    setAdvancedDraft(filters);
    setShowAdvancedFilters(true);
  };

  const cancelAdvancedFilters = () => {
    const resetFilters = resetAdvancedFilters(filters);
    setAdvancedDraft(resetFilters);
    setShowAdvancedFilters(false);
    applyFilters(resetFilters);
  };

  const applyAdvancedFilters = () => {
    setShowAdvancedFilters(false);
    applyFilters(advancedDraft);
  };

  const resetAllFilters = () => {
    setFilters(defaultFilters);
    setAdvancedDraft(defaultFilters);
    setPagination(prev => ({ ...prev, page: 0 }));
    if (pagination.page === 0) {
      loadOwners(defaultFilters);
    }
  };

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

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (amount === undefined || amount === null) return 'N/A';
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

      <div className="space-y-6 px-2 py-4">

      <Card className="overflow-hidden border border-slate-200/70 bg-white">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Registered Owners ({pagination.totalElements})</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">Search by owner profile. Results update as you type.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={resetAllFilters} className="inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
              <Button type="button" onClick={openAdvancedFilters} className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Global Search</span>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.query}
                  onChange={(event) => handleFilterChange('query', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Name, phone, email, business"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
              <input
                value={filters.name}
                onChange={(event) => handleFilterChange('name', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="Owner or business name"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</span>
              <input
                value={filters.phoneNumber}
                onChange={(event) => handleFilterChange('phoneNumber', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="255..."
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rows</span>
              <select
                value={pagination.size}
                onChange={(event) => setPagination(prev => ({ ...prev, page: 0, size: Number(event.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </div>
      </Card>

      {/* Owners Table */}
      <Card className="overflow-hidden">
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
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Purchases
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Last Sale
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
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {owner.source || 'N/A'}
                        </span>
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
                        <div className="flex items-center text-sm font-medium text-slate-900">
                          <Package className="w-4 h-4 mr-1 text-slate-400" />
                          {owner.productStats.totalProducts}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-900 hidden">
                            {/* <DollarSign className="w-4 h-4 mr-1 text-green-500" /> */}
                            {owner.sales.totalRevenue ? formatCurrency(owner.sales.totalRevenue, 'TZS') : 'N/A'}
                          </div>
                          <div className="text-xs text-slate-600">
                            <div>{owner.sales.totalSalesCount}</div>
                            <div className="hidden">Profit: {owner.sales.totalProfit ? formatCurrency(owner.sales.totalProfit, 'TZS') : 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-slate-900">
                          {owner.purchases?.totalPurchases ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-900">
                          {owner.sales.lastSaleDate ? formatDate(owner.sales.lastSaleDate) : 'N/A'}
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

      <Modal
        isOpen={showAdvancedFilters}
        onClose={cancelAdvancedFilters}
        title="Advanced Owner Filters"
        size="2xl"
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sourceOptions.map((source) => {
                    const selected = advancedDraft.sources.includes(source);
                    return (
                      <button
                        key={source}
                        type="button"
                        onClick={() => toggleDraftSource(source)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {source}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Web Activation</span>
                <select
                  value={advancedDraft.webActivated}
                  onChange={(event) => handleAdvancedDraftChange('webActivated', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Any</option>
                  <option value="true">Web activated</option>
                  <option value="false">Not activated</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan Expiry</span>
                <select
                  value={advancedDraft.expiredPlan}
                  onChange={(event) => handleAdvancedDraftChange('expiredPlan', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Any</option>
                  <option value="true">Expired plan</option>
                  <option value="false">Active/non-expired plan</option>
                </select>
              </label>
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-slate-900">Registration Date</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered From</span>
                <input
                  type="datetime-local"
                  value={advancedDraft.registeredFrom}
                  onChange={(event) => handleAdvancedDraftChange('registeredFrom', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered To</span>
                <input
                  type="datetime-local"
                  value={advancedDraft.registeredTo}
                  onChange={(event) => handleAdvancedDraftChange('registeredTo', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </label>
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-slate-900">Business Activity Ranges</div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[
                ['Stores', 'minStores', 'maxStores'],
                ['Active Stores', 'minActiveStores', 'maxActiveStores'],
                ['Products', 'minProducts', 'maxProducts'],
                ['Active Products', 'minActiveProducts', 'maxActiveProducts'],
                ['Sales', 'minSales', 'maxSales'],
                ['Staff', 'minStaff', 'maxStaff'],
                ['Purchases', 'minPurchases', 'maxPurchases'],
              ].map(([label, minKey, maxKey]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      value={advancedDraft[minKey as keyof OwnerFilters] as string}
                      onChange={(event) => handleAdvancedDraftChange(minKey as keyof OwnerFilters, event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      value={advancedDraft[maxKey as keyof OwnerFilters] as string}
                      onChange={(event) => handleAdvancedDraftChange(maxKey as keyof OwnerFilters, event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      placeholder="Max"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={cancelAdvancedFilters} className="inline-flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="button" onClick={applyAdvancedFilters} className="inline-flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

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
                    <span className="text-sm font-medium text-gray-900">{selectedOwner.productStats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Active Products</span>
                    <span className="text-sm font-medium text-green-600">{selectedOwner.productStats.activeProducts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Subscription Information</h4>
              {selectedOwner.subscription ? (
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
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No active subscription</p>
                </div>
              )}
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
