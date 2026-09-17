/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Search, Building2, UserCheck, Bell, Shield, Briefcase, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentOrganization,
    currentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsContextModalOpen,
  } = useAppStore();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' };
      case 'manager':
        return { label: 'Gerente', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' };
      case 'salesperson':
        return { label: 'Vendedor', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' };
      case 'customer_service':
        return { label: 'Atención al Cliente', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
      default:
        return { label: 'Usuario', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <div className="flex items-center w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar clientes, oportunidades, contactos..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Multi-Tenant Session Context & User Actions */}
      <div className="flex items-center gap-3">
        {/* Context Switcher Button */}
        <button
          onClick={() => setIsContextModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all text-left group"
          title="Cambiar Empresa / Usuario activo"
        >
          <div className="w-8 h-8 rounded-md bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-semibold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="text-slate-500 flex items-center gap-1 font-medium">
              <span>Empresa Activa</span>
              <RefreshCw className="w-2.5 h-2.5 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
            </div>
            <div className="font-semibold text-slate-900 truncate max-w-[130px] sm:max-w-[170px]">
              {currentOrganization?.name || 'Cargando...'}
            </div>
          </div>
        </button>

        {/* User Card with Role */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
            {currentUser?.full_name?.slice(0, 2) || 'US'}
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-900">{currentUser?.full_name || 'Usuario'}</div>
            <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded border ${roleInfo.bg}`}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Quick Context Switch Icon button */}
        <button
          onClick={() => setIsContextModalOpen(true)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Abrir selector de contexto"
        >
          <UserCheck className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
