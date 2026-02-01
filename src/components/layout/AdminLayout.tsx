import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  LogOut,
  Store,
  MessageSquare
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Products', href: '/products', icon: ShoppingBag },
  { name: 'Orders', href: '/orders', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Customer Support', href: '/customer-support', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="print:hidden">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Main Content */}
      <main className={cn(
        'flex-1 overflow-hidden transition-all duration-300',
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      )}>
        <div className="h-full overflow-y-auto bg-white/50">
          <div className="max-w-9xl mx-auto px-0 pb-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onToggle 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Filter navigation items based on search query
  const filteredNavigation = navigation.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      'flex flex-col h-screen bg-white border-r border-neutral-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        {!collapsed ? (
          <div className="flex-1">
            {/* Store Header */}
            <div className="flex items-center space-x-3 px-2 py-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-neutral-900">
                  RINO Admin
                </div>
                <div className="text-xs text-neutral-500 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Business Management</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <Store className="w-4 h-4 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          onClick={onToggle}
          className="p-2 h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = isActiveRoute(item.href);
          const Icon = item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200',
                'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
                isActive 
                  ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                  : 'text-neutral-700 hover:text-neutral-900',
                collapsed && 'justify-center'
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-primary-600' : 'text-neutral-500'
                )} />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </div>
              
              {!collapsed && item.badge && (
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-neutral-200 p-4">
        {!collapsed ? (
          <Card className="p-3">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-neutral-600 truncate">
                  {user?.emailOrPhone || 'admin@sme.com'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-sm text-neutral-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="p-2 h-8 w-8 mx-auto text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Confirm Logout</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
