import { api } from './api';
import { isMockModeExplicit, isNetworkError } from './clientHelper';
import { localStore } from './store';
import type { Cliente } from '../types';

const OFFLINE_MSG = 'Servidor da API Spring Boot indisponível em http://localhost:8080. Verifique se o back-end está em execução.';

export const clientesService = {
  async getAll(includeInactive = false): Promise<Cliente[]> {
    if (isMockModeExplicit()) {
      return localStore.getClientes(includeInactive);
    }
    try {
      const url = includeInactive ? '/clientes?ativo=false' : '/clientes';
      const res = await api.get<Cliente[]>(url);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao carregar clientes.');
    }
  },

  async create(data: Omit<Cliente, 'id' | 'ativo'>): Promise<Cliente> {
    if (isMockModeExplicit()) {
      return localStore.createCliente(data);
    }
    try {
      const res = await api.post<Cliente>('/clientes', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao cadastrar cliente.');
    }
  },

  async update(id: number, data: Partial<Cliente>): Promise<Cliente> {
    if (isMockModeExplicit()) {
      return localStore.updateCliente(id, data);
    }
    try {
      const res = await api.put<Cliente>(`/clientes/${id}`, data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao atualizar cliente.');
    }
  },

  async inactivate(id: number): Promise<void> {
    if (isMockModeExplicit()) {
      return localStore.inativarCliente(id);
    }
    try {
      await api.delete(`/clientes/${id}`);
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao inativar cliente.');
    }
  },

  async reactivate(id: number): Promise<Cliente> {
    if (isMockModeExplicit()) {
      return localStore.reativarCliente(id);
    }
    try {
      const res = await api.put<Cliente>(`/clientes/${id}/reativar`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao reativar cliente.');
    }
  }
};
