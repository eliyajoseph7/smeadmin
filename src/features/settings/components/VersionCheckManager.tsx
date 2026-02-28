import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { 
  Smartphone, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { AppVersionApiService } from '../../../services/api/app-version-api-service';
import type { AppVersion, AppVersionCheckResponse, CreateAppVersionRequest, UpdateAppVersionRequest, UpdatePriority, PlatformType } from '../../../models/app-version';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';

type PlatformTab = 'android' | 'ios';

export const VersionCheckManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlatformTab>('android');
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<AppVersionCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [deleteVersion, setDeleteVersion] = useState<AppVersion | null>(null);
  const [viewingVersion, setViewingVersion] = useState<AppVersion | null>(null);
  
  const [formData, setFormData] = useState<CreateAppVersionRequest>({
    latest_version: '',
    minimum_required_version: '',
    update_priority: 'recommended',
    platform_type: 'android',
    release_notes: '',
    release_date: new Date().toISOString(),
    download_url: {
      android: '',
      ios: ''
    },
    new_features: [],
    bug_fixes: []
  });

  const [newFeature, setNewFeature] = useState('');
  const [newBugFix, setNewBugFix] = useState('');

  const versionService = new AppVersionApiService();

  const updatePriorityOptions: { value: UpdatePriority; label: string; color: string }[] = [
    { value: 'optional', label: 'Optional', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    { value: 'recommended', label: 'Recommended', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' }
  ];

  const platformOptions: { value: PlatformType; label: string; icon: string }[] = [
    { value: 'android', label: 'Android', icon: '🤖' },
    { value: 'ios', label: 'iOS', icon: '🍎' }
  ];

  const getPlatformConfig = (platform: PlatformType | string) => {
    const normalizedPlatform = platform.toLowerCase();
    return platformOptions.find(option => option.value === normalizedPlatform) || platformOptions[0];
  };

  const getPlatformDisplayConfig = (platform: string) => {
    const normalizedPlatform = platform.toLowerCase();
    if (normalizedPlatform === 'all') {
      return { value: 'all', label: 'All Platforms', icon: '📱' };
    }
    return getPlatformConfig(normalizedPlatform);
  };

  useEffect(() => {
    loadVersionData();
  }, [activeTab]);

  const loadVersionData = async () => {
    try {
      setLoading(true);
      
      // Clear current version state first
      setCurrentVersion(null);
      setVersions([]);
      
      // Check for updates using current version for the active platform
      try {
        const updateCheck = await versionService.checkForUpdates(activeTab);
        setCurrentVersion(updateCheck);
      } catch (versionError: any) {
        // Handle case where no version exists for this platform
        console.log(`No version found for platform ${activeTab}:`, versionError);
        setCurrentVersion(null);
      }

      // Load version history and filter by platform
      const history = await versionService.getVersionHistory(0, 20);
      const platformVersions = history.filter(version => {
        const platformType = version.platform_type.toLowerCase();
        return platformType === activeTab || platformType === 'all';
      });
      setVersions(platformVersions);
    } catch (error) {
      console.error('Failed to load version data:', error);
      toast.error('Failed to load version information');
      // Clear state on error
      setCurrentVersion(null);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.latest_version.trim() || !formData.minimum_required_version.trim()) {
      toast.error('Latest version and minimum required version are required');
      return;
    }

    if (!formData.release_notes.trim()) {
      toast.error('Release notes are required');
      return;
    }

    // Validate platform-specific download URL
    if (formData.platform_type === 'android' && !formData.download_url.android.trim()) {
      toast.error('Android download URL is required for Android platform');
      return;
    }

    if (formData.platform_type === 'ios' && !formData.download_url.ios.trim()) {
      toast.error('iOS download URL is required for iOS platform');
      return;
    }

    setFormLoading(true);
    try {
      if (editingVersion) {
        console.log(editingVersion);
        
        await versionService.updateVersion(editingVersion.id, formData as UpdateAppVersionRequest);
        toast.success('Version updated successfully');
      } else {
        await versionService.createVersion(formData);
        toast.success('Version created successfully');
      }
      
      resetForm();
      loadVersionData();
    } catch (error) {
      toast.error(editingVersion ? 'Failed to update version' : 'Failed to create version');
      console.error('Error saving version:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteVersion) return;

    setLoading(true);
    try {
      await versionService.deleteVersion(deleteVersion.id);
      toast.success('Version deleted successfully');
      setDeleteVersion(null);
      loadVersionData();
    } catch (error) {
      toast.error('Failed to delete version');
      console.error('Error deleting version:', error);
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({
      latest_version: '',
      minimum_required_version: '',
      update_priority: 'recommended',
      platform_type: activeTab,
      release_notes: '',
      release_date: new Date().toISOString(),
      download_url: {
        android: '',
        ios: ''
      },
      new_features: [],
      bug_fixes: []
    });
    setNewFeature('');
    setNewBugFix('');
    setShowCreateModal(false);
    setEditingVersion(null);
  };

  const handleEdit = (version: AppVersion) => {
    setEditingVersion(version);
    setFormData({
      latest_version: version.latest_version,
      minimum_required_version: version.minimum_required_version,
      update_priority: version.update_priority,
      platform_type: version.platform_type.toLowerCase() as PlatformType,
      release_notes: version.release_notes,
      release_date: version.release_date,
      download_url: {
        android: version.download_url.android,
        ios: version.download_url.ios
      },
      new_features: [...version.new_features],
      bug_fixes: [...version.bug_fixes]
    });
    setShowCreateModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.new_features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        new_features: [...formData.new_features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      new_features: formData.new_features.filter(f => f !== feature)
    });
  };

  const addBugFix = () => {
    if (newBugFix.trim() && !formData.bug_fixes.includes(newBugFix.trim())) {
      setFormData({
        ...formData,
        bug_fixes: [...formData.bug_fixes, newBugFix.trim()]
      });
      setNewBugFix('');
    }
  };

  const removeBugFix = (bugFix: string) => {
    setFormData({
      ...formData,
      bug_fixes: formData.bug_fixes.filter(f => f !== bugFix)
    });
  };

  const getPriorityConfig = (priority: UpdatePriority) => {
    return updatePriorityOptions.find(opt => opt.value === priority) || updatePriorityOptions[1];
  };

  const isLatestVersion = (version: AppVersion) => {
    if (versions.length === 0) return false;
    
    // Filter versions by current platform (excluding ALL platform versions for this check)
    const platformSpecificVersions = versions.filter(v => {
      const versionPlatform = v.platform_type.toLowerCase();
      return versionPlatform === activeTab;
    });
    
    // If no platform-specific versions, check if this is the latest among ALL platform versions
    if (platformSpecificVersions.length === 0) {
      const allPlatformVersions = versions.filter(v => v.platform_type.toLowerCase() === 'all');
      if (allPlatformVersions.length === 0) return false;
      
      const sortedAllVersions = [...allPlatformVersions].sort((a, b) => 
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      );
      return sortedAllVersions[0]?.id === version.id;
    }
    
    // Sort platform-specific versions by release date and compare with the first (latest) one
    const sortedVersions = [...platformSpecificVersions].sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
    return sortedVersions[0]?.id === version.id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Version Check Management</h2>
          <p className="text-gray-600">Manage app version checks and update notifications</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Version</span>
        </Button>
      </div>

      {/* Platform Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {platformOptions.map((platform) => (
            <button
              key={platform.value}
              onClick={() => setActiveTab(platform.value)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === platform.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{platform.icon}</span>
                <span>{platform.label} Versions</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Current Version Info */}
      {currentVersion && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center space-x-2">
              <span>{getPlatformConfig(activeTab).icon}</span>
              <span>Current {getPlatformConfig(activeTab).label} Version</span>
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityConfig(currentVersion.update_priority).color}`}>
              {getPriorityConfig(currentVersion.update_priority).label}
            </span>
          </div>
          
          {/* Version Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Latest Version</p>
              <p className="text-lg font-bold text-blue-900">{currentVersion.latest_version}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Minimum Required</p>
              <p className="text-lg font-bold text-blue-900">{currentVersion.minimum_required_version}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Release Date</p>
              <p className="text-sm text-blue-800 font-semibold">
                {new Date(currentVersion.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-blue-600">
                {new Date(currentVersion.release_date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium mb-2">Download Links</p>
              <div className="flex flex-col space-y-2">
                {(currentVersion.platform_type.toLowerCase() === 'android' || currentVersion.platform_type.toLowerCase() === 'all') && (
                  <a
                    href={currentVersion.download_url.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Android
                  </a>
                )}
                {(currentVersion.platform_type.toLowerCase() === 'ios' || currentVersion.platform_type.toLowerCase() === 'all') && (
                  <a
                    href={currentVersion.download_url.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    iOS
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Release Notes */}
          {currentVersion.release_notes && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Release Notes</h4>
              <p className="text-sm text-blue-800 bg-blue-100/50 rounded-lg p-3 border border-blue-200/50">
                {currentVersion.release_notes}
              </p>
            </div>
          )}

          {/* New Features and Bug Fixes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New Features */}
            {currentVersion.new_features && currentVersion.new_features.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  New Features ({currentVersion.new_features.length})
                </h4>
                <div className="space-y-2">
                  {currentVersion.new_features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 text-sm text-blue-800"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="bg-green-50 px-2 py-1 rounded text-green-800 border border-green-200/50">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bug Fixes */}
            {currentVersion.bug_fixes && currentVersion.bug_fixes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                  Bug Fixes ({currentVersion.bug_fixes.length})
                </h4>
                <div className="space-y-2">
                  {currentVersion.bug_fixes.map((bugFix, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 text-sm text-blue-800"
                    >
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="bg-orange-50 px-2 py-1 rounded text-orange-800 border border-orange-200/50">
                        {bugFix}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}


      {/* Versions Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>{getPlatformConfig(activeTab).icon}</span>
            <span>{getPlatformConfig(activeTab).label} Version History ({versions.length})</span>
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading version checks...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No version checks found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="secondary"
            >
              Create your first version check
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Version Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Downloads
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
                  {versions.map((version, index) => (
                    <tr 
                      key={`${version.latest_version}-${index}`} 
                      className={`
                        transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                        ${index !== versions.length - 1 ? 'border-b border-slate-100' : ''}
                        group cursor-pointer
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-200 transition-all duration-200">
                            <Smartphone className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                              v{version.latest_version}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Min: v{version.minimum_required_version}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getPriorityConfig(version.update_priority).color}`}>
                          {getPriorityConfig(version.update_priority).label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <a
                          href={activeTab === 'android' ? version.download_url.android : version.download_url.ios}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            activeTab === 'android' 
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <Download className="w-3 h-3" />
                          <span>{getPlatformConfig(activeTab).label}</span>
                        </a>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 bg-emerald-50 text-emerald-700 border-emerald-200/60 group-hover:bg-emerald-100/50">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => setViewingVersion(version)}
                            variant="ghost"
                            className="p-2.5 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200/60"
                            title="View version details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* {isLatestVersion(version) && ( */}
                            <>
                              <Button
                                onClick={() => handleEdit(version)}
                                variant="ghost"
                                className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200/60"
                                title="Edit version"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => setDeleteVersion(version)}
                                variant="ghost"
                                className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200/60"
                                title="Delete version"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          {/* )} */}
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
        title={editingVersion ? 'Edit Version Check' : 'Create New Version Check'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-blue-600">ℹ️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Required Fields</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Fields marked with <span className="text-red-500 font-semibold">*</span> are required. The download URL field will change based on your selected platform.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Version Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latest Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.latest_version}
                onChange={(e) => setFormData({ ...formData, latest_version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 1.0.2"
                required
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Required Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.minimum_required_version}
                onChange={(e) => setFormData({ ...formData, minimum_required_version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 1.0.1"
                required
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.platform_type}
                onChange={(e) => setFormData({ ...formData, platform_type: e.target.value as PlatformType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading}
              >
                {platformOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.update_priority}
                onChange={(e) => setFormData({ ...formData, update_priority: e.target.value as UpdatePriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={formLoading}
              >
                {updatePriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Download URL - Platform Specific */}
          <div className="grid grid-cols-1 gap-6">
            {formData.platform_type === 'android' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🤖 Android Download URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.download_url.android}
                  onChange={(e) => setFormData({ ...formData, download_url: { ...formData.download_url, android: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://play.google.com/store/apps/..."
                  required
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the Google Play Store URL for the Android app
                </p>
              </div>
            )}

            {formData.platform_type === 'ios' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🍎 iOS Download URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.download_url.ios}
                  onChange={(e) => setFormData({ ...formData, download_url: { ...formData.download_url, ios: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://apps.apple.com/app/..."
                  required
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the App Store URL for the iOS app
                </p>
              </div>
            )}
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Release Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.release_date.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, release_date: new Date(e.target.value).toISOString() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={formLoading}
            />
          </div>

          {/* Release Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Release Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.release_notes}
              onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder="Describe what's new in this version..."
              required
              disabled={formLoading}
            />
          </div>

          {/* New Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Features <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a new feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={formLoading}
                />
                <Button type="button" onClick={addFeature} variant="secondary" disabled={formLoading}>
                  Add
                </Button>
              </div>
              {formData.new_features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.new_features.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-2 text-green-500 hover:text-green-700"
                        disabled={formLoading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bug Fixes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bug Fixes <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newBugFix}
                  onChange={(e) => setNewBugFix(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a bug fix..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBugFix())}
                  disabled={formLoading}
                />
                <Button type="button" onClick={addBugFix} variant="secondary" disabled={formLoading}>
                  Add
                </Button>
              </div>
              {formData.bug_fixes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.bug_fixes.map((bugFix: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700 border border-red-200"
                    >
                      {bugFix}
                      <button
                        type="button"
                        onClick={() => removeBugFix(bugFix)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        disabled={formLoading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          
          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {editingVersion ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingVersion ? 'Update Version' : 'Create Version'
              )}
            </Button>
            <Button type="button" onClick={resetForm} variant="secondary" disabled={formLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Version Modal */}
      <Modal
        isOpen={!!viewingVersion}
        onClose={() => setViewingVersion(null)}
        title={`Version ${viewingVersion?.latest_version} Details`}
        size="2xl"
      >
        {viewingVersion && (
          <div className="space-y-6">
            {/* Version Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Latest Version</h4>
                <p className="text-lg font-bold text-gray-900">{viewingVersion.latest_version}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Minimum Required</h4>
                <p className="text-lg font-bold text-gray-900">{viewingVersion.minimum_required_version}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Platform Type</h4>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border bg-white text-gray-700 border-gray-200">
                  <span className="mr-1">{getPlatformDisplayConfig(viewingVersion.platform_type).icon}</span>
                  {getPlatformDisplayConfig(viewingVersion.platform_type).label}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Update Priority</h4>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getPriorityConfig(viewingVersion.update_priority).color}`}>
                  {getPriorityConfig(viewingVersion.update_priority).label}
                </span>
              </div>
            </div>

            {/* Release Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Release Date</h4>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(viewingVersion.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(viewingVersion.release_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Download Links</h4>
                <div className="flex flex-col space-y-2">
                  {(viewingVersion.platform_type.toLowerCase() === 'android' || viewingVersion.platform_type.toLowerCase() === 'all') && (
                    <a
                      href={viewingVersion.download_url.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Android
                    </a>
                  )}
                  {(viewingVersion.platform_type.toLowerCase() === 'ios' || viewingVersion.platform_type.toLowerCase() === 'all') && (
                    <a
                      href={viewingVersion.download_url.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      iOS
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Release Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Release Notes</h4>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewingVersion.release_notes}</p>
            </div>

            {/* Features and Bug Fixes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Features */}
              {viewingVersion.new_features && viewingVersion.new_features.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    New Features ({viewingVersion.new_features.length})
                  </h4>
                  <div className="space-y-2">
                    {viewingVersion.new_features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-sm text-green-800"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bug Fixes */}
              {viewingVersion.bug_fixes && viewingVersion.bug_fixes.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                    Bug Fixes ({viewingVersion.bug_fixes.length})
                  </h4>
                  <div className="space-y-2">
                    {viewingVersion.bug_fixes.map((bugFix, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-sm text-orange-800"
                      >
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{bugFix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {isLatestVersion(viewingVersion) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                    Latest Version
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {isLatestVersion(viewingVersion) && (
                  <>
                    <Button
                      onClick={() => {
                        setViewingVersion(null);
                        handleEdit(viewingVersion);
                      }}
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setViewingVersion(null);
                        setDeleteVersion(viewingVersion);
                      }}
                      variant="secondary"
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => setViewingVersion(null)}
                  variant="secondary"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteVersion}
        onClose={() => setDeleteVersion(null)}
        onConfirm={handleDelete}
        title="Delete Version Check"
        message="Are you sure you want to delete this version check? This action cannot be undone."
        itemName={deleteVersion ? `v${deleteVersion.latest_version}` : ''}
        isLoading={loading}
      />
    </div>
  );
};
