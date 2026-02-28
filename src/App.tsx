import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminLayout } from './components/layout/AdminLayout'
import { Dashboard } from './features/dashboard/components/Dashboard'
import LoginPage from './features/auth/components/LoginPage'
import { SettingsPage } from './features/settings/components/SettingsPage'
import { CustomerSupportPage, StoreDetailsPageEnhanced } from './features/customer-support';
import { AdminManagementPage } from './features/admin/components/AdminManagementPage';
import { OwnersManager } from './features/users'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <OwnersManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <SettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-support"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CustomerSupportPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/customer-support/store/:storeId" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              <StoreDetailsPageEnhanced />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/admin-management"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#27906D',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
