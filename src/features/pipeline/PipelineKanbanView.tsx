/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { Opportunity, PipelineStage, Client, Product } from '../../types/crm';
import {
  Kanban,
  Plus,
  DollarSign,
  Calendar,
  Building,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Trash2,
} from 'lucide-react';

export const PipelineKanbanView: React.FC = () => {
  const { currentOrganization, currentUser, setNotification } = useAppStore();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Opportunity Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    stage_id: '',
    estimated_value: 0,
    expected_close_date: '',
    notes: '',
  });

  // Opportunity items state (section 27)
  const [items, setItems] = useState<
    Array<{ product_id: string; item_name: string; quantity: number; unit_price: number; discount: number; tax: number }>
  >([]);

  useEffect(() => {
    loadPipelineData();
  }, [currentOrganization?.id, currentUser?.id]);

  const loadPipelineData = async () => {
    setLoading(true);
    const [pipeRes, oppsRes, clientsRes, prdRes] = await Promise.all([
      apiRequest('/api/pipeline'),
      apiRequest('/api/opportunities'),
      apiRequest('/api/clients'),
      apiRequest('/api/products'),
    ]);

    if (pipeRes.success) setStages(pipeRes.data.stages);
    if (oppsRes.success) setOpportunities(oppsRes.data);
    if (clientsRes.success) setClients(clientsRes.data);
    if (prdRes.success) setProducts(prdRes.data.products);

    setLoading(false);
  };

  const handleStageChange = async (oppId: string, newStageId: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    const targetStage = stages.find((s) => s.id === newStageId);
    if (!opp || !targetStage) return;

    // Optimistic UI update
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === oppId
          ? {
              ...o,
              stage_id: newStageId,
              probability: targetStage.probability,
              status: targetStage.is_won_stage ? 'won' : targetStage.is_lost_stage ? 'lost' : 'open',
            }
          : o
      )
    );

    const res = await apiRequest(`/api/opportunities/${oppId}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage_id: newStageId }),
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: `Oportunidad movida a "${targetStage.name}" (${targetStage.probability}% probabilidad)`,
      });
      loadPipelineData();
    } else {
      setNotification({ type: 'error', message: res.error?.message || 'Error al cambiar etapa' });
      loadPipelineData();
    }
  };

  const handleAddItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setItems([
      ...items,
      {
        product_id: product.id,
        item_name: product.name,
        quantity: 1,
        unit_price: product.price,
        discount: 0,
        tax: product.tax_rate,
      },
    ]);
  };

  const calculateItemsTotal = () => {
    return items.reduce((acc, it) => {
      const sub = it.quantity * it.unit_price * (1 - it.discount / 100);
      const tot = sub * (1 + it.tax / 100);
      return acc + tot;
    }, 0);
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      setNotification({ type: 'error', message: 'Selecciona un cliente para la oportunidad' });
      return;
    }

    const calculatedVal = items.length > 0 ? calculateItemsTotal() : formData.estimated_value;

    const payload = {
      opportunity: {
        ...formData,
        estimated_value: calculatedVal,
        stage_id: formData.stage_id || stages[0]?.id,
      },
      items,
    };

    const res = await apiRequest('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      setNotification({ type: 'success', message: 'Oportunidad creada en el Pipeline' });
      setIsModalOpen(false);
      setItems([]);
      setFormData({
        name: '',
        client_id: '',
        stage_id: '',
        estimated_value: 0,
        expected_close_date: '',
        notes: '',
      });
      loadPipelineData();
    } else {
      setNotification({ type: 'error', message: res.error?.message || 'Error al crear oportunidad' });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currentOrganization?.currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Kanban className="w-5 h-5 text-indigo-600" />
            <span>Pipeline Comercial (Tablero Kanban)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Seguimiento visual del funnel de ventas en {currentOrganization?.name}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Oportunidad</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[620px] select-none">
        {stages.map((stage, stageIndex) => {
          const stageOpps = opportunities.filter((o) => o.stage_id === stage.id);
          const stageTotal = stageOpps.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

          return (
            <div
              key={stage.id}
              className="w-72 sm:w-80 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200 bg-white/80 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    ></div>
                    <span className="font-bold text-xs text-slate-900">{stage.name}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {stageOpps.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{formatCurrency(stageTotal)}</span>
                  <span>{stage.probability}% prob.</span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageOpps.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                    Sin oportunidades en esta etapa
                  </div>
                ) : (
                  stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-2.5"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{opp.name}</h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{opp.client?.company_name || opp.client?.full_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(opp.estimated_value)}
                        </div>
                        {opp.expected_close_date && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{opp.expected_close_date}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <div className="flex items-center gap-1 text-slate-500 truncate max-w-[120px]">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{opp.assigned_user?.full_name}</span>
                        </div>

                        {/* Stage Transition Selector */}
                        <div className="flex items-center gap-1">
                          {stageIndex > 0 && (
                            <button
                              onClick={() => handleStageChange(opp.id, stages[stageIndex - 1].id)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                              title={`Mover a ${stages[stageIndex - 1].name}`}
                            >
                              ←
                            </button>
                          )}
                          {stageIndex < stages.length - 1 && (
                            <button
                              onClick={() => handleStageChange(opp.id, stages[stageIndex + 1].id)}
                              className="px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-0.5"
                              title={`Avanzar a ${stages[stageIndex + 1].name}`}
                            >
                              <span>Avanzar</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW OPPORTUNITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Nueva Negociación / Oportunidad</h3>
                <p className="text-xs text-slate-500">Registrar y cotizar productos para {currentOrganization?.name}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Título de la Oportunidad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Licencias Anuales + Formación de Equipo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500 bg-white"
                  >
                    <option value="">Selecciona un cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.company_name || 'Sin empresa'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Etapa Inicial</label>
                  <select
                    value={formData.stage_id}
                    onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500 bg-white"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.probability}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Fecha Prevista de Cierre
                  </label>
                  <input
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Valor Estimado Manual (€) {items.length > 0 && '(Invalidador por ítems)'}
                  </label>
                  <input
                    type="number"
                    disabled={items.length > 0}
                    value={items.length > 0 ? calculateItemsTotal().toFixed(2) : formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: Number(e.target.value) })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* PRODUCT ITEMS BREAKDOWN (SECTION 27) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Productos y Servicios Cotizados</h5>
                    <p className="text-[11px] text-slate-500">Calcula automáticamente subtotales, IVA y total de la oportunidad</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddItem(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="p-1.5 text-xs border rounded-lg bg-white font-medium"
                    >
                      <option value="">+ Añadir del catálogo...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCurrency(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400 italic">
                    Sin productos añadidos (se aplicará el valor manual establecido arriba).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-xs">
                        <span className="font-semibold flex-1 truncate">{item.item_name}</span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-slate-400">Cant:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].quantity = Number(e.target.value);
                              setItems(newItems);
                            }}
                            className="w-12 p-1 border rounded text-center"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-slate-400">Precio:</label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].unit_price = Number(e.target.value);
                              setItems(newItems);
                            }}
                            className="w-18 p-1 border rounded text-right"
                          />
                        </div>
                        <div className="font-bold text-slate-800 text-xs w-20 text-right">
                          {formatCurrency(item.quantity * item.unit_price * (1 + item.tax / 100))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2 text-xs font-bold text-indigo-700">
                      Total Cotización: {formatCurrency(calculateItemsTotal())}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notas Comerciales</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  placeholder="Detalles sobre el alcance, plazos de entrega o acuerdos verbales..."
                ></textarea>
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
                  Crear Oportunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
