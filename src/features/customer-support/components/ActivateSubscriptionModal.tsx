import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { subscriptionApiService } from '../../../services/api/subscription-api-service';
import type { 
  SubscriptionPlan, 
  SubscriptionDuration} from '../../../types/subscription';
import { 
  CheckCircle,
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ActivateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  onSuccess?: () => void;
}

export const ActivateSubscriptionModal: React.FC<ActivateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onSuccess
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [duration, setDuration] = useState<SubscriptionDuration>('MONTHLY');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [activatedSubscription, setActivatedSubscription] = useState<any>(null);

  // Import duration constants
  const DURATION_DAYS_MAP: Record<SubscriptionDuration, number> = {
    MONTHLY: 30,
    QUARTERLY: 90,
    SEMI_ANNUALLY: 180,
    ANNUALLY: 365
  };

  const DURATION_LABELS_MAP: Record<SubscriptionDuration, string> = {
    MONTHLY: 'Monthly (30 days)',
    QUARTERLY: 'Quarterly (90 days)',
    SEMI_ANNUALLY: 'Semi-Annually (180 days)',
    ANNUALLY: 'Annually (365 days)'
  };

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const fetchedPlans = await subscriptionApiService.getSubscriptionPlans();
      // Sort plans by price ascending
      const sortedPlans = fetchedPlans.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
      if (sortedPlans.length > 0) {
        setSelectedPlanId(sortedPlans[0].id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subscription plans');
      console.error('Error loading plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlanId) {
      toast.error('Please select a subscription plan');
      return;
    }

    setLoading(true);
    try {
      const response = await subscriptionApiService.activateSubscription({
        customerId,
        planId: selectedPlanId,
        durationDays: DURATION_DAYS_MAP[duration],
        notes: notes || undefined
      });

      setActivatedSubscription(response.response_body);
      toast.success(response.message || 'Subscription activated successfully!');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate subscription');
      console.error('Error activating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all form state
    setSelectedPlanId('');
    setDuration('MONTHLY');
    setNotes('');
    setActivatedSubscription(null);
    setLoading(false);
    
    // Close the modal
    onClose();
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Activate Subscription"
      size="xl"
    >
      {!activatedSubscription ? (
        <form onSubmit={handleActivate} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Activating for: {customerName}</p>
                <p className="text-xs text-blue-700 mt-1">
                  This will cancel any existing active or pending subscriptions
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Plan *
            </label>
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading plans...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No subscription plans available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                      selectedPlanId === plan.id
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPlanId === plan.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPlanId === plan.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Plan Content */}
                    <div className="pr-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{plan.planName}</h4>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{plan.description || 'Subscription plan'}</p>
                      
                      {/* Price */}
                      <div className="mb-3">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-primary-600">{formatCurrency(plan.price)}</span>
                          <span className="text-sm text-gray-500 ml-2">/ {plan.durationDays} days</span>
                        </div>
                      </div>

                      {/* Plan Features */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-start text-xs text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <p className="text-xs text-gray-500 italic">+{plan.features.length - 3} more features</p>
                          )}
                        </div>
                      )}

                      {/* Plan Type Badge */}
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          plan.planType === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                          plan.planType === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                          plan.planType === 'STANDARD' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.planType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(DURATION_DAYS_MAP) as SubscriptionDuration[]).map((dur) => (
                <div
                  key={dur}
                  onClick={() => setDuration(dur)}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    duration === dur
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      duration === dur
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {duration === dur && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{DURATION_LABELS_MAP[dur]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Activated by support for customer complaint resolution"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add a reason for manual activation (recommended)
            </p>
          </div>

          {/* Summary */}
          {selectedPlan && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Activation Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">{selectedPlan.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{DURATION_DAYS_MAP[duration]} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Regular Price:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(selectedPlan.price)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Amount to Charge:</span>
                  <span className="font-bold text-green-600">{formatCurrency(0)} (Free)</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Important</p>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                  <li>All existing ACTIVE subscriptions will be cancelled</li>
                  <li>All existing PENDING subscriptions will be cancelled</li>
                  <li>New subscription will be activated immediately</li>
                  <li>Customer will NOT be charged (manual activation)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 flex items-center"
              disabled={loading || plansLoading || !selectedPlanId}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Activating...</span>
                </>
              ) : (
                'Activate Subscription'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Subscription Activated Successfully!
              </p>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Subscription Code</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {activatedSubscription.subscriptionCode}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activatedSubscription.subscriptionPlan.planName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {activatedSubscription.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Start Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(activatedSubscription.startDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">End Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(activatedSubscription.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Days Remaining</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activatedSubscription.daysRemaining} days
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(activatedSubscription.pricePaid)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Auto Renew</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activatedSubscription.autoRenew ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setActivatedSubscription(null);
                setSelectedPlanId('');
                setDuration('MONTHLY');
                setNotes('');
              }}
            >
              Activate Another
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
