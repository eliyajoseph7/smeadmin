import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  CreditCard,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  MapPin,
  Phone,
  Calendar,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/layout/PageHeader';
import { customerService } from '../services/customer.service';
import type { 
  StoreUsersResponse, 
  ProductsResponse, 
  PurchasePlansResponse, 
  SalesResponse, 
  ExpensesResponse,
  PaymentsResponse 
} from '../types/store';
import { toast } from 'react-hot-toast';

type TabType = 'products' | 'sales' | 'purchases' | 'expenses' | 'users' | 'payments';

export const StoreDetailsPageEnhanced: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = (location.state as { userId?: string })?.userId;
  
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [isLoading, setIsLoading] = useState(false);
  const [storeUsers, setStoreUsers] = useState<StoreUsersResponse | null>(null);
  const [products, setProducts] = useState<ProductsResponse | null>(null);
  const [purchases, setPurchases] = useState<PurchasePlansResponse | null>(null);
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [payments, setPayments] = useState<PaymentsResponse | null>(null);
  const [saleType, setSaleType] = useState<'QUOTATION' | 'DIRECT'>('DIRECT');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!storeId) return;
    
    const loadStoreInfo = async () => {
      if (!storeUsers) {
        const data = await customerService.getStoreUsers(storeId);
        setStoreUsers(data);
      }
    };

    loadStoreInfo();
    loadTabData('products');
  }, [storeId]);

  const loadTabData = async (tab: TabType) => {
    if (!storeId) return;
    
    console.log('Loading data for tab:', tab);
    setIsLoading(true);
    try {
      switch (tab) {
        case 'products':
          if (!products) {
            console.log('Fetching products...');
            const data = await customerService.getStoreProducts(storeId);
            setProducts(data);
          }
          break;
        case 'sales':
          if (!sales) {
            console.log('Fetching sales...');
            const data = await customerService.getStoreSales(storeId, saleType);
            setSales(data);
          }
          break;
        case 'purchases':
          if (!purchases) {
            console.log('Fetching purchases...');
            const data = await customerService.getStorePurchasePlans(storeId);
            setPurchases(data);
          }
          break;
        case 'expenses':
          console.log('Expenses case - current expenses state:', expenses);
          if (!expenses) {
            console.log('Fetching expenses for storeId:', storeId);
            const data = await customerService.getStoreExpenses(storeId);
            console.log('Expenses data received:', data);
            setExpenses(data);
          } else {
            console.log('Expenses already loaded, skipping fetch');
          }
          break;
        case 'users':
          if (!storeUsers) {
            console.log('Fetching users...');
            const data = await customerService.getStoreUsers(storeId);
            setStoreUsers(data);
          }
          break;
        case 'payments':
          if (userId && !payments) {
            console.log('Fetching payments...');
            const data = await customerService.getUserPayments(userId);
            setPayments(data);
          }
          break;
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    console.log('Tab changed to:', tab);
    setActiveTab(tab);
    loadTabData(tab);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && !storeUsers && !products && !purchases && !sales && !expenses && !payments) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Store Analytics Dashboard"
        description="Comprehensive store performance and management overview"
        icon={BarChart3}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700">
            <Activity className="w-4 h-4" />
            <span>Live View</span>
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-6 px-2 py-8">

      {/* Enhanced Store Info Card */}
      {storeUsers && (
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 lg:border-r lg:pr-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{storeUsers.store_name}</h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      storeUsers.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {storeUsers.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-base">{storeUsers.store_description || 'Store management and operations center'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <Hash className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Code</div>
                    <div className="font-bold text-gray-900">{storeUsers.store_code}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <MapPin className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</div>
                    <div className="font-bold text-gray-900">{storeUsers.store_location}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <Phone className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</div>
                    <div className="font-bold text-gray-900">{storeUsers.staff_phone_number || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <Calendar className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</div>
                    <div className="font-bold text-gray-900 text-sm">{formatDate(storeUsers.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <Users className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</div>
                    <div className="font-bold text-gray-900">{storeUsers.total_users}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                  <Package className="text-gray-400 mr-3" size={20} />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</div>
                    <div className="font-bold text-gray-900">{products?.totalElements || 0}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-3 border border-primary-200">
                    <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">Store ID</div>
                    <code className="block text-xs text-primary-700 break-all leading-relaxed font-mono">{storeUsers.store_id}</code>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Store Number</div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-md text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                        #{storeUsers.store_number}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Metrics Dashboard */}
      {storeUsers && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">+12.5%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Sales</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(sales?.total_items ? sales.total_items * 25000 : 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{products?.totalElements || 0}</p>
            <p className="text-xs text-gray-500 mt-1">In inventory</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">+8.2%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{purchases?.totalElements || 0}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                <Star className="w-3 h-3 inline mr-1" />
                Active
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Team Members</h3>
            <p className="text-2xl font-bold text-gray-900">{storeUsers.total_users}</p>
            <p className="text-xs text-gray-500 mt-1">Store staff</p>
          </Card>
        </div>
      )}

      {/* Quick Actions Bar */}
      {storeUsers && (
        <Card className="p-4 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 hover:bg-blue-50">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2 hover:bg-red-50">
                  <AlertCircle className="w-4 h-4" />
                  <span>Alerts</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2 hover:bg-yellow-50">
                  <Zap className="w-4 h-4" />
                  <span>Automation</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Tabs */}
      <Card className="shadow-lg">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'sales', label: 'Sales', icon: TrendingUp },
              { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'payments', label: 'Payments', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 rounded-t-lg`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
                <p className="text-gray-500">Loading {activeTab} data...</p>
              </div>
            ) : (
              <div>
                {/* Products Tab */}
                {activeTab === 'products' && products && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-gray-900">Products Inventory</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {products.totalElements} items
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className='flex'>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button size="sm" className='flex'>
                          <Package className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Code</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Price</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Qty</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.content?.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded text-sm font-mono">{product.productCode}</code>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(product.sellingPrice)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(product.costPrice)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900">{product.stockDetails.quantity.toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  product.stockDetails.isOutOfStock ? 'bg-red-100 text-red-800' :
                                  product.stockDetails.isLowStock ? 'bg-yellow-100 text-yellow-800' :
                                  product.stockDetails.isInStock ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.stockDetails.isOutOfStock ? 'Out of Stock' :
                                   product.stockDetails.isLowStock ? 'Low Stock' :
                                   product.stockDetails.isInStock ? 'In Stock' : 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(product.stockDetails.lastUpdatedAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sales Tab */}
                {activeTab === 'sales' && sales && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-gray-900">Sales Overview</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {sales.totalElements} sales
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={saleType}
                          onChange={(e) => setSaleType(e.target.value as 'QUOTATION' | 'DIRECT')}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="DIRECT">Direct Sales</option>
                          <option value="QUOTATION">Quotations</option>
                        </select>
                        <Button variant="outline" size="sm" className="flex">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sale Number</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subtotal</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sale Date</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sales.content?.map((sale) => (
                            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded text-sm font-mono">{sale.saleNumber}</code>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  sale.saleStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  sale.saleStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {sale.saleStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.totalItems}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.totalQuantity.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(sale.subtotal)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(sale.totalAmount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-green-600">{formatCurrency(sale.totalProfit)}</div>
                                <div className="text-xs text-gray-500">{sale.profitMarginPercentage.toFixed(2)}% margin</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {sale.paymentMethod}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.saleDate)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && purchases && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-gray-900">Purchases</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {purchases.totalElements} plans
                        </span>
                      </div>
                      <Button size="sm" className="flex">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Items</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estimated Cost</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actual Cost</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.content.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{purchase.planName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{purchase.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {purchase.purchaseType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  purchase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  purchase.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {purchase.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.totalItems}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.totalEstimatedCost)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(purchase.totalActualCost)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(purchase.createdAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Expenses Tab */}
                {activeTab === 'expenses' && (
                  expenses ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-gray-900">Expenses</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {expenses.total} expenses
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="flex">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expense Number</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expense Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {expenses.items?.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded text-sm font-mono">{expense.expenseNumber}</code>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {expense.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{expense.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.notes || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.expenseDate)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.createdAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                No expenses found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="text-lg font-semibold text-gray-900 mb-2">No Expenses Data</div>
                      <p className="text-gray-500">Expenses data is loading or not available.</p>
                      <p className="text-xs text-gray-400 mt-2">Debug: expenses = {JSON.stringify(expenses)}</p>
                    </div>
                  )
                )}

                {/* Users Tab */}
                {activeTab === 'users' && storeUsers && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-gray-900">Store Users</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          {storeUsers.total_users} users
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="flex">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Added At</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {storeUsers.users?.map((user) => (
                            <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phoneNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-cyan-100 text-cyan-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.addedAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && payments && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {payments.response_body.length} payments
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="flex">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Ref</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscription</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile Number</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Method</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Initiated At</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.response_body?.map((payment, index) => (
                            <tr key={payment.id || `payment-${index}`} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{payment.paymentReference}</div>
                                {payment.externalReference && (
                                  <div className="text-xs text-gray-500">{payment.externalReference}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{payment.subscriptionCode}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.planName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)} {payment.currency}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{payment.mobileNumber}</div>
                                {payment.providerName && (
                                  <div className="text-xs text-gray-500">{payment.providerName}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {payment.paymentMethod.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                  payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                  payment.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.status}
                                </span>
                                {payment.failureReason && (
                                  <div className="text-xs text-red-600 mt-1">{payment.failureReason}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{formatDate(payment.initiatedAt)}</div>
                                {payment.completedAt && (
                                  <div className="text-xs text-green-600">Completed: {formatDate(payment.completedAt)}</div>
                                )}
                                {payment.failedAt && (
                                  <div className="text-xs text-red-600">Failed: {formatDate(payment.failedAt)}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
      </div>
    </>
  );
};
