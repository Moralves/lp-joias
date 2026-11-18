import React, { useState, useEffect } from 'react';
import { Edit2, Ban, RotateCcw } from 'lucide-react';
import type { Cliente } from '../types';
import { clientesService } from '../services/clientesService';
import { formatCPF, formatPhone } from '../utils/formatters';
import { showToast } from '../components/ui/ToastNotification';
import { Modal } from '../components/ui/Modal';

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await clientesService.getAll(showInactive);
      setClientes(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar lista de clientes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, [showInactive]);

  const handleOpenCreate = () => {
    setEditCliente(null);
    setNome('');
    setCpf('');
    setEmail('');
    setTelefone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setEditCliente(cliente);
    setNome(cliente.nome);
    setCpf(cliente.cpf);
    setEmail(cliente.email);
    setTelefone(cliente.telefone);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) {
      showToast('O CPF deve conter exatamente 11 dígitos numéricos.', 'warning');
      return;
    }

    try {
      if (editCliente) {
        await clientesService.update(editCliente.id, {
          nome,
          cpf: cleanedCpf,
          email,
          telefone,
        });
        showToast('Ficha do cliente atualizada com sucesso.', 'success');
      } else {
        await clientesService.create({
          nome,
          cpf: cleanedCpf,
          email,
          telefone,
        });
        showToast('Cliente cadastrado com sucesso.', 'success');
      }
      setIsModalOpen(false);
      loadClientes();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar cadastro do cliente.', 'error');
    }
  };

  const handleInactivate = async (cliente: Cliente) => {
    if (!window.confirm(`Deseja inativar o cadastro de "${cliente.nome}"? O histórico de compras anteriores será preservado.`)) return;

    try {
      await clientesService.inactivate(cliente.id);
      showToast(`Cliente "${cliente.nome}" inativado com sucesso.`, 'success');
      loadClientes();
    } catch (err: any) {
      showToast(err.message || 'Erro ao inativar cliente.', 'error');
    }
  };

  const handleReactivate = async (cliente: Cliente) => {
    try {
      await clientesService.reactivate(cliente.id);
      showToast(`Cliente "${cliente.nome}" reativado para novas compras.`, 'success');
      loadClientes();
    } catch (err: any) {
      showToast(err.message || 'Erro ao reativar cliente.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Cadastro &amp; Gestão de Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de compradores, dados de contato e controle de status de atendimento
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              data-testid="toggle-inativos-clientes"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-0"
            />
            <span>Exibir Inativos</span>
          </label>

          <button
            onClick={handleOpenCreate}
            data-testid="btn-novo-cliente"
            className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
          >
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando lista de clientes...</div>
        ) : clientes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">Nenhum cliente cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Nome Completo</th>
                  <th className="py-3 px-4 font-semibold">CPF</th>
                  <th className="py-3 px-4 font-semibold">E-mail</th>
                  <th className="py-3 px-4 font-semibold">Telefone</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    data-testid={`row-cliente-${cliente.id}`}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!cliente.ativo ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-800 dark:text-amber-400">
                      #{String(cliente.id).padStart(3, '0')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{cliente.nome}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatCPF(cliente.cpf)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {cliente.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatPhone(cliente.telefone)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] uppercase font-semibold font-mono px-2 py-0.5 rounded ${
                          cliente.ativo
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(cliente)}
                        title="Editar Cadastro"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>

                      {cliente.ativo ? (
                        <button
                          onClick={() => handleInactivate(cliente)}
                          data-testid={`btn-inativar-cliente-${cliente.id}`}
                          title="Inativar Cliente"
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                        >
                          <Ban className="w-4 h-4 inline" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(cliente)}
                          data-testid={`btn-reativar-cliente-${cliente.id}`}
                          title="Reativar Cliente"
                          className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editCliente ? `Editar Cliente #${editCliente.id}` : 'Cadastrar Novo Cliente'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              data-testid="input-cliente-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Beatriz Albuquerque"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">CPF (11 dígitos numéricos) *</label>
            <input
              type="text"
              required
              data-testid="input-cliente-cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail de Contato *</label>
            <input
              type="email"
              required
              data-testid="input-cliente-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp *</label>
            <input
              type="text"
              required
              data-testid="input-cliente-telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-salvar-cliente"
              className="font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-2xs"
            >
              {editCliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
