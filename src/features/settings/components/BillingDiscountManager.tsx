import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Percent, Calendar, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { BillingDiscountApiService } from '../../../services/api/billing-discount-api-service';
import type { 
  BillingDiscount, 
  BillingCycle, 
  CreateBillingDiscountRequest, 
  UpdateBillingDiscountRequest 
} from '../../../models/billing-discount.model';

export const BillingDiscountManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<BillingDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<BillingDiscount | null>(null);
  const [deleteDiscount, setDeleteDiscount] = useState<BillingDiscount | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState<CreateBillingDiscountRequest>({
    billingCycle: 'QUARTERLY',
    discountPercentage: 0,
    durationMonths: 3,
    isActive: true,
    description: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const billingCycleOptions: { value: BillingCycle; label: string; months: number }[] = [
    { value: 'MONTHLY', label: 'Monthly', months: 1 },
    { value: 'QUARTERLY', label: 'Quarterly', months: 3 },
    { value: 'YEARLY', label: 'Yearly', months: 12 }
  ];

  const discountService = new BillingDiscountApiService();

  // Form validation functions
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'discountPercentage':
        if (value < 0) return 'Discount percentage cannot be negative';
        if (value > 100) return 'Discount percentage cannot exceed 100%';
        return '';
      case 'durationMonths':
        if (!value || value < 1) return 'Duration must be at least 1 month';
        return '';
      case 'description':
        if (!value?.trim()) return 'Description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate all required fields
    errors.discountPercentage = validateField('discountPercentage', formData.discountPercentage);
    errors.durationMonths = validateField('durationMonths', formData.durationMonths);
    errors.description = validateField('description', formData.description);

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
    loadDiscounts();
  }, [showInactive]);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const data = showInactive 
        ? await discountService.getAllDiscounts()
        : await discountService.getActiveDiscounts();
      setDiscounts(data);
    } catch (error) {
      toast.error('Failed to load billing discounts');
      console.error('Error loading discounts:', error);
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
      if (editingDiscount) {
        const updateData: UpdateBillingDiscountRequest = {
          billingCycle: formData.billingCycle,
          discountPercentage: formData.discountPercentage,
          durationMonths: formData.durationMonths,
          isActive: formData.isActive,
          description: formData.description
        };
        await discountService.updateDiscountById(editingDiscount.id, updateData);
        toast.success('Billing discount updated successfully');
      } else {
        await discountService.createOrUpdateDiscount(formData);
        toast.success('Billing discount created successfully');
      }
      
      resetForm();
      loadDiscounts();
    } catch (error) {
      toast.error('Failed to save billing discount');
      console.error('Error saving discount:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDiscount) return;

    try {
      await discountService.deleteDiscount(deleteDiscount.id);
      toast.success('Billing discount deleted successfully');
      setDeleteDiscount(null);
      loadDiscounts();
    } catch (error) {
      toast.error('Failed to delete billing discount');
      console.error('Error deleting discount:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      billingCycle: 'QUARTERLY',
      discountPercentage: 0,
      durationMonths: 3,
      isActive: true,
      description: ''
    });
    setFormErrors({});
    setTouched({});
    setShowCreateModal(false);
    setEditingDiscount(null);
  };

  const handleEdit = (discount: BillingDiscount) => {
    setEditingDiscount(discount);
    setFormData({
      billingCycle: discount.billingCycle,
      discountPercentage: discount.discountPercentage,
      durationMonths: discount.durationMonths,
      isActive: discount.isActive,
      description: discount.description
    });
    setFormErrors({});
    setTouched({});
    setShowCreateModal(true);
  };

  const getBillingCycleInfo = (cycle: BillingCycle) => {
    return billingCycleOptions.find(opt => opt.value === cycle) || billingCycleOptions[1];
  };

  const handleBillingCycleChange = (cycle: BillingCycle) => {
    const cycleInfo = getBillingCycleInfo(cycle);
    handleFieldChange('billingCycle', cycle);
    handleFieldChange('durationMonths', cycleInfo.months);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Discount Management</h2>
          <p className="text-gray-600 mt-1">Configure billing cycle discounts and promotions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowInactive(!showInactive)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showInactive ? 'Hide Inactive' : 'Show All'}</span>
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Discount</span>
          </Button>
        </div>
      </div>

      {/* Discounts Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Billing Discounts ({discounts?.length || 0})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading billing discounts...</p>
          </div>
        ) : !discounts || discounts.length === 0 ? (
          <div className="p-8 text-center">
            <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No billing discounts found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="secondary"
            >
              Create your first billing discount
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Billing Cycle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {discounts?.map((discount, index) => (
                  <tr 
                    key={discount.id} 
                    className={`
                      transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                      ${index !== (discounts?.length || 0) - 1 ? 'border-b border-slate-100' : ''}
                      group cursor-pointer
                    `}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getBillingCycleInfo(discount.billingCycle).label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {discount.durationMonths} month{discount.durationMonths !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-semibold text-green-600">
                          {discount.discountPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-900">
                        {discount.durationMonths} month{discount.durationMonths !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        discount.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {discount.description}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => handleEdit(discount)}
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleteDiscount(discount)}
                          variant="danger"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
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
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={resetForm}
        title={editingDiscount ? 'Edit Billing Discount' : 'Create New Billing Discount'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => handleBillingCycleChange(e.target.value as BillingCycle)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading}
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
                Discount Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) => handleFieldChange('discountPercentage', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.discountPercentage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                  disabled={formLoading}
                />
                <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {formErrors.discountPercentage && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.discountPercentage}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationMonths}
                onChange={(e) => handleFieldChange('durationMonths', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.durationMonths ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={formLoading}
              />
              {formErrors.durationMonths && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.durationMonths}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleFieldChange('isActive', e.target.value === 'active')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={formLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              placeholder="Describe this billing discount..."
              required
              disabled={formLoading}
            />
            {formErrors.description && (
              <p className="text-xs text-red-600 mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="flex items-center space-x-2"
            >
              {formLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{editingDiscount ? 'Update' : 'Create'} Discount</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteDiscount}
        onClose={() => setDeleteDiscount(null)}
        title="Delete Billing Discount"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the <strong>{deleteDiscount?.billingCycle}</strong> billing discount? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteDiscount(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Discount
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
