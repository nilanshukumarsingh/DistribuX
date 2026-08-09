import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Warehouse, Tag, AlertTriangle, Boxes, History } from 'lucide-react';
import api from '../api/client';
import { Product, StockMovement } from '../types';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading product information..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchProductDetails} />;
  if (!product) return null;

  const isLowStock = product.currentStock <= product.minStockAlert;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Catalog
        </Link>
      </div>

      {/* Main Product Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <Badge variant="purple">{product.category}</Badge>
              {isLowStock && (
                <Badge variant="warning">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" /> Low Stock
                </Badge>
              )}
            </div>
            <p className="text-sm font-mono text-gray-500 mt-1">SKU: {product.sku}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-gray-400">Unit Selling Price</p>
            <p className="text-2xl font-extrabold text-brand-600">
              ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Current On-Hand Stock</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{product.currentStock} units</p>
            <p className="text-xs text-gray-400 mt-1">Alert Threshold: {product.minStockAlert} units</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Warehouse Location</p>
            <p className="text-base font-bold text-gray-800 mt-1 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-brand-600" />
              {product.location}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Created Date</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Movement History */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <History className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-gray-900">Stock Movement Audit Trail</h2>
        </div>

        {!product.stockMovements || product.stockMovements.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No stock movements recorded for this item yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {product.stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(mov.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={mov.type === 'IN' ? 'success' : 'danger'}>
                        {mov.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {mov.type === 'IN' ? `+${mov.quantityChanged}` : `-${mov.quantityChanged}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{mov.reason}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                      {mov.createdBy?.name || 'System'} ({mov.createdBy?.role})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
