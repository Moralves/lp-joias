import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-200 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-3 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <p>
          <strong className="text-slate-700 dark:text-slate-200 font-serif">L&amp;P JOIAS</strong> &bull; Sistema de Gestão e Frente de Caixa (PDV) &bull; Terminal de Atendimento
        </p>
      </footer>
    </div>
  );
};
