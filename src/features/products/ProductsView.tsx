/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { apiRequest } from '../../lib/api-client';
import { Product, ProductCategory } from '../../types/crm';
import {
  Package,
  Plus,
  Search,
  FileSpreadsheet,
  Download,
  Tag,
  Percent,
  DollarSign,
  X,
  Lock,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { currentOrganization, currentUser, setNotification } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    type: 'service' as 'product' | 'service' | 'subscription',
    price: 0,
    cost: 0,
    tax_rate: 16,
    status: 'active' as const,
  });

  useEffect(() => {
    loadProducts();
  }, [currentOrganization?.id, currentUser?.id]);

  const loadProducts = async () => {
    setLoading(true);
    const res = await apiRequest('/api/products');
    if (res.success) {
      setProducts(res.data.products);
      setCategories(res.data.categories);
    }
    setLoading(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      setNotification({ type: 'error', message: 'Solo los administradores pueden añadir productos al catálogo' });
      return;
    }

    const res = await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setNotification({ type: 'success', message: 'Producto añadido al catálogo' });
      setIsModalOpen(false);
      setFormData({
        sku: '',
        name: '',
        description: '',
        type: 'service',
        price: 0,
        cost: 0,
        tax_rate: 16,
        status: 'active',
      });
      loadProducts();
    } else {
      setNotification({ type: 'error', message: res.error?.message || 'Error al crear producto' });
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
      setNotification({ type: 'error', message: 'No dispones de permisos de exportación' });
      return;
    }
    window.location.href = `/api/export/products?format=${format}&organization_id=${currentOrganization?.id}&user_id=${currentUser?.id}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currentOrganization?.currency || 'MXN',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const calculateMargin = (price: number, cost: number) => {
    if (!price || price === 0) return 0;
    return (((price - cost) / price) * 100).toFixed(1);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Productos y Servicios</h1>
          <p className="text-xs text-slate-500">
            {products.length} artículos configurados en {currentOrganization?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => {
              if (currentUser?.role !== 'admin') {
                setNotification({
                  type: 'error',
                  message: 'Acceso denegado: solo el Administrador puede crear productos.',
                });
                return;
              }
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {currentUser?.role !== 'admin' ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">SKU / Código</th>
                <th className="p-3.5">Nombre y Descripción</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5">Coste Directo</th>
                <th className="p-3.5">Margen Comercial</th>
                <th className="p-3.5">IVA (%)</th>
                <th className="p-3.5 text-right pr-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Cargando catálogo...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-slate-800">{p.sku}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      {p.description && <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {p.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{formatCurrency(p.price)}</td>
                    <td className="p-3.5 text-slate-500">{formatCurrency(p.cost)}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-700">
                        {calculateMargin(p.price, p.cost)}%
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{p.tax_rate}%</td>
                    <td className="p-3.5 text-right pr-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Añadir Producto o Servicio</h3>
                <p className="text-xs text-slate-500">Configuración de catálogo para {currentOrganization?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">SKU / Referencia *</label>
                  <input
                    type="text"
                    required
                    placeholder="PRD-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipo de Artículo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 text-xs border rounded-lg bg-white focus:border-indigo-500"
                  >
                    <option value="service">Servicio</option>
                    <option value="subscription">Suscripción recurrente</option>
                    <option value="product">Producto físico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Consultoría de Transformación Digital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Precio Venta ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Costo ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">IVA (%)</label>
                  <input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                    className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg focus:border-indigo-500"
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
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
