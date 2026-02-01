import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  User, 
  ChevronDown,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn("bg-white border-b border-neutral-200", className)}>
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {Icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
              {description && (
                <p className="text-neutral-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {/* Header Right - User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" className="p-2 h-10 w-10 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-neutral-900">Admin User</p>
                  <p className="text-xs text-neutral-600">{user?.emailOrPhone || 'admin@sme.com'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 z-50">
                  <div className="p-4 border-b border-neutral-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">Admin User</p>
                        <p className="text-sm text-neutral-600">{user?.emailOrPhone || 'admin@sme.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                      <Settings className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">Account Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-700">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Header Content */}
        {children}
      </div>
    </div>
  );
};
