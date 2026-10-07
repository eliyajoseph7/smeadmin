import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  MessageSquare,
  Key,
  CreditCard,
  Sparkles,
  ArrowRight,
  Store,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { PageHeader } from "../../../components/layout/PageHeader";
import { customerService } from "../services/customer.service";
import type { Customer } from "../types/customer";
import { toast } from "react-hot-toast";
import { GenerateOTPModal } from "./GenerateOTPModal";
import { ActivateSubscriptionModal } from './ActivateSubscriptionModal';

export const CustomerSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnedCustomer = (location.state as { customerData?: Customer } | null)?.customerData;
  const [phoneNumber, setPhoneNumber] = useState(returnedCustomer?.phone_number || "");
  const [customer, setCustomer] = useState<Customer | null>(returnedCustomer || null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  // Handle URL parameters on component mount
  useEffect(() => {
    const phoneFromUrl = searchParams.get("phone");
    if (phoneFromUrl && !returnedCustomer) {
      setPhoneNumber(phoneFromUrl);
      // Automatically trigger search
      performSearch(phoneFromUrl);
    }
  }, [searchParams, returnedCustomer]);

  const performSearch = async (phone: string) => {
    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    setIsSearching(true);
    setError(null);
    setCustomer(null);

    try {
      const result = await customerService.searchByPhone(phone);

      if (result) {
        setCustomer(result);
        setError(null);
        toast.success("Customer found successfully");
      } else {
        setError("No customer found with this phone number");
        toast.error("Customer not found");
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(phoneNumber);
  };

  const handleStoreClick = (storeId: string) => {
    const store = customer?.stores.find((s) => s.store_id === storeId);
    navigate(`/customer-support/store/${storeId}`, {
      state: {
        userId: customer?.user_id,
        storeData: store,
        customerData: customer,
      },
    });
  };

  const getSubscriptionBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800 ring-1 ring-inset ring-success-200";
      case "EXPIRED":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-danger-100 text-danger-800 ring-1 ring-inset ring-danger-200";
      case "PENDING":
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-800 ring-1 ring-inset ring-warning-200";
      default:
        return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

      <div className="min-h-screen space-y-6 bg-gradient-to-b from-primary-50/40 via-white to-white px-2 py-8">
        {/* Search Card */}
        {!customer ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-8 shadow-large sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20">
                <Sparkles className="h-3.5 w-3.5" />
                Customer lookup
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Find a customer by phone number
              </h2>
              <p className="mt-2 max-w-xl text-sm text-primary-100">
                Search to view their profile, subscription status and every store they manage.
              </p>

              <form onSubmit={handleSearch} className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500" />
                    <input
                      type="text"
                      className="w-full rounded-xl border-0 py-3.5 pl-12 pr-4 text-gray-900 shadow-medium ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Enter phone number (e.g., +255702030405)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isSearching}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSearching}
                    className="flex items-center justify-center space-x-2 !bg-white !text-primary-700 shadow-medium hover:!bg-primary-50 sm:px-8"
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
              </form>

              {error && (
                <div className="mt-5 flex items-center rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm animate-fade-in">
                  <XCircle className="mr-2 h-5 w-5 shrink-0 text-white" />
                  <span className="text-sm font-medium text-white">{error}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Card className="p-4">
            <form onSubmit={handleSearch}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
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
                <div className="flex items-end space-x-2">
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
              <div className="mt-4 flex items-center rounded-lg border border-danger-200 bg-danger-50 p-4">
                <XCircle className="w-5 h-5 text-danger-500 mr-2" />
                <span className="text-danger-800">{error}</span>
              </div>
            )}
          </Card>
        )}

        {!customer && !isSearching && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-100 bg-white/60 px-6 py-16 text-center animate-fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <User className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No customer selected yet</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Enter a phone number above to pull up a customer&apos;s profile, subscription and stores.
            </p>
          </div>
        )}

        {customer && (
          <>
            {/* Customer Details Card */}
            <Card className="overflow-hidden p-0 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Left Section - Customer Info */}
                <div className="lg:col-span-2 p-6">
                  <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row">
                    <div className="flex items-start">
                      <div className="relative mr-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-xl font-bold text-white shadow-medium">
                        {customer.business_name.charAt(0).toUpperCase()}
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ring-2 ring-white">
                          <Store className="h-3 w-3 text-primary-600" />
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {customer.business_name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <User className="w-3 h-3 mr-1" />
                            ID: {customer.user_id}
                          </span>
                          {customer.phone_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Phone Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Phone Not Verified
                            </span>
                          )}
                          {customer.web_activated ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Web Activated
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Web Not Activated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setShowOTPModal(true)}
                          className="flex items-center space-x-2"
                          variant="secondary"
                        >
                          <Key className="w-4 h-4" />
                          <span>Generate OTP</span>
                        </Button>
                        <Button
                          onClick={() => setShowActivateModal(true)}
                          className="flex items-center space-x-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Activate Subscription</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-colors hover:bg-primary-50">
                      <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors group-hover:bg-primary-100">
                        <Phone className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-semibold text-gray-900">
                          {customer.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-colors hover:bg-primary-50">
                      <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors group-hover:bg-primary-100">
                        <Mail className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-colors hover:bg-primary-50">
                      <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors group-hover:bg-primary-100">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Registration Date
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(customer.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="group flex items-center p-4 bg-gray-50 rounded-xl transition-colors hover:bg-primary-50">
                      <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors group-hover:bg-primary-100">
                        <ShoppingBag className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Stores</p>
                        <p className="font-semibold text-gray-900">
                          {customer.stores.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Subscription Info */}
                <div className="relative border-t border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 lg:border-l lg:border-t-0">
                  <div className="flex items-center mb-4">
                    <div className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Subscription
                    </h4>
                  </div>

                  <div className="mb-4">
                    <span
                      className={getSubscriptionBadgeClass(
                        customer.subscription?.subscription_status,
                      )}
                    >
                      {customer.subscription?.subscription_status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-lg font-bold text-primary-700 mb-1">
                      {customer.subscription?.plan_name}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {customer.subscription?.plan_type}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4 rounded-xl bg-white/70 p-4 ring-1 ring-inset ring-primary-100">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(customer.subscription?.effective_price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Duration:</span>
                      <span className="font-semibold text-gray-900">
                        {customer.subscription?.duration_days} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Max Stores:</span>
                      <span className="font-semibold text-gray-900">
                        {customer.subscription?.max_stores}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Max Products:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {customer.subscription?.max_products}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        Ends:{" "}
                        {formatDate(
                          customer.subscription?.subscription_end_date,
                        )}
                      </span>
                    </div>
                    {customer.subscription?.auto_renew && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Auto-Renew Enabled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stores Table */}
            <Card className="overflow-hidden p-0 animate-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customer Stores
                  </h3>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800">
                  {customer.stores.length}
                </span>
              </div>
              {customer.stores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <ShoppingBag className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">This customer has no stores yet.</p>
                </div>
              ) : (
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
                        <tr key={store.store_id} className="transition-colors hover:bg-primary-50/40">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-3">
                                #{store.store_number}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {store.store_name}
                                </div>
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
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
                              className="flex items-center gap-1.5"
                            >
                              View Details
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Generate OTP Modal */}
      <GenerateOTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        defaultPhoneNumber={customer?.phone_number || phoneNumber}
      />

      {/* Activate Subscription Modal */}
      {customer && (
        <ActivateSubscriptionModal
          isOpen={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          customerId={customer.user_id}
          customerName={customer.business_name}
          onSuccess={() => {
            // Optionally refresh customer data here if needed
          }}
        />
      )}
    </>
  );
};
