import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Award,
  Search,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/layout/PageHeader';
import { customerService } from '../services/customer.service';
import type { Customer } from '../types/customer';
import { toast } from 'react-hot-toast';

export const CustomerSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    setError(null);
    setCustomer(null);

    try {
      const result = await customerService.searchByPhone(phoneNumber);
      
      if (result) {
        setCustomer(result);
        setError(null);
        toast.success('Customer found successfully');
      } else {
        setError('No customer found with this phone number');
        toast.error('Customer not found');
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStoreClick = (storeId: string) => {
    navigate(`/customer-support/store/${storeId}`, {
      state: { userId: customer?.user_id }
    });
  };

  const getSubscriptionBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
      case 'PENDING':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Customer Support"
        description="Search and manage customer information and support requests"
        icon={MessageSquare}
      />

      <div className="space-y-6 px-2 py-8">

      {/* Search Card */}
      <Card className={customer ? "p-4" : "p-6"}>
        {!customer && <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Customer by Phone Number</h2>}
        
        <form onSubmit={handleSearch}>
          <div className="flex gap-4">
            <div className="flex-1">
              {!customer && <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter phone number (e.g., +255702030405)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isSearching}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isSearching}
                className="flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Customer</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </Card>

      {customer && (
        <>
          {/* Customer Details Card */}
          <Card className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Section - Customer Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start mb-6">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    {customer.business_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{customer.business_name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <User className="w-3 h-3 mr-1" />
                        ID: {customer.user_id}
                      </span>
                      {customer.phone_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Phone Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Phone Not Verified
                        </span>
                      )}
                      {customer.web_activated ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Web Activated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Web Not Activated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-900">{customer.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(customer.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Total Stores</p>
                      <p className="font-semibold text-gray-900">{customer.number_of_stores}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Subscription Info */}
              <div className="border-l border-gray-200 pl-6">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-yellow-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Subscription</h4>
                </div>
                
                <div className="mb-4">
                  <span className={getSubscriptionBadgeClass(customer.subscription.subscription_status)}>
                    {customer.subscription.subscription_status}
                  </span>
                </div>

                <div className="mb-4">
                  <h5 className="text-lg font-bold text-primary-600 mb-1">{customer.subscription.plan_name}</h5>
                  <p className="text-sm text-gray-500">{customer.subscription.plan_type}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Price:</span>
                    <span className="font-semibold">{formatCurrency(customer.subscription.effective_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="font-semibold">{customer.subscription.duration_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Max Stores:</span>
                    <span className="font-semibold">{customer.subscription.max_stores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Max Products:</span>
                    <span className="font-semibold">{customer.subscription.max_products}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Ends: {formatDate(customer.subscription.subscription_end_date)}</span>
                  </div>
                  {customer.subscription.auto_renew && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Auto-Renew Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stores Table */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Stores ({customer.stores.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.stores.map((store) => (
                    <tr key={store.store_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-3">
                            #{store.store_number}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{store.store_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          {store.store_location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.store_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {store.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(store.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleStoreClick(store.store_id)}
                          variant="secondary"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
      </div>
    </>
  );
};
