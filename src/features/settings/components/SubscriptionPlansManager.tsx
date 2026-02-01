import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  Star, 
  DollarSign, 
  Power, 
  PowerOff,
  Users,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { SubscriptionPlanApiService } from '../../../services/api/subscription-plan-api-service';
import type { SubscriptionPlan, PlanType, BillingCycle, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from '../../../models/subscription.model';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';

export const SubscriptionPlansManager: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<SubscriptionPlan | null>(null);
  const [statusChangePlan, setStatusChangePlan] = useState<SubscriptionPlan | null>(null);
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [showInactivePlans, setShowInactivePlans] = useState(false);
  
  const [formData, setFormData] = useState<CreateSubscriptionPlanRequest>({
    planCode: '',
    planName: '',
    description: '',
    planType: 'BASIC',
    price: 0,
    currency: 'TZS',
    durationDays: 30,
    billingCycle: 'MONTHLY',
    features: [],
    maxStores: 1,
    maxProducts: 100,
    maxUsers: 1,
    hasAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
    displayOrder: 1,
    isPopular: false,
    discountPercentage: 0,
    trialDays: 0
  });

  const [newFeature, setNewFeature] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const planTypeOptions: { value: PlanType; label: string; color: string }[] = [
    { value: 'TRIAL', label: 'Trial', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'BASIC', label: 'Basic', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'STANDARD', label: 'Standard', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'PREMIUM', label: 'Premium', color: 'bg-orange-50 text-orange-700 border-orange-200' }
  ];

  const billingCycleOptions: { value: BillingCycle; label: string }[] = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' }
  ];

  const subscriptionService = new SubscriptionPlanApiService();

  // Form validation functions
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'planCode':
        if (!value?.trim()) return 'Plan code is required';
        if (value.length < 3) return 'Plan code must be at least 3 characters';
        return '';
      case 'planName':
        if (!value?.trim()) return 'Plan name is required';
        if (value.length < 3) return 'Plan name must be at least 3 characters';
        return '';
      case 'description':
        if (!value?.trim()) return 'Description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        return '';
      case 'price':
        if (value < 0) return 'Price cannot be negative';
        return '';
      case 'durationDays':
        if (!value || value < 1) return 'Duration must be at least 1 day';
        return '';
      case 'maxStores':
        if (!value || value < 1) return 'Max stores must be at least 1';
        return '';
      case 'maxProducts':
        if (!value || value < 1) return 'Max products must be at least 1';
        return '';
      case 'maxUsers':
        if (!value || value < 1) return 'Max users must be at least 1';
        return '';
      case 'features':
        if (!Array.isArray(value) || value.length === 0) return 'At least one feature is required';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate all required fields
    errors.planCode = validateField('planCode', formData.planCode);
    errors.planName = validateField('planName', formData.planName);
    errors.description = validateField('description', formData.description);
    errors.price = validateField('price', formData.price);
    errors.durationDays = validateField('durationDays', formData.durationDays);
    errors.maxStores = validateField('maxStores', formData.maxStores);
    errors.maxProducts = validateField('maxProducts', formData.maxProducts);
    errors.maxUsers = validateField('maxUsers', formData.maxUsers);
    errors.features = validateField('features', formData.features);

    // Remove empty errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });
    
    // Clear error for this field if it becomes valid
    const error = validateField(name, value);
    if (!error && formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [showInactivePlans]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const options = showInactivePlans ? {} : { status: 'ACTIVE' as const };
      const data = await subscriptionService.getAllPlans(options);
      // Ensure data is always an array
      const plansArray = Array.isArray(data) ? data : [];
      setPlans(plansArray);
      console.log('Loaded plans:', plansArray);
    } catch (error) {
      toast.error('Failed to load subscription plans');
      console.error('Error loading plans:', error);
      setPlans([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the entire form
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setFormLoading(true);
    try {
      if (editingPlan) {
        const updateData: UpdateSubscriptionPlanRequest = {
          planName: formData.planName,
          description: formData.description,
          price: formData.price,
          durationDays: formData.durationDays,
          features: formData.features,
          maxStores: formData.maxStores,
          maxProducts: formData.maxProducts,
          maxUsers: formData.maxUsers,
          hasAnalytics: formData.hasAnalytics,
          hasApiAccess: formData.hasApiAccess,
          hasPrioritySupport: formData.hasPrioritySupport,
          discountPercentage: formData.discountPercentage
        };
        await subscriptionService.updatePlan(editingPlan.id, updateData);
        toast.success('Subscription plan updated successfully');
      } else {
        await subscriptionService.createPlan(formData);
        toast.success('Subscription plan created successfully');
      }
      
      resetForm();
      loadPlans();
    } catch (error) {
      toast.error(editingPlan ? 'Failed to update subscription plan' : 'Failed to create subscription plan');
      console.error('Error saving plan:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;

    setLoading(true);
    try {
      await subscriptionService.deletePlan(deletePlan.id);
      toast.success('Subscription plan archived successfully');
      setDeletePlan(null);
      loadPlans();
    } catch (error) {
      toast.error('Failed to archive subscription plan');
      console.error('Error deleting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusChangePlan) return;

    setStatusChangeLoading(true);
    try {
      await subscriptionService.updatePlanStatus(statusChangePlan.id, newStatus);
      toast.success(`Plan ${newStatus.toLowerCase()} successfully`);
      setStatusChangePlan(null);
      loadPlans();
    } catch (error) {
      toast.error('Failed to update plan status');
      console.error('Error updating plan status:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const openStatusChangeModal = (plan: SubscriptionPlan, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => {
    setStatusChangePlan(plan);
    setNewStatus(status);
  };

  const resetForm = () => {
    setFormData({
      planCode: '',
      planName: '',
      description: '',
      planType: 'BASIC',
      price: 0,
      currency: 'TZS',
      durationDays: 30,
      billingCycle: 'MONTHLY',
      features: [],
      maxStores: 1,
      maxProducts: 100,
      maxUsers: 1,
      hasAnalytics: false,
      hasApiAccess: false,
      hasPrioritySupport: false,
      displayOrder: 0,
      isPopular: false,
      discountPercentage: 0,
      trialDays: 0
    });
    setNewFeature('');
    setFormErrors({});
    setTouched({});
    setShowCreateModal(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      planCode: plan.planCode,
      planName: plan.planName,
      description: plan.description,
      planType: plan.planType,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      billingCycle: plan.billingCycle || 'MONTHLY',
      features: [...plan.features],
      maxStores: plan.maxStores,
      maxProducts: plan.maxProducts,
      maxUsers: plan.maxUsers,
      hasAnalytics: plan.hasAnalytics,
      hasApiAccess: plan.hasApiAccess,
      hasPrioritySupport: plan.hasPrioritySupport,
      displayOrder: plan.displayOrder,
      isPopular: plan.isPopular,
      discountPercentage: plan.discountPercentage || 0,
      trialDays: plan.trialDays || 0
    });
    setShowCreateModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      const newFeatures = [...formData.features, newFeature.trim()];
      handleFieldChange('features', newFeatures);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    const newFeatures = formData.features.filter(f => f !== feature);
    handleFieldChange('features', newFeatures);
  };

  const getPlanTypeColor = (planType: PlanType) => {
    return planTypeOptions.find(opt => opt.value === planType)?.color || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-gray-600">Manage subscription plans and pricing tiers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowInactivePlans(!showInactivePlans)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            {showInactivePlans ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>{showInactivePlans ? 'Hide Inactive' : 'Show All'}</span>
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </Button>
        </div>
      </div>


      {/* Plans Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Subscription Plans ({Array.isArray(plans) ? plans.length : 0})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading subscription plans...</p>
          </div>
        ) : !Array.isArray(plans) || plans.length === 0 ? (
          <div className="p-8 text-center">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subscription plans found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="secondary"
            >
              Create your first subscription plan
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Plan Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Limits
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Features
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {Array.isArray(plans) && plans.map((plan, index) => (
                    <tr 
                      key={plan.id} 
                      className={`
                        transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                        ${index !== (Array.isArray(plans) ? plans.length : 0) - 1 ? 'border-b border-slate-100' : ''}
                        group cursor-pointer
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-purple-100 group-hover:to-purple-200 transition-all duration-200">
                            <Crown className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                                {plan.planName}
                              </p>
                              {plan.isPopular && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {plan.planCode} • Order: {plan.displayOrder}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getPlanTypeColor(plan.planType)}`}>
                          {plan.planType}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900">
                            {plan.currency} {plan.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {plan.durationDays} days
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <Package className="w-3 h-3" />
                            <span>{plan.maxProducts} products</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{plan.maxUsers} users</span>
                          </div>
                          <div className="text-slate-500">
                            {plan.maxStores} store{plan.maxStores > 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-600 space-y-1">
                          {plan.hasAnalytics && <div>✓ Analytics</div>}
                          {plan.hasApiAccess && <div>✓ API Access</div>}
                          {plan.hasPrioritySupport && <div>✓ Priority Support</div>}
                          <div className="text-slate-500">
                            +{plan.features.length} more features
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-600">
                          {plan.status}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          {plan.status === 'ACTIVE' ? (
                            <Button
                              onClick={() => openStatusChangeModal(plan, 'INACTIVE')}
                              variant="ghost"
                              className="p-2.5 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 border border-transparent hover:border-orange-200/60"
                              title="Deactivate plan"
                            >
                              <PowerOff className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={() => openStatusChangeModal(plan, 'ACTIVE')}
                              variant="ghost"
                              className="p-2.5 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200/60"
                              title="Activate plan"
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleEdit(plan)}
                            variant="ghost"
                            className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200/60"
                            title="Edit plan"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeletePlan(plan)}
                            variant="ghost"
                            className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200/60"
                            title="Delete plan"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={resetForm}
        title={editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.planCode}
                onChange={(e) => handleFieldChange('planCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.planCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., BASIC-MONTHLY"
                required
                disabled={formLoading || !!editingPlan}
              />
              {formErrors.planCode && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.planCode}
                </p>
              )}
              {editingPlan && !formErrors.planCode && (
                <p className="text-xs text-gray-500 mt-1">
                  Plan code cannot be changed after creation
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => handleFieldChange('planName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.planName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Basic Plan"
                required
                disabled={formLoading}
              />
              {formErrors.planName && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.planName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type
              </label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value as PlanType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading || !!editingPlan}
              >
                {planTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {editingPlan && (
                <p className="text-xs text-gray-500 mt-1">
                  Plan type cannot be changed after creation
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ({formData.currency}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 pl-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                  disabled={formLoading}
                />
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {formErrors.price && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as BillingCycle })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading || !!editingPlan}
              >
                {billingCycleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationDays}
                onChange={(e) => handleFieldChange('durationDays', parseInt(e.target.value) || 30)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.durationDays ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={formLoading}
              />
              {formErrors.durationDays && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.durationDays}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Describe this subscription plan..."
              required
              disabled={formLoading}
            />
            {formErrors.description && (
              <p className="text-xs text-red-600 mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Stores <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxStores}
                onChange={(e) => handleFieldChange('maxStores', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.maxStores ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={formLoading}
              />
              {formErrors.maxStores && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.maxStores}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Products <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxProducts}
                onChange={(e) => handleFieldChange('maxProducts', parseInt(e.target.value) || 100)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.maxProducts ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={formLoading}
              />
              {formErrors.maxProducts && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.maxProducts}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Users <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUsers}
                onChange={(e) => handleFieldChange('maxUsers', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.maxUsers ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={formLoading}
              />
              {formErrors.maxUsers && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.maxUsers}
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={formLoading}
                />
                <Button type="button" onClick={addFeature} variant="secondary" disabled={formLoading}>
                  Add
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        disabled={formLoading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {formErrors.features && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.features}
                </p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasAnalytics}
                  onChange={(e) => setFormData({ ...formData, hasAnalytics: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={formLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Has Analytics</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasApiAccess}
                  onChange={(e) => setFormData({ ...formData, hasApiAccess: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={formLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Has API Access</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasPrioritySupport}
                  onChange={(e) => setFormData({ ...formData, hasPrioritySupport: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={formLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Has Priority Support</span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={formLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Popular Plan</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trial Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {editingPlan ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingPlan ? 'Update Plan' : 'Create Plan'
              )}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary" disabled={formLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletePlan}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleDelete}
        title="Delete Subscription Plan"
        message="Are you sure you want to delete this subscription plan? This action cannot be undone."
        itemName={deletePlan?.planName}
        isLoading={loading}
      />

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={!!statusChangePlan}
        onClose={() => setStatusChangePlan(null)}
        title={`${newStatus === 'ACTIVE' ? 'Activate' : newStatus === 'INACTIVE' ? 'Deactivate' : 'Archive'} Plan`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {newStatus === 'ACTIVE' ? 'activate' : newStatus === 'INACTIVE' ? 'deactivate' : 'archive'} the <strong>{statusChangePlan?.planName}</strong> plan?
          </p>
          {newStatus === 'INACTIVE' && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              ⚠️ Deactivating this plan will hide it from new subscribers, but existing subscribers will keep their access.
            </p>
          )}
          {newStatus === 'ARCHIVED' && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              🗄️ Archiving this plan will permanently retire it. This action cannot be undone.
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setStatusChangePlan(null)}
              disabled={statusChangeLoading}
            >
              Cancel
            </Button>
            <Button
              variant={newStatus === 'ACTIVE' ? 'primary' : 'danger'}
              onClick={handleStatusChange}
              disabled={statusChangeLoading}
              className={`flex items-center space-x-2 ${
                newStatus === 'INACTIVE' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''
              }`}
            >
              {statusChangeLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : newStatus === 'ACTIVE' ? (
                <Power className="w-4 h-4" />
              ) : (
                <PowerOff className="w-4 h-4" />
              )}
              <span>
                {statusChangeLoading 
                  ? `${newStatus === 'ACTIVE' ? 'Activating' : newStatus === 'INACTIVE' ? 'Deactivating' : 'Archiving'}...`
                  : `${newStatus === 'ACTIVE' ? 'Activate' : newStatus === 'INACTIVE' ? 'Deactivate' : 'Archive'} Plan`
                }
              </span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
