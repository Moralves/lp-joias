import { api } from './api';
import { isNetworkError } from './clientHelper';
import type { Venda, VendaPayload } from '../types';

const OFFLINE_MSG = 'Servidor da API Spring Boot indisponível em http://localhost:8080. Verifique se o back-end está em execução.';

export const vendasService = {
  async getAll(): Promise<Venda[]> {
    try {
      const res = await api.get<Venda[]>('/vendas');
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Falha ao buscar histórico de vendas.');
    }
  },

  async getById(id: number): Promise<Venda> {
    try {
      const res = await api.get<Venda>(`/vendas/${id}`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao carregar detalhes da venda.');
    }
  },

  async create(payload: VendaPayload): Promise<Venda> {
    try {
      const res = await api.post<Venda>('/vendas', payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao registrar venda no sistema.');
    }
  },

  async update(id: number, payload: VendaPayload): Promise<Venda> {
    try {
      const res = await api.put<Venda>(`/vendas/${id}`, payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao atualizar a venda.');
    }
  },

  async cancel(id: number): Promise<Venda> {
    try {
      const res = await api.delete<Venda>(`/vendas/${id}`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) throw new Error(OFFLINE_MSG);
      throw new Error(err.response?.data?.message || 'Erro ao cancelar a venda.');
    }
  }
};
