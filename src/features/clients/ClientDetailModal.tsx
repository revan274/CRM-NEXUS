/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { Client, Contact, Opportunity, Task, Note, Activity } from '../../types/crm';
import {
  X,
  Building,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  FileText,
  User,
} from 'lucide-react';

interface ClientDetailModalProps {
  clientId: string;
  onClose: () => void;
  onClientUpdated: () => void;
}

type TabType = 'resumen' | 'actividad' | 'oportunidades' | 'tareas' | 'notas' | 'contactos';

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ clientId, onClose, onClientUpdated }) => {
  const { currentOrganization, currentUser, setNotification } = useAppStore();
  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [newNote, setNewNote] = useState<string>('');
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    position: '',
    email: '',
    phone: '',
    whatsapp: '',
    is_primary: false,
  });

  useEffect(() => {
    loadAllData();
  }, [clientId]);

  const loadAllData = async () => {
    setLoading(true);
    const [cRes, cntRes, oppRes, tskRes, notRes, actRes] = await Promise.all([
      apiRequest(`/api/clients/${clientId}`),
      apiRequest(`/api/contacts?client_id=${clientId}`),
      apiRequest(`/api/opportunities?client_id=${clientId}`),
      apiRequest(`/api/tasks?client_id=${clientId}`),
      apiRequest(`/api/notes?client_id=${clientId}`),
      apiRequest(`/api/activities?client_id=${clientId}`),
    ]);

    if (cRes.success) setClient(cRes.data);
    if (cntRes.success) setContacts(cntRes.data);
    if (oppRes.success) setOpportunities(oppRes.data);
    if (tskRes.success) setTasks(tskRes.data);
    if (notRes.success) setNotes(notRes.data);
    if (actRes.success) setActivities(actRes.data);

    setLoading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const res = await apiRequest('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        content: newNote.trim(),
        client_id: clientId,
      }),
    });

    if (res.success) {
      setNewNote('');
      setNotification({ type: 'success', message: 'Nota agregada con éxito' });
      loadAllData();
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.first_name || !contactForm.last_name) return;

    const res = await apiRequest('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({
        ...contactForm,
        client_id: clientId,
      }),
    });

    if (res.success) {
      setIsAddingContact(false);
      setContactForm({
        first_name: '',
        last_name: '',
        position: '',
        email: '',
        phone: '',
        whatsapp: '',
        is_primary: false,
      });
      setNotification({ type: 'success', message: 'Contacto asociado correctamente' });
      loadAllData();
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const res = await apiRequest(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
    if (res.success) {
      setNotification({ type: 'success', message: 'Tarea marcada como completada' });
      loadAllData();
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currentOrganization?.currency || 'MXN',
    }).format(val || 0);
  };

  if (loading || !client) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-xl p-8 max-w-lg w-full text-center">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Cargando ficha 360° del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header 360° */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {client.first_name.slice(0, 1)}
              {client.last_name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">{client.full_name}</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-indigo-100 text-indigo-700 capitalize">
                  {client.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                {client.company_name && (
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    {client.company_name}
                  </span>
                )}
                {client.position && <span>• {client.position}</span>}
                {client.city && <span>• {client.city}, {client.country}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-4 overflow-x-auto text-xs font-medium">
          {(
            [
              { id: 'resumen', label: 'Resumen 360°' },
              { id: 'actividad', label: `Actividad (${activities.length})` },
              { id: 'oportunidades', label: `Oportunidades (${opportunities.length})` },
              { id: 'tareas', label: `Tareas (${tasks.filter((t) => t.status !== 'completed').length})` },
              { id: 'notas', label: `Notas (${notes.length})` },
              { id: 'contactos', label: `Contactos (${contacts.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Contact info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Datos de Contacto
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.email || 'Sin correo registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp: {client.whatsapp || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.address || 'Sin dirección física'}</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Commercial info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trazabilidad Comercial
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Vendedor Asignado:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {client.assigned_user?.full_name || 'Sin Asignar'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Canal de Origen:</span>
                    <div className="font-semibold text-slate-800 capitalize mt-0.5">{client.source}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Próximo Seguimiento:</span>
                    <div className="font-semibold text-indigo-600 mt-0.5">
                      {client.next_follow_up_at
                        ? new Date(client.next_follow_up_at).toLocaleDateString()
                        : 'No programado'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: Financial snapshot */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Valor Comercial
                </h4>
                <div className="text-2xl font-bold text-indigo-700">
                  {formatCurrency(client.total_opportunity_value || 0)}
                </div>
                <p className="text-xs text-indigo-600">
                  {client.opportunities_count || 0} negociaciones registradas
                </p>
                {client.notes && (
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-xs text-slate-600 italic">
                    "{client.notes}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ACTIVIDAD */}
          {activeTab === 'actividad' && (
            <div className="space-y-4">
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 py-2">
                {activities.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-xs"></div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{act.title}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                      {act.description && <p className="text-slate-600">{act.description}</p>}
                      {act.result && <p className="text-emerald-700 font-medium">Resultado: {act.result}</p>}
                      <div className="text-[11px] text-slate-400">
                        Registrado por: <span className="font-semibold text-slate-600">{act.user?.full_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: OPORTUNIDADES */}
          {activeTab === 'oportunidades' && (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">{opp.name}</h5>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">{opp.stage?.name}</span>
                      <span>• Cierre previsto: {opp.expected_close_date || 'Sin fecha'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(opp.estimated_value)}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                      {opp.probability}% prob.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: TAREAS */}
          {activeTab === 'tareas' && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={task.status === 'completed'}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Vence: {task.due_date} {task.due_time}</span>
                        <span className="capitalize font-medium text-indigo-600">• {task.type}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : task.priority === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB: NOTAS */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Escribir una anotación interna sobre este cliente..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guardar Nota</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{note.user?.full_name}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTACTOS */}
          {activeTab === 'contactos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Personas de Contacto</span>
                <button
                  onClick={() => setIsAddingContact(!isAddingContact)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingContact ? 'Cancelar' : 'Nuevo Contacto'}</span>
                </button>
              </div>

              {isAddingContact && (
                <form onSubmit={handleCreateContact} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre *"
                      required
                      value={contactForm.first_name}
                      onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
                      className="p-2 text-xs border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Apellidos *"
                      required
                      value={contactForm.last_name}
                      onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
                      className="p-2 text-xs border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Cargo o Puesto"
                      value={contactForm.position}
                      onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                      className="p-2 text-xs border rounded-lg bg-white"
                    />
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="p-2 text-xs border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="p-2 text-xs border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp"
                      value={contactForm.whatsapp}
                      onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                      className="p-2 text-xs border rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="is_primary"
                      checked={contactForm.is_primary}
                      onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
                    />
                    <label htmlFor="is_primary" className="text-slate-700">Marcar como contacto principal</label>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Guardar Contacto
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map((c) => (
                  <div key={c.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">{c.first_name} {c.last_name}</span>
                      {c.is_primary && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    {c.position && <div className="text-[11px] text-slate-500">{c.position}</div>}
                    <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                      {c.email && <div>✉ {c.email}</div>}
                      {c.phone && <div>☎ {c.phone}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
