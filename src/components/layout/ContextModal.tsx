/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Building2, UserCheck, Shield, AlertTriangle, X, Check, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types/crm';

export const ContextModal: React.FC = () => {
  const {
    isContextModalOpen,
    setIsContextModalOpen,
    organizations,
    currentOrganization,
    currentUser,
    switchContext,
  } = useAppStore();

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    if (currentOrganization) {
      setSelectedOrgId(currentOrganization.id);
    }
    if (currentUser) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentOrganization, currentUser, isContextModalOpen]);

  // When org changes in modal, load its users
  useEffect(() => {
    if (!selectedOrgId) return;
    setLoadingUsers(true);
    fetch(`/api/users?organization_id=${selectedOrgId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setOrgUsers(json.data);
          // If current selected user is not in this new org, pick first user
          const exists = json.data.find((u: any) => u.id === selectedUserId);
          if (!exists && json.data.length > 0) {
            setSelectedUserId(json.data[0].id);
          }
        }
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, [selectedOrgId]);

  if (!isContextModalOpen) return null;

  const handleApply = async () => {
    if (selectedOrgId && selectedUserId) {
      await switchContext(selectedOrgId, selectedUserId);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'manager':
        return { label: 'Gerente', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'salesperson':
        return { label: 'Vendedor', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'customer_service':
        return { label: 'Atención al Cliente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: role, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Contexto de Empresa y Usuario</h3>
              <p className="text-xs text-slate-500">Simulación controlada de sesión multiempresa (MVP)</p>
            </div>
          </div>
          <button
            onClick={() => setIsContextModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Aislamiento por Organización:</span> Al cambiar de empresa,
              el backend intermedio verifica que los usuarios, clientes, oportunidades y tareas pertenezcan
              exclusivamente a la empresa elegida.
            </div>
          </div>

          {/* Step 1: Select Organization */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Seleccionar Organización / Empresa
            </label>
            <div className="grid grid-cols-1 gap-2">
              {organizations.map((org) => {
                const isSelected = selectedOrgId === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{org.name}</div>
                      <div className="text-xs text-slate-500">
                        {org.city}, {org.country} • Moneda: {org.currency}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select User */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              2. Seleccionar Usuario Activo (Rol Operativo)
            </label>
            {loadingUsers ? (
              <div className="text-center py-4 text-xs text-slate-500">Cargando usuarios...</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {orgUsers.map((u) => {
                  const isSelected = selectedUserId === u.id;
                  const roleBadge = getRoleBadge(u.role);
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {u.full_name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-medium text-xs text-slate-900">{u.full_name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={() => setIsContextModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Aplicar Contexto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
