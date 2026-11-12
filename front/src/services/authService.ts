// ==========================================
// Serviço de Autenticação (JWT)
// ==========================================
import { api, TOKEN_KEY, USER_KEY } from './api';
import { isMockModeExplicit, isNetworkError, setMockMode } from './clientHelper';
import { localStore } from './store';
import type { LoginCredentials, AuthResponse, Usuario } from '../types';

export const authService = {
  async login(creds: LoginCredentials): Promise<AuthResponse> {
    if (isMockModeExplicit()) {
      const res = localStore.login(creds);
      this.setSession(res.token, res.usuario);
      return res;
    }

    try {
      const response = await api.post<AuthResponse>('/auth/login', creds);
      this.setSession(response.data.token, response.data.usuario);
      return response.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        console.warn('[L&P Royale] Backend inacessível. Alternando para o modo de simulação local.');
        setMockMode(true);
        const res = localStore.login(creds);
        this.setSession(res.token, res.usuario);
        return res;
      }
      const message = err.response?.data?.message || err.message || 'Erro ao realizar login.';
      throw new Error(message);
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  setSession(token: string, usuario: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  getCurrentUser(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
