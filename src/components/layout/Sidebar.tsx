/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore, NavigationTab } from '../../stores/useAppStore';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Kanban,
  Package,
  CheckSquare,
  Activity,
  TrendingUp,
  ShieldCheck,
  Building2,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentOrganization, currentUser, setIsContextModalOpen } = useAppStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'opportunities', label: 'Oportunidades', icon: Briefcase },
    { id: 'pipeline', label: 'Pipeline Kanban', icon: Kanban },
    { id: 'products', label: 'Catálogo Productos', icon: Package },
    { id: 'tasks', label: 'Tareas y Seguimiento', icon: CheckSquare },
    { id: 'activities', label: 'Actividad Comercial', icon: Activity },
    { id: 'reports', label: 'Reportes y Métricas', icon: TrendingUp },
    { id: 'audit', label: 'Auditoría Forense', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          N
        </div>
        <div>
          <div className="text-white font-bold tracking-tight text-base flex items-center gap-1.5">
            Nexus CRM
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
              SaaS
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
            {currentOrganization?.slug || 'multi-tenant'}
          </div>
        </div>
      </div>

      {/* Organization Badge Clickable */}
      <div className="p-3">
        <button
          onClick={() => setIsContextModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors group"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Organización
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {currentOrganization?.name || 'Seleccionar...'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Current Operator */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40">
          <div className="w-7 h-7 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {currentUser?.full_name?.slice(0, 1) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">
              {currentUser?.full_name}
            </div>
            <div className="text-[10px] text-slate-400 capitalize">
              Rol: <span className="text-indigo-400 font-semibold">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
