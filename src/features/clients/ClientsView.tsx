/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { Client } from '../../types/crm';
import { ClientDetailModal } from './ClientDetailModal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Building,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  X,
  Eye,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { currentOrganization, currentUser, setNotification, globalSearchQuery } = useAppStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Modal & Duplicate Detection
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [duplicatesFound, setDuplicatesFound] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    position: '',
    email: '',
    phone: '',
    whatsapp: '',
    city: '',
    country: 'México',
    source: 'website' as const,
    status: 'lead' as const,
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, [currentOrganization?.id, currentUser?.id, statusFilter, sourceFilter]);

  const loadClients = async () => {
    setLoading(true);
    let url = `/api/clients?status=${statusFilter}&source=${sourceFilter}`;
    const query = searchQuery || globalSearchQuery;
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
    const res = await apiRequest(url);
    if (res.success) {
      setClients(res.data);
    }
    setLoading(false);
  };

  // Run duplicate check on blur or keystroke debounce
  const handleCheckDuplicates = async () => {
    if (!formData.email && !formData.phone && !formData.company_name) return;
    const res = await apiRequest('/api/clients/check-duplicates', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        company_name: formData.company_name,
        first_name: formData.first_name,
      }),
    });
    if (res.success && res.data.length > 0) {
      setDuplicatesFound(res.data);
    } else {
      setDuplicatesFound([]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setNotification({ type: 'success', message: 'Cliente registrado exitosamente' });
      setIsCreateOpen(false);
      setDuplicatesFound([]);
      setFormData({
        first_name: '',
        last_name: '',
        company_name: '',
        position: '',
        email: '',
        phone: '',
        whatsapp: '',
        city: '',
        country: 'España',
        source: 'website',
        status: 'lead',
        notes: '',
      });
      loadClients();
    } else {
      setNotification({ type: 'error', message: res.error?.message || 'Error al guardar cliente' });
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (currentUser?.role !== 'admin') {
      setNotification({ type: 'error', message: 'Solo un Administrador puede archivar clientes' });
      return;
    }
    if (!confirm(`¿Estás seguro de archivar a ${name}?`)) return;

    const res = await apiRequest(`/api/clients/${id}`, { method: 'DELETE' });
    if (res.success) {
      setNotification({ type: 'success', message: 'Cliente archivado' });
      loadClients();
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
      setNotification({ type: 'error', message: 'No dispones de permisos de exportación' });
      return;
    }
    window.location.href = `/api/export/clients?format=${format}&organization_id=${currentOrganization?.id}&user_id=${currentUser?.id}`;
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Clientes</h1>
          <p className="text-xs text-slate-500">
            {clients.length} cuentas y contactos en {currentOrganization?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport('xlsx')}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
              title="Exportar a CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>CSV</span>
            </button>
          </div>

          {/* New Client Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
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
              placeholder="Filtrar por nombre, empresa, ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadClients()}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>
          <button
            onClick={loadClients}
            className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
          >
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="lead">Lead</option>
            <option value="contacted">Contactado</option>
            <option value="prospect">Prospecto</option>
            <option value="customer">Cliente</option>
            <option value="inactive">Inactivo</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">Todos los Orígenes</option>
            <option value="website">Sitio Web</option>
            <option value="referral">Recomendación</option>
            <option value="campaign">Campaña</option>
            <option value="event">Evento</option>
            <option value="cold_call">Prospección</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Nombre y Empresa</th>
                <th className="p-3.5">Contacto</th>
                <th className="p-3.5">Ciudad</th>
                <th className="p-3.5">Vendedor</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Oportunidades</th>
                <th className="p-3.5 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Cargando listado de clientes...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No se encontraron clientes</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Prueba ajustando los filtros o registra uno nuevo.</p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900 text-xs">{client.full_name}</div>
                      {client.company_name && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{client.company_name}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>{client.email || '-'}</div>
                      <div className="text-[11px] text-slate-400">{client.phone || '-'}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {client.city || '-'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-700">
                        {client.assigned_user?.full_name || 'Sin Asignar'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                        client.status === 'customer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : client.status === 'prospect'
                          ? 'bg-indigo-100 text-indigo-800'
                          : client.status === 'contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {formatCurrency(client.total_opportunity_value || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {client.opportunities_count || 0} negociaciones
                      </div>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedClientId(client.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Abrir Ficha 360°"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleArchive(client.id, client.full_name)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                            title="Archivar Cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CLIENT MODAL WITH DUPLICATE DETECTION */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Registrar Nuevo Cliente</h3>
                <p className="text-xs text-slate-500">Añadir prospecto o cuenta a {currentOrganization?.name}</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* DUPLICATE WARNING BANNER */}
              {duplicatesFound.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Encontramos posibles clientes duplicados en el sistema:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                    {duplicatesFound.map((dup) => (
                      <li key={dup.id}>
                        <span className="font-semibold">{dup.full_name}</span> ({dup.company_name || 'Sin empresa'}) - {dup.email || dup.phone}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 italic">
                    Puedes continuar con el registro si se trata de una cuenta legítima separada.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    onBlur={handleCheckDuplicates}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="Ej: Laura"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="Ej: Gallego"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Empresa / Razón Social</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    onBlur={handleCheckDuplicates}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="Ej: Inversiones Globales SL"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="Ej: Directora Comercial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={handleCheckDuplicates}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={handleCheckDuplicates}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    onBlur={handleCheckDuplicates}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Canal Origen</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500 bg-white"
                  >
                    <option value="website">Sitio Web</option>
                    <option value="referral">Recomendación</option>
                    <option value="campaign">Campaña</option>
                    <option value="event">Evento</option>
                    <option value="cold_call">Llamada Fría</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notas Iniciales</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  placeholder="Detalles de interés comercial..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 360° DETAIL MODAL */}
      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onClientUpdated={loadClients}
        />
      )}
    </div>
  );
};
