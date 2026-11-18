import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Gem, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout, isMock, toggleMock } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Frente de Caixa (PDV)', to: '/', testId: 'nav-pdv' },
    { label: 'Histórico de Vendas', to: '/vendas', testId: 'nav-vendas' },
    { label: 'Catálogo & Estoque', to: '/joias', testId: 'nav-joias' },
    { label: 'Clientes', to: '/clientes', testId: 'nav-clientes' },
    { label: 'Operadores & Acesso', to: '/usuarios', testId: 'nav-usuarios' },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
            <Gem className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-wider text-slate-900 dark:text-white font-serif">
                L&amp;P JOIAS
              </span>
            </div>
            <p className="text-[10px] tracking-wide text-slate-500 dark:text-slate-400 uppercase -mt-0.5">
              Alta Joalheria &bull; Balcão
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${isActive
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">

          <button
            type="button"
            onClick={toggleMock}
            title={isMock ? 'Operando em Simulação Local — Clique para conectar à API Spring Boot' : 'Conectado à API Spring Boot (PostgreSQL) — Clique para alternar'}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
              isMock
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {isMock ? 'Modo Local' : 'API Spring Boot'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            data-testid="btn-toggle-theme"
            title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 transition-colors cursor-pointer shadow-2xs"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3 sm:pl-3 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200" data-testid="user-name">
                  {user.nome}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Operador Ativo</p>
              </div>

              <button
                onClick={handleLogout}
                data-testid="btn-logout"
                title="Encerrar Sessão do Caixa"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${isActive
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 sm:hidden flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Operador: <strong className="text-slate-800 dark:text-white">{user.nome}</strong></span>
              <button
                onClick={handleLogout}
                className="text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
