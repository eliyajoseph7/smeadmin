import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApiService } from '../services/api/auth-api-service';
import type { Admin, LoginRequest } from '../types/auth';
import { toast } from 'react-hot-toast';
import { tokenManager } from '../services/auth/token-manager';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = tokenManager.getRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApiService.refreshToken({
        refreshToken: currentRefreshToken
      });

      // Update tokens
      tokenManager.updateTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        tokenType: response.data.tokenType,
        expiresIn: response.data.expiresIn
      });

      return true;
    } catch (err: any) {
      console.error('Token refresh failed:', err);
      // If refresh fails, clear tokens and set state
      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setAdmin(null);
      setError(null);
      return false;
    }
  };

  useEffect(() => {
    // Check if user is authenticated on app start
    const initializeAuth = async () => {
      try {
        const storedAdmin = tokenManager.getAdmin();
        const storedTokens = tokenManager.getTokens();
        
        if (storedTokens && storedAdmin) {
          // Check if tokens are expired
          if (tokenManager.isAccessTokenExpired()) {
            // Try to refresh token if we have a refresh token
            if (tokenManager.hasRefreshToken()) {
              const refreshSuccess = await refreshToken();
              if (refreshSuccess) {
                setIsAuthenticated(true);
                setAdmin(storedAdmin);
              } else {
                tokenManager.clearTokens();
                setIsAuthenticated(false);
                setAdmin(null);
              }
            } else {
              tokenManager.clearTokens();
              setIsAuthenticated(false);
              setAdmin(null);
            }
          } else {
            // Tokens are still valid
            setIsAuthenticated(true);
            setAdmin(storedAdmin);
          }
        } else {
          setIsAuthenticated(false);
          setAdmin(null);
        }
      } catch (error) {
        tokenManager.clearTokens();
        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApiService.login(credentials);
      
      // Validate response structure
      if (!response.data) {
        throw new Error('Invalid login response: missing data');
      }
      
      // Validate admin data before storing
      if (!response.data.admin) {
        throw new Error('Invalid login response: missing admin data');
      }
      
      // Store tokens and admin data
      tokenManager.setTokens(
        {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          tokenType: response.data.tokenType,
          expiresIn: response.data.expiresIn
        },
        response.data.admin
      );

      setIsAuthenticated(true);
      setAdmin(response.data.admin);
      
      toast.success('Login successful!');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call logout API
      await authApiService.logout();
      
      // Clear local storage and state
      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setAdmin(null);
      setError(null);
      
      toast.success('Logged out successfully');
    } catch (err: any) {
      // Even if API call fails, clear local state
      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setAdmin(null);
      setError(null);
      
      console.error('Logout error:', err);
      toast.success('Logged out successfully');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      admin, 
      isLoading, 
      error, 
      login, 
      logout, 
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
