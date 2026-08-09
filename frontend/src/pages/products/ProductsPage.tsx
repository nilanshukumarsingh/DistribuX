import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, AlertTriangle, ArrowUpRight, Package, Warehouse } from 'lucide-react';
import api from '../../api/client';
import { Product, Pagination as PaginationType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { useAuth } from '../../context/AuthContext';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStock') === 'true');

  // Add / Edit Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: '',
  });

  // Stock In Modal
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [stockInProduct, setStockInProduct] = useState<Product | null>(null);
  const [stockInQty, setStockInQty] = useState(10);
  const [stockInReason, setStockInReason] = useState('New inventory inward intake');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          category: categoryFilter || undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        },
      });

      if (res.data.success) {
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryFilter, lowStockOnly]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Fasteners',
      unitPrice: 100,
      currentStock: 50,
      minStockAlert: 10,
      location: 'Warehouse A - Rack 01',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitPrice: prod.unitPrice,
      currentStock: prod.currentStock,
      minStockAlert: prod.minStockAlert,
      location: prod.location,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, {
          ...formData,
          unitPrice: Number(formData.unitPrice),
          minStockAlert: Number(formData.minStockAlert),
        });
      } else {
        await api.post('/products', {
          ...formData,
          unitPrice: Number(formData.unitPrice),
          currentStock: Number(formData.currentStock),
          minStockAlert: Number(formData.minStockAlert),
        });
      }
      setIsModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const openStockInModal = (prod: Product) => {
    setStockInProduct(prod);
    setStockInQty(10);
    setStockInReason('Stock Inward Intake');
    setFormError(null);
    setIsStockInModalOpen(true);
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInProduct) return;
    setSubmitting(true);
    setFormError(null);

    try {
      await api.post(`/products/${stockInProduct.id}/stock-in`, {
        quantity: Number(stockInQty),
        reason: stockInReason,
      });
      setIsStockInModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to complete stock-in operation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Products & Inventory Catalog</h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Manage SKUs, unit pricing, warehouse locations, and stock alerts.</p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="All Categories"
          options={[
            { label: 'Fasteners', value: 'Fasteners' },
            { label: 'Electrical Cables', value: 'Electrical Cables' },
            { label: 'Electrical Wiring', value: 'Electrical Wiring' },
            { label: 'Conduits & Pipes', value: 'Conduits & Pipes' },
            { label: 'Safety Equipment', value: 'Safety Equipment' },
            { label: 'Hand Tools', value: 'Hand Tools' },
            { label: 'Power Tools', value: 'Power Tools' },
            { label: 'Plumbing', value: 'Plumbing' },
          ]}
        />
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-cyan-500 focus:ring-cyan-500"
            />
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Low Stock Alerts Only
          </label>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner message="Loading products inventory..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={() => fetchProducts(1)} />
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Current Stock</th>
                  <th className="px-6 py-3.5">Warehouse Location</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      No products match your search query.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const isLowStock = prod.currentStock <= prod.minStockAlert;
                    return (
                      <tr key={prod.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/products/${prod.id}`} className="font-bold text-white hover:text-cyan-400 transition-colors">
                            {prod.name}
                          </Link>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">SKU: {prod.sku}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-zinc-300">
                          <span className="bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">{prod.category}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          ₹{prod.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{prod.currentStock}</span>
                            {isLowStock ? (
                              <Badge variant="warning" size="sm">
                                <AlertTriangle className="w-3 h-3 mr-1 inline" /> Low Stock ({prod.minStockAlert})
                              </Badge>
                            ) : (
                              <span className="text-xs text-zinc-500">(Min: {prod.minStockAlert})</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-zinc-500" />
                            {prod.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasRole('ADMIN', 'WAREHOUSE') && (
                              <button
                                onClick={() => openStockInModal(prod)}
                                className="px-2.5 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-900 transition-all border border-emerald-500/40 inline-flex items-center gap-1"
                                title="Stock In / Replenish"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" /> Stock IN
                              </button>
                            )}
                            <Link
                              to={`/products/${prod.id}`}
                              className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-xl transition-all"
                              title="View Details & Stock History"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {hasRole('ADMIN', 'WAREHOUSE') && (
                              <button
                                onClick={() => openEditModal(prod)}
                                className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-xl transition-all"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(page) => fetchProducts(page)} />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product SKU'}
        maxWidth="lg"
      >
        {formError && <ErrorAlert message={formError} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="SKU / Item Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <Input
              label="Unit Selling Price (₹)"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editingProduct && (
              <Input
                label="Initial Stock Quantity"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                required
              />
            )}
            <Input
              label="Minimum Stock Alert Level"
              type="number"
              value={formData.minStockAlert}
              onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Warehouse Location / Rack"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Warehouse A - Rack 04"
            required
          />

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stock IN Modal */}
      <Modal
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        title={`Stock IN - ${stockInProduct?.name}`}
        maxWidth="md"
      >
        {formError && <ErrorAlert message={formError} />}
        <form onSubmit={handleStockInSubmit} className="space-y-4">
          <p className="text-xs text-gray-500">
            Current Stock: <span className="font-bold text-gray-900">{stockInProduct?.currentStock}</span> units
          </p>
          <Input
            label="Quantity to Add (+)"
            type="number"
            min="1"
            value={stockInQty}
            onChange={(e) => setStockInQty(Number(e.target.value))}
            required
          />
          <Input
            label="Reason for Stock Addition"
            value={stockInReason}
            onChange={(e) => setStockInReason(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsStockInModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={submitting}>
              Confirm Stock IN
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
