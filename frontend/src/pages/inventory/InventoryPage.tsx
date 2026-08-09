import React, { useState, useEffect } from 'react';
import { Boxes, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../../api/client';
import { StockMovement, Pagination as PaginationType } from '../../types';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

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
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Stock Movements Log</h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Audit log of all inward intake (IN) and sales challan deductions (OUT).</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-xl max-w-xs backdrop-blur-md">
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Qty Changed</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      No stock movement entries found.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-zinc-400">
                        {new Date(mov.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">{mov.product?.name}</span>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">SKU: {mov.product?.sku}</p>
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
                      <td className="px-6 py-4 font-extrabold text-white">
                        {mov.type === 'IN' ? `+${mov.quantityChanged}` : `-${mov.quantityChanged}`}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-300">{mov.reason}</td>
                      <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
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
