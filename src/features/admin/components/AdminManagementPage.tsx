import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/layout/PageHeader';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Users,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { adminManagementService } from '../services/admin-management.service';
import type { Admin, AdminRole, AdminStatus, CreateAdminRequest, UpdateAdminRequest } from '../types/admin';
import toast from 'react-hot-toast';

export const AdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<AdminStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAdminRequest>({
    email: '',
    password: '',
    fullName: '',
    role: 'SUPPORT_ADMIN',
    phoneNumber: ''
  });

  const [editFormData, setEditFormData] = useState<UpdateAdminRequest>({
    fullName: '',
    phoneNumber: '',
    role: ''
  });

  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, [roleFilter, statusFilter]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter) filters.status = statusFilter;
      
      const adminsData = await adminManagementService.getAllAdmins(filters);
      setAdmins(adminsData);
    } catch (error) {
      toast.error('Failed to load admins');
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim() || !formData.fullName.trim()) {
      toast.error('Email, password, and full name are required');
      return;
    }

    setFormLoading(true);
    try {
      await adminManagementService.createAdmin(formData);
      toast.success('Admin created successfully');
      resetCreateForm();
      loadAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin');
      console.error('Error creating admin:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin) return;

    setFormLoading(true);
    try {
      await adminManagementService.updateAdmin(selectedAdmin.id, editFormData);
      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update admin');
      console.error('Error updating admin:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (admin: Admin, newStatus: AdminStatus) => {
    try {
      await adminManagementService.updateAdminStatus(admin.id, { status: newStatus });
      toast.success(`Admin ${newStatus.toLowerCase()} successfully`);
      loadAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update admin status');
      console.error('Error updating admin status:', error);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.fullName}?`)) return;

    try {
      await adminManagementService.deleteAdmin(admin.id);
      toast.success('Admin deleted successfully');
      loadAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete admin');
      console.error('Error deleting admin:', error);
    }
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditFormData({
      fullName: admin.fullName,
      phoneNumber: admin.phoneNumber || '',
      role: admin.role
    });
    setShowEditModal(true);
  };

  const openViewModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const resetCreateForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'SUPPORT_ADMIN',
      phoneNumber: ''
    });
    setShowCreateModal(false);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: AdminStatus) => {
    const statusStyles = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      INACTIVE: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      SUPPORT_ADMIN: 'bg-blue-100 text-blue-800',
      FINANCE_ADMIN: 'bg-indigo-100 text-indigo-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyles[role as keyof typeof roleStyles] || 'bg-gray-100 text-gray-800'}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        description="Manage system administrators and their permissions"
        icon={Shield}
      />

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as AdminRole | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SUPPORT_ADMIN">Support Admin</option>
              <option value="FINANCE_ADMIN">Finance Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdminStatus | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Admin</span>
          </Button>
        </div>
      </Card>

      {/* Admins Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span>Loading admins...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No admins found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{admin.fullName}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                        {admin.phoneNumber && (
                          <div className="text-sm text-gray-500">{admin.phoneNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(admin.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(admin.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {admin.lastLoginAt 
                        ? new Date(admin.lastLoginAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {admin.permissionCount} permissions
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => openViewModal(admin)}
                          variant="ghost"
                          className="p-2"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openEditModal(admin)}
                          variant="ghost"
                          className="p-2"
                          title="Edit admin"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {admin.status === 'ACTIVE' ? (
                          <Button
                            onClick={() => handleStatusChange(admin, 'SUSPENDED')}
                            variant="ghost"
                            className="p-2 text-yellow-600 hover:text-yellow-700"
                            title="Suspend admin"
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleStatusChange(admin, 'ACTIVE')}
                            variant="ghost"
                            className="p-2 text-green-600 hover:text-green-700"
                            title="Activate admin"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteAdmin(admin)}
                          variant="ghost"
                          className="p-2 text-red-600 hover:text-red-700"
                          title="Delete admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Admin Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={resetCreateForm}
        title="Create New Admin"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="SUPPORT_ADMIN">Support Admin</option>
              <option value="FINANCE_ADMIN">Finance Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={resetCreateForm}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
            >
              {formLoading ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Admin"
      >
        <form onSubmit={handleEditAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editFormData.fullName}
              onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={editFormData.phoneNumber}
              onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SUPPORT_ADMIN">Support Admin</option>
              <option value="FINANCE_ADMIN">Finance Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
            >
              {formLoading ? 'Updating...' : 'Update Admin'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Admin Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Admin Details"
      >
        {selectedAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900">{selectedAdmin.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{selectedAdmin.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{selectedAdmin.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">{getRoleBadge(selectedAdmin.role)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedAdmin.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-sm text-gray-900">
                  {selectedAdmin.lastLoginAt 
                    ? new Date(selectedAdmin.lastLoginAt).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedAdmin.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Updated</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedAdmin.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                Permissions ({selectedAdmin.permissionCount})
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedAdmin.permissions.map((permission) => (
                  <div key={permission.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {permission.module}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
