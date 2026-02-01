import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { 
  Plus,
  Edit,
  Trash2,
  Tag
} from 'lucide-react';
import { categoryApi } from '../services/product-service';
import type { Category } from '../services/product-service';
import toast from 'react-hot-toast';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    categoryDescription: '',
    parentCategoryId: null as string | null,
    displayOrder: 1,
    categoryIcon: '',
    categoryColor: '#3B82F6',
    isDefaultCategory: false,
    isActive: true
  });

  // Predefined colors for categories
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categories = await categoryApi.getAll();
      setCategories(categories);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim() || !formData.categoryCode.trim()) {
      toast.error('Category name and code are required');
      return;
    }

    setFormLoading(true);
    try {
      if (editingCategory) {
        const response = await categoryApi.update(editingCategory.id, formData);
        setCategories(categories.map(category => 
          category.id === editingCategory.id ? response : category
        ));
        toast.success('Category updated successfully');
      } else {
        await categoryApi.create(formData);
        toast.success('Category created successfully');
      }
      resetForm();
      loadCategories(); // Refresh the list
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
      console.error('Error saving category:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryCode: '',
      categoryName: '',
      categoryDescription: '',
      parentCategoryId: null,
      displayOrder: 1,
      categoryIcon: '',
      categoryColor: '#3B82F6',
      isDefaultCategory: false,
      isActive: true
    });
    setShowCreateModal(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      categoryCode: category.categoryCode,
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription,
      parentCategoryId: category.parentCategoryId,
      displayOrder: category.displayOrder,
      categoryIcon: category.categoryIcon || '',
      categoryColor: category.categoryColor || '#3B82F6',
      isDefaultCategory: category.isDefaultCategory,
      isActive: category.isActive
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>


      {/* Categories List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Categories ({categories.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No categories found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="secondary"
            >
              Create your first category
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Category Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {categories.map((category, index) => (
                    <tr 
                      key={category.id} 
                      className={`
                        transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                        ${index !== categories.length - 1 ? 'border-b border-slate-100' : ''}
                        group cursor-pointer
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-200/60 group-hover:shadow-md transition-all duration-200"
                            style={{ backgroundColor: category.categoryColor }}
                          >
                            <Tag className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                                {category.categoryName}
                              </p>
                              {category.isDefaultCategory && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 group-hover:bg-slate-200/50 transition-colors">
                          {category.categoryCode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-600 max-w-xs">
                          <p className="truncate">
                            {category.categoryDescription || (
                              <span className="text-slate-400 italic">No description</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200/60 group-hover:bg-slate-200/50 transition-colors">
                            {category.displayOrder}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          category.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 group-hover:bg-emerald-100/50' 
                            : 'bg-red-50 text-red-700 border-red-200/60 group-hover:bg-red-100/50'
                        }`}>
                          {category.isActive ? (
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
                        <div className="text-sm text-slate-500">
                          {(() => {
                            if (!category.createdAt) {
                              return <span className="text-slate-400 italic">No date</span>;
                            }
                            
                            try {
                              let date: Date;
                              
                              // Handle array format: [year, month, day, hour, minute, second, nanosecond]
                              if (Array.isArray(category.createdAt) && category.createdAt.length >= 6) {
                                const [year, month, day, hour, minute, second, nanosecond] = category.createdAt;
                                // Note: JavaScript months are 0-indexed, so subtract 1 from month
                                date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
                              } else {
                                // Handle standard date string format
                                date = new Date(category.createdAt as string);
                              }
                              
                              if (!isNaN(date.getTime())) {
                                return (
                                  <div>
                                    <p className="font-medium">
                                      {date.toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {date.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                );
                              }
                            } catch (error) {
                              console.error('Date parsing error:', error);
                            }
                            
                            return <span className="text-slate-400 italic">Invalid date</span>;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => handleEdit(category)}
                            variant="ghost"
                            className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200/60"
                            title="Edit category"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              // TODO: Implement delete functionality
                              toast.error('Delete functionality not implemented yet');
                            }}
                            variant="ghost"
                            className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200/60"
                            title="Delete category"
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
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Electronics"
                required
                disabled={formLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Code *
              </label>
              <input
                type="text"
                value={formData.categoryCode}
                onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., ELEC001"
                required
                disabled={formLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.categoryDescription}
              onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Optional description"
              rows={3}
              disabled={formLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.categoryColor}
                  onChange={(e) => setFormData({ ...formData, categoryColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  disabled={formLoading}
                />
                <div className="flex flex-wrap gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, categoryColor: color })}
                      className={`w-6 h-6 rounded-full border-2 ${
                        formData.categoryColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={formLoading}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefaultCategory}
                onChange={(e) => setFormData({ ...formData, isDefaultCategory: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={formLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Default Category</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={formLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {editingCategory ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingCategory ? 'Update Category' : 'Create Category'
              )}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary" disabled={formLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
