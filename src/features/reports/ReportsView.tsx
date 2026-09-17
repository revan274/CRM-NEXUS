/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import {
  TrendingUp,
  FileSpreadsheet,
  Download,
  DollarSign,
  Users,
  Target,
  BarChart3,
  PieChart,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { currentOrganization, currentUser, setNotification } = useAppStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReports();
  }, [currentOrganization?.id, currentUser?.id]);

  const loadReports = async () => {
    setLoading(true);
    const res = await apiRequest('/api/reports/dashboard');
    if (res.success) {
      setMetrics(res.data);
    }
    setLoading(false);
  };

  const handleExport = (entity: string, format: 'csv' | 'xlsx') => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
      setNotification({ type: 'error', message: 'No dispones de permisos de exportación' });
      return;
    }
    window.location.href = `/api/export/${entity}?format=${format}&organization_id=${currentOrganization?.id}&user_id=${currentUser?.id}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currentOrganization?.currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading || !metrics) {
    return <div className="p-8 text-center text-xs text-slate-400">Generando reportes analíticos...</div>;
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reportes y Analítica Comercial</h1>
          <p className="text-xs text-slate-500">
            Inteligencia de negocio y conversión de ventas en {currentOrganization?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('clients', 'xlsx')}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar Clientes (XLSX)</span>
          </button>
          <button
            onClick={() => handleExport('opportunities', 'xlsx')}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Descargar Ventas (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Volumen Total Negociado</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(metrics.totalPipelineValue + metrics.totalSalesWon)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Suma de cerradas y activas</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Ticket Promedio Cerrado</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {formatCurrency(metrics.averageTicket)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Por oportunidad ganada</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Efectividad de Cierre</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ratio de conversión de oportunidades</div>
        </div>
      </div>

      {/* Analytical Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Rep */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Efectividad por Vendedor</h3>
            <p className="text-xs text-slate-500">Comparativa de ventas ganadas vs pipeline actual</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.salesByRep} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="userName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="wonValue" name="Ganadas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activeValue" name="En Curso" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Origins */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Canales de Captación</h3>
            <p className="text-xs text-slate-500">Distribución de clientes por procedencia</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={metrics.clientsBySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.source || entry.name || ''}: ${entry.value || entry.count || ''}`}
                >
                  {metrics.clientsBySource.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
