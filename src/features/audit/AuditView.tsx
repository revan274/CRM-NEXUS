/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { AuditLog } from '../../types/crm';
import { ShieldCheck, User, Clock, Lock, Database, Search } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { currentOrganization, currentUser } = useAppStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAuditLogs();
  }, [currentOrganization?.id, currentUser?.id]);

  const loadAuditLogs = async () => {
    setLoading(true);
    const res = await apiRequest('/api/audit');
    if (res.success) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UPDATE':
      case 'STAGE_CHANGE':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ARCHIVE':
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Auditoría Forense y Trazabilidad Multiempresa</span>
          </h1>
          <p className="text-xs text-slate-500">
            Registro inmutable de transacciones ejecutadas en {currentOrganization?.name}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tenant ID: {currentOrganization?.id.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Fecha y Hora</th>
                <th className="p-3.5">Operador / Usuario</th>
                <th className="p-3.5">Acción</th>
                <th className="p-3.5">Entidad</th>
                <th className="p-3.5">ID Objeto</th>
                <th className="p-3.5 pr-5">Detalle / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Cargando pista de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No se han registrado eventos de auditoría para esta organización
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5 font-mono text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{log.user?.full_name || log.user_id}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.user?.role}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 capitalize">{log.entity}</td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                      {log.entity_id}
                    </td>
                    <td className="p-3.5 pr-5 font-mono text-[10px] text-slate-600">
                      <pre className="max-w-xs truncate bg-slate-50 p-1.5 rounded border border-slate-100">
                        {JSON.stringify(log.metadata)}
                      </pre>
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
