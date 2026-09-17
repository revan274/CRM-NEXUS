/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { Activity, Client, Opportunity } from '../../types/crm';
import {
  Activity as ActivityIcon,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle,
  Layers,
  Building,
  User,
  X,
} from 'lucide-react';

export const ActivitiesView: React.FC = () => {
  const { currentOrganization, currentUser, setNotification } = useAppStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'call' as Activity['type'],
    result: '',
    client_id: '',
    opportunity_id: '',
  });

  useEffect(() => {
    loadActivities();
  }, [currentOrganization?.id, currentUser?.id]);

  const loadActivities = async () => {
    setLoading(true);
    const [actRes, cRes, oppRes] = await Promise.all([
      apiRequest('/api/activities'),
      apiRequest('/api/clients'),
      apiRequest('/api/opportunities'),
    ]);

    if (actRes.success) setActivities(actRes.data);
    if (cRes.success) setClients(cRes.data);
    if (oppRes.success) setOpportunities(oppRes.data);

    setLoading(false);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/activities', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setNotification({ type: 'success', message: 'Interacción comercial registrada' });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'call',
        result: '',
        client_id: '',
        opportunity_id: '',
      });
      loadActivities();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4 text-blue-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'stage_change':
        return <Layers className="w-4 h-4 text-purple-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registro de Actividad Comercial</h1>
          <p className="text-xs text-slate-500">
            Histórico cronológico de llamadas, reuniones y acuerdos en {currentOrganization?.name}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Actividad</span>
        </button>
      </div>

      {/* Activities Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 py-2">
        {loading ? (
          <div className="text-xs text-slate-400">Cargando actividades...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No hay actividades registradas</div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative">
              <div className="absolute -left-[33px] top-0 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                {getActivityIcon(act.type)}
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{act.title}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>

                {act.description && (
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{act.description}</p>
                )}

                {act.result && (
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-medium text-emerald-800">
                    Acuerdo / Resultado: {act.result}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  {act.client && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Building className="w-3 h-3 text-slate-400" />
                      {act.client.company_name || act.client.full_name}
                    </span>
                  )}
                  {act.opportunity && (
                    <span className="text-indigo-600 font-medium">
                      Negociación: {act.opportunity.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-500">
                    <User className="w-3 h-3 text-slate-400" />
                    {act.user?.full_name}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE ACTIVITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Registrar Interacción Comercial</h3>
                <p className="text-xs text-slate-500">Documentar llamada, reunión o avance</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-6 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título de la Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reunión de demostración técnica"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipo de Interacción</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 text-xs border rounded-lg bg-white focus:border-indigo-500"
                  >
                    <option value="call">Llamada telefónica</option>
                    <option value="meeting">Reunión con cliente</option>
                    <option value="email">Correo enviado</option>
                    <option value="whatsapp">Mensaje WhatsApp</option>
                    <option value="note">Anotación de campo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cliente Vinculado</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg bg-white focus:border-indigo-500"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.company_name || 'Sin empresa'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Oportunidad Relacionada</label>
                <select
                  value={formData.opportunity_id}
                  onChange={(e) => setFormData({ ...formData, opportunity_id: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg bg-white focus:border-indigo-500"
                >
                  <option value="">Opcional: Sin vincular a oportunidad</option>
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Resumen de la Conversación</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  placeholder="Detalles sobre las objeciones, dudas o interés expresado..."
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Resultado / Próximo Paso</label>
                <input
                  type="text"
                  placeholder="Ej: Enviar cotización antes del viernes"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Registrar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
