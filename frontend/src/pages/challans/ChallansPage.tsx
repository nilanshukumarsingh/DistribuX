import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, FileSpreadsheet, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../api/client';
import { Challan, Pagination as PaginationType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { useAuth } from '../../context/AuthContext';

export const ChallansPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();

  const [challans, setChallans] = useState<Challan[]>([]);
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
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const fetchChallans = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/challans', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });

      if (res.data.success) {
        setChallans(res.data.data.challans);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans(1);
  }, [search, statusFilter]);

  const statusBadges: Record<string, any> = {
    DRAFT: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'danger',
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sales Challans Management</h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Create draft sales challans, review item quantities, and execute atomic stock deductions upon confirmation.
          </p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Link to="/challans/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Sales Challan
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by challan # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Statuses"
          options={[
            { label: 'DRAFT', value: 'DRAFT' },
            { label: 'CONFIRMED', value: 'CONFIRMED' },
            { label: 'CANCELLED', value: 'CANCELLED' },
          ]}
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <LoadingSpinner message="Loading sales challans..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={() => fetchChallans(1)} />
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Challan Number</th>
                  <th className="px-6 py-3.5">Customer & Business</th>
                  <th className="px-6 py-3.5">Total Qty</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {challans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      No sales challans found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  challans.map((ch) => (
                    <tr key={ch.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/challans/${ch.id}`} className="font-bold text-cyan-400 hover:underline font-mono">
                          {ch.challanNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{ch.customer?.name}</p>
                        <p className="text-xs text-zinc-400">{ch.customer?.businessName}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{ch.totalQuantity} items</td>
                      <td className="px-6 py-4 font-extrabold text-white">
                        ₹{ch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadges[ch.status]}>{ch.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/challans/${ch.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-950 text-cyan-300 text-xs font-bold rounded-xl hover:bg-cyan-900 transition-all border border-cyan-500/40"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(page) => fetchChallans(page)} />
        </div>
      )}
    </div>
  );
};
