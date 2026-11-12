import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, LoginCredentials } from '../types';
import { authService } from '../services/authService';
import { isMockModeExplicit, setMockMode } from '../services/clientHelper';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isMock: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
  toggleMock: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => authService.getCurrentUser());
  const [isMock, setIsMock] = useState<boolean>(() => isMockModeExplicit());

  useEffect(() => {
    const handleStorage = () => {
      setUser(authService.getCurrentUser());
      setIsMock(isMockModeExplicit());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('aurea_connection_change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('aurea_connection_change', handleStorage);
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

  const toggleMock = () => {
    const next = !isMock;
    setMockMode(next);
    setIsMock(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isMock,
        login,
        logout,
        toggleMock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
