import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Package
} from 'lucide-react';
import { unitOfMeasureApi, type UnitOfMeasure } from '../services/product-service';
import toast from 'react-hot-toast';

export const UnitOfMeasureManager: React.FC = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  // Load units on component mount
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const units = await unitOfMeasureApi.getAll();
      setUnits(units);
    } catch (error) {
      toast.error('Failed to load units of measure');
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUnits();
      return;
    }

    setLoading(true);
    try {
      const units = await unitOfMeasureApi.search(searchQuery);
      setUnits(units);
    } catch (error) {
      toast.error('Failed to search units of measure');
      console.error('Error searching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Name and code are required');
      return;
    }

    setFormLoading(true);
    try {
      if (editingUnit) {
        const response = await unitOfMeasureApi.update(editingUnit.id, {
          ...formData,
          isActive: editingUnit.isActive
        });
        setUnits(units.map(unit => 
          unit.id === editingUnit.id ? response : unit
        ));
        toast.success('Unit of measure updated successfully');
      } else {
        await unitOfMeasureApi.create(formData);
        toast.success('Unit of measure created successfully');
      }
      resetForm();
      loadUnits(); // Refresh the list
    } catch (error) {
      toast.error(editingUnit ? 'Failed to update unit of measure' : 'Failed to create unit of measure');
      console.error('Error saving unit:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' });
    setShowCreateModal(false);
    setEditingUnit(null);
  };

  const handleEdit = (unit: UnitOfMeasure) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      code: unit.code,
      description: unit.description
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Units of Measure</h2>
          <p className="text-gray-600 mt-1">Manage product units of measure</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Unit</span>
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search units of measure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Search
          </Button>
          <Button onClick={loadUnits} variant="ghost">
            Clear
          </Button>
        </div>
      </Card>

      {/* Units List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Units of Measure ({units.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading units...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No units of measure found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="secondary"
            >
              Create your first unit
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Unit Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Description
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
                  {units.map((unit, index) => (
                    <tr 
                      key={unit.id} 
                      className={`
                        transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                        ${index !== units.length - 1 ? 'border-b border-slate-100' : ''}
                        group cursor-pointer
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                              {unit.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Unit of Measure
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 group-hover:bg-slate-200/50 transition-colors">
                          {unit.code}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-600 max-w-xs">
                          <p className="truncate">
                            {unit.description || (
                              <span className="text-slate-400 italic">No description</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          unit.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 group-hover:bg-emerald-100/50' 
                            : 'bg-red-50 text-red-700 border-red-200/60 group-hover:bg-red-100/50'
                        }`}>
                          {unit.isActive ? (
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
                          {unit.createdAt ? (
                            <div>
                              <p className="font-medium">
                                {new Date(unit.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(unit.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unknown</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => handleEdit(unit)}
                            variant="ghost"
                            className="p-2"
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
                            title="Delete unit"
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
        title={editingUnit ? 'Edit Unit of Measure' : 'Create New Unit of Measure'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Bottle"
                required
                disabled={formLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., BTL"
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Optional description"
              rows={3}
              disabled={formLoading}
            />
          </div>
          
          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {editingUnit ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingUnit ? 'Update Unit' : 'Create Unit'
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
