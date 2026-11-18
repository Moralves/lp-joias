import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, LoginCredentials } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const handleStorage = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = async (creds: LoginCredentials) => {
    const res = await authService.login(creds);
    setUser(res.usuario);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
