import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Percent
} from 'lucide-react';
import { BillingDiscountApiService } from '../../../services/api/billing-discount-api-service';
import type { 
  BillingDiscount, 
  BillingCycle, 
  CreateBillingDiscountRequest 
} from '../../../models/billing-discount.model';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';

export const DiscountOptionsManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<BillingDiscount[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<BillingDiscount | null>(null);
  const [deleteDiscount, setDeleteDiscount] = useState<BillingDiscount | null>(null);
  
  const [formData, setFormData] = useState<CreateBillingDiscountRequest>({
    billingCycle: 'QUARTERLY',
    discountPercentage: 0,
    durationMonths: 3,
    description: '',
    isActive: true
  });

  const billingCycleOptions: { value: BillingCycle; label: string; months: number }[] = [
    { value: 'MONTHLY', label: 'Monthly', months: 1 },
    { value: 'QUARTERLY', label: 'Quarterly', months: 3 },
    { value: 'YEARLY', label: 'Yearly', months: 12 }
  ];

  const discountService = new BillingDiscountApiService();

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
      toast.error('Failed to load discount options');
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      toast.error('Discount percentage must be between 0 and 100');
      return;
    }

    setFormLoading(true);
    try {
      if (editingDiscount) {
        await discountService.updateDiscountById(editingDiscount.id, formData);
        toast.success('Discount option updated successfully');
      } else {
        await discountService.createOrUpdateDiscount(formData);
        toast.success('Discount option created successfully');
      }
      
      resetForm();
      loadDiscounts();
    } catch (error) {
      toast.error(editingDiscount ? 'Failed to update discount option' : 'Failed to create discount option');
      console.error('Error saving discount:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDiscount) return;

    setLoading(true);
    try {
      await discountService.deleteDiscount(deleteDiscount.id);
      toast.success('Discount option deleted successfully');
      setDeleteDiscount(null);
      loadDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount option');
      console.error('Error deleting discount:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      billingCycle: 'QUARTERLY',
      discountPercentage: 0,
      durationMonths: 3,
      description: '',
      isActive: true
    });
    setShowCreateModal(false);
    setEditingDiscount(null);
  };

  const handleEdit = (discount: BillingDiscount) => {
    setEditingDiscount(discount);
    setFormData({
      billingCycle: discount.billingCycle,
      discountPercentage: discount.discountPercentage,
      durationMonths: discount.durationMonths,
      description: discount.description,
      isActive: discount.isActive
    });
    setShowCreateModal(true);
  };

  const handleBillingCycleChange = (cycle: BillingCycle) => {
    const option = billingCycleOptions.find(opt => opt.value === cycle);
    setFormData({
      ...formData,
      billingCycle: cycle,
      durationMonths: option?.months || 1
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discount Options</h2>
          <p className="text-gray-600">Manage billing discounts and pricing options</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowInactive(!showInactive)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
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
            Discount Options ({discounts.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading discount options...</p>
          </div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No discount options found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="secondary"
            >
              Create your first discount option
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
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
                      Description
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
                  {discounts.map((discount, index) => (
                    <tr 
                      key={discount.id} 
                      className={`
                        transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                        ${index !== discounts.length - 1 ? 'border-b border-slate-100' : ''}
                        group cursor-pointer
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-200">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                              {billingCycleOptions.find(opt => opt.value === discount.billingCycle)?.label || discount.billingCycle}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {discount.durationMonths} month{discount.durationMonths > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {discount.discountPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600">
                          {discount.durationMonths} month{discount.durationMonths > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-600 max-w-xs">
                          <p className="truncate">
                            {discount.description || (
                              <span className="text-slate-400 italic">No description</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          discount.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 group-hover:bg-emerald-100/50' 
                            : 'bg-red-50 text-red-700 border-red-200/60 group-hover:bg-red-100/50'
                        }`}>
                          {discount.isActive ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                              Active
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => handleEdit(discount)}
                            variant="ghost"
                            className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200/60"
                            title="Edit discount"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteDiscount(discount)}
                            variant="ghost"
                            className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200/60"
                            title="Delete discount"
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
        title={editingDiscount ? 'Edit Discount Option' : 'Create New Discount Option'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Cycle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle
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
                    {option.label} ({option.months} month{option.months > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                  disabled={formLoading}
                />
                <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Duration Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Describe this discount option..."
              required
              disabled={formLoading}
            />
          </div>

          
          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {editingDiscount ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingDiscount ? 'Update Discount' : 'Create Discount'
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
        isOpen={!!deleteDiscount}
        onClose={() => setDeleteDiscount(null)}
        onConfirm={handleDelete}
        title="Delete Discount Option"
        message="Are you sure you want to delete this discount option? This action cannot be undone."
        itemName={deleteDiscount?.description}
        isLoading={loading}
      />
    </div>
  );
};
