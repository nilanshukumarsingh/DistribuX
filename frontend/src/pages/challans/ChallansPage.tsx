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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Challans Management</h1>
          <p className="text-sm text-gray-500 mt-1">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by challan # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {challans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No sales challans found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  challans.map((ch) => (
                    <tr key={ch.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/challans/${ch.id}`} className="font-bold text-brand-600 hover:underline font-mono">
                          {ch.challanNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{ch.customer?.name}</p>
                        <p className="text-xs text-gray-500">{ch.customer?.businessName}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{ch.totalQuantity} items</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{ch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadges[ch.status]}>{ch.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/challans/${ch.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-semibold rounded-lg hover:bg-brand-100 transition-colors border border-brand-200"
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
