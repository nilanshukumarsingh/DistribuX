import React, { useState, useEffect } from 'react';
import { Boxes, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../api/client';
import { StockMovement, Pagination as PaginationType } from '../types';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchMovements = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/inventory/movements', {
        params: {
          page,
          limit: 15,
          type: typeFilter || undefined,
        },
      });

      if (res.data.success) {
        setMovements(res.data.data.movements);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory movements log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements(1);
  }, [typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements Log</h1>
          <p className="text-sm text-gray-500 mt-1">Audit log of all inward intake (IN) and sales challan deductions (OUT).</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs max-w-xs">
        <Select
          label="Filter Movement Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="All Movements (IN & OUT)"
          options={[
            { label: 'Stock IN (+)', value: 'IN' },
            { label: 'Stock OUT (-)', value: 'OUT' },
          ]}
        />
      </div>

      {/* Movements Log Table */}
      {loading ? (
        <LoadingSpinner message="Loading stock movement log..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={() => fetchMovements(1)} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Qty Changed</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No stock movement entries found.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">
                        {new Date(mov.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{mov.product?.name}</span>
                        <p className="text-xs text-gray-500 font-mono">SKU: {mov.product?.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={mov.type === 'IN' ? 'success' : 'danger'}>
                          {mov.type === 'IN' ? (
                            <><ArrowUpRight className="w-3.5 h-3.5 mr-1 inline" /> IN</>
                          ) : (
                            <><ArrowDownLeft className="w-3.5 h-3.5 mr-1 inline" /> OUT</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {mov.type === 'IN' ? `+${mov.quantityChanged}` : `-${mov.quantityChanged}`}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700">{mov.reason}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                        {mov.createdBy?.name} ({mov.createdBy?.role})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(page) => fetchMovements(page)} />
        </div>
      )}
    </div>
  );
};
