import React, { useState, useEffect } from 'react';
import { Edit2, Ban, RotateCcw } from 'lucide-react';
import type { Usuario } from '../types';
import { usuariosService } from '../services/usuariosService';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/ui/ToastNotification';
import { Modal } from '../components/ui/Modal';

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const { user: currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUsuario, setEditUsuario] = useState<Usuario | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('123456');

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuariosService.getAll(showInactive);
      setUsuarios(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar lista de operadores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [showInactive]);

  const handleOpenCreate = () => {
    setEditUsuario(null);
    setNome('');
    setEmail('');
    setSenha('123456');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: Usuario) => {
    setEditUsuario(u);
    setNome(u.nome);
    setEmail(u.email);
    setSenha('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUsuario) {
        const updateData: Partial<Usuario> & { senha?: string } = { nome, email };
        if (senha.trim().length > 0) {
          updateData.senha = senha.trim();
        }
        await usuariosService.update(editUsuario.id, updateData);
        showToast('Dados do operador atualizados com sucesso.', 'success');
      } else {
        await usuariosService.create({ nome, email, senha });
        showToast('Novo operador cadastrado com sucesso.', 'success');
      }
      setIsModalOpen(false);
      loadUsuarios();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar operador.', 'error');
    }
  };

  const handleInactivate = async (u: Usuario) => {
    if (currentUser && currentUser.id === u.id) {
      showToast('Ação bloqueada: Você não pode inativar seu próprio usuário em sessão ativa.', 'warning');
      return;
    }

    if (!window.confirm(`Deseja inativar o acesso de "${u.nome}"? O operador não conseguirá mais realizar login no PDV.`)) return;

    try {
      await usuariosService.inactivate(u.id);
      showToast(`Acesso do operador "${u.nome}" inativado com sucesso.`, 'success');
      loadUsuarios();
    } catch (err: any) {
      showToast(err.message || 'Erro ao inativar operador.', 'error');
    }
  };

  const handleReactivate = async (u: Usuario) => {
    try {
      await usuariosService.reactivate(u.id);
      showToast(`Acesso do operador "${u.nome}" reativado no terminal.`, 'success');
      loadUsuarios();
    } catch (err: any) {
      showToast(err.message || 'Erro ao reativar operador.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Operadores &amp; Controle de Acesso
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestão de credenciais de login, permissões e operadores da frente de caixa
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              data-testid="toggle-inativos-usuarios"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-0"
            />
            <span>Exibir Inativos</span>
          </label>

          <button
            onClick={handleOpenCreate}
            data-testid="btn-novo-usuario"
            className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
          >
            Novo Operador
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando operadores cadastrados...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">Nenhum operador encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Nome do Operador</th>
                  <th className="py-3 px-4 font-semibold">E-mail Institucional</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usuarios.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      data-testid={`row-usuario-${u.id}`}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!u.ativo ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-800 dark:text-amber-400">
                        #{String(u.id).padStart(3, '0')}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <span>{u.nome}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-1.5 py-0.2 rounded font-semibold">
                              Você
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] uppercase font-semibold font-mono px-2 py-0.5 rounded ${
                            u.ativo
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {u.ativo ? 'Autorizado' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Cadastro"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>

                        {u.ativo ? (
                          <button
                            onClick={() => handleInactivate(u)}
                            data-testid={`btn-inativar-usuario-${u.id}`}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Não é permitido inativar a si mesmo'
                                : 'Inativar acesso do operador'
                            }
                            className={`p-1.5 rounded transition-colors ${
                              isCurrent
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-30'
                                : 'text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                            }`}
                          >
                            <Ban className="w-4 h-4 inline" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(u)}
                            data-testid={`btn-reativar-usuario-${u.id}`}
                            title="Reativar acesso do operador"
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editUsuario ? `Editar Operador #${editUsuario.id}` : 'Cadastrar Novo Operador'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo do Operador *</label>
            <input
              type="text"
              required
              data-testid="input-usuario-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Gabriel Albuquerque"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail de Login *</label>
            <input
              type="email"
              required
              data-testid="input-usuario-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@lpjoias.com.br"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {editUsuario ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha Provisória de Acesso *'}
            </label>
            <input
              type="password"
              required={!editUsuario}
              minLength={6}
              data-testid="input-usuario-senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={editUsuario ? 'Opcional (mínimo 6 caracteres)' : 'Mínimo 6 caracteres'}
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
              data-testid="btn-salvar-usuario"
              className="font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-2xs"
            >
              {editUsuario ? 'Salvar Alterações' : 'Cadastrar Operador'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
