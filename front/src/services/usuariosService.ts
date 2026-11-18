import { api } from './api';
import { isNetworkError } from './clientHelper';
import { authService } from './authService';
import type { Usuario } from '../types';

const OFFLINE_MSG = 'Servidor da API Spring Boot indisponível em http://localhost:8080. Verifique se o back-end está em execução.';

export const usuariosService = {
  async getAll(includeInactive = false): Promise<Usuario[]> {
    try {
      const url = includeInactive ? '/usuarios?ativo=false' : '/usuarios';
      const res = await api.get<Usuario[]>(url);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao carregar usuários.');
    }
  },

  async create(data: Omit<Usuario, 'id' | 'ativo'> & { senha?: string }): Promise<Usuario> {
    try {
      const res = await api.post<Usuario>('/usuarios', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao cadastrar usuário.');
    }
  },

  async update(id: number, data: Partial<Usuario> & { senha?: string }): Promise<Usuario> {
    try {
      const res = await api.put<Usuario>(`/usuarios/${id}`, data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao atualizar dados do usuário.');
    }
  },

  async inactivate(id: number): Promise<void> {
    const current = authService.getCurrentUser();
    if (current && current.id === id) {
      throw new Error('Não é permitido inativar o próprio usuário logado (409 Conflict).');
    }

    try {
      await api.delete(`/usuarios/${id}`);
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      if (err.response?.status === 409) {
        throw new Error('Não é permitido inativar o próprio usuário autenticado (409 Conflict).');
      }
      throw new Error(err.response?.data?.message || 'Erro ao inativar usuário.');
    }
  },

  async reactivate(id: number): Promise<Usuario> {
    try {
      const res = await api.put<Usuario>(`/usuarios/${id}/reativar`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao reativar usuário.');
    }
  }
};
