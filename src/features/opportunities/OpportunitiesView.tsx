/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { Opportunity } from '../../types/crm';
import {
  Briefcase,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Plus,
  ArrowRight,
  Kanban,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export const OpportunitiesView: React.FC = () => {
  const { currentOrganization, currentUser, setActiveTab, setNotification, globalSearchQuery } = useAppStore();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadOpportunities();
  }, [currentOrganization?.id, currentUser?.id, statusFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    let url = `/api/opportunities?status=${statusFilter}`;
    const query = searchQuery || globalSearchQuery;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
    const res = await apiRequest(url);
    if (res.success) {
      setOpportunities(res.data);
    }
    setLoading(false);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
      setNotification({ type: 'error', message: 'No dispones de permisos de exportación' });
      return;
    }
    window.location.href = `/api/export/opportunities?format=${format}&organization_id=${currentOrganization?.id}&user_id=${currentUser?.id}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currentOrganization?.currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Oportunidades de Venta</h1>
          <p className="text-xs text-slate-500">
            {opportunities.length} negociaciones en {currentOrganization?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Kanban className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ver Modo Kanban</span>
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar oportunidad por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadOpportunities()}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>
          <button
            onClick={loadOpportunities}
            className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
          >
            Buscar
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">Todas las Oportunidades</option>
          <option value="open">Abiertas / En curso</option>
          <option value="won">Ganadas</option>
          <option value="lost">Perdidas</option>
        </select>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Oportunidad</th>
                <th className="p-3.5">Cliente / Empresa</th>
                <th className="p-3.5">Etapa Actual</th>
                <th className="p-3.5">Valor Estimado</th>
                <th className="p-3.5">Probabilidad</th>
                <th className="p-3.5">Vendedor</th>
                <th className="p-3.5">Cierre Previsto</th>
                <th className="p-3.5 text-right pr-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Cargando oportunidades...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">Sin oportunidades encontradas</p>
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-slate-900">{opp.name}</td>
                    <td className="p-3.5 text-slate-700">
                      {opp.client?.company_name || opp.client?.full_name || '-'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-indigo-600">{opp.stage?.name}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{formatCurrency(opp.estimated_value)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {opp.probability}%
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{opp.assigned_user?.full_name}</td>
                    <td className="p-3.5 text-slate-500">{opp.expected_close_date || '-'}</td>
                    <td className="p-3.5 text-right pr-5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          opp.status === 'won'
                            ? 'bg-emerald-100 text-emerald-800'
                            : opp.status === 'lost'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
