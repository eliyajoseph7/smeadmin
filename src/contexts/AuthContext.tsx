import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: (user: any) => void;
  logout: () => void;
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
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app start
    const savedUser = localStorage.getItem('smeadmin_user');
    const authToken = localStorage.getItem('smeadmin_auth');
    
    if (authToken === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser({ emailOrPhone: savedUser });
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Always persist authentication state
    localStorage.setItem('smeadmin_auth', 'true');
    localStorage.setItem('smeadmin_user', userData.emailOrPhone);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('smeadmin_remember');
    localStorage.removeItem('smeadmin_user');
    localStorage.removeItem('smeadmin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
