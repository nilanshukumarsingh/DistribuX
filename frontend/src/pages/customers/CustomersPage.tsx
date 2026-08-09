import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit2, Phone, Mail, Building } from 'lucide-react';
import api from '../../api/client';
import { Customer, Pagination as PaginationType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { useAuth } from '../../context/AuthContext';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    type: 'RETAIL',
    status: 'LEAD',
    address: '',
    followupDate: '',
    notes: '',
  });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/customers', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        },
      });

      if (res.data.success) {
        setCustomers(res.data.data.customers);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter, typeFilter]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      type: 'RETAIL',
      status: 'LEAD',
      address: '',
      followupDate: '',
      notes: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email || '',
      businessName: cust.businessName,
      gstNumber: cust.gstNumber || '',
      type: cust.type,
      status: cust.status,
      address: cust.address,
      followupDate: cust.followupDate ? cust.followupDate.slice(0, 10) : '',
      notes: cust.notes || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setIsModalOpen(false);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadges: Record<string, any> = {
    LEAD: 'warning',
    ACTIVE: 'success',
    INACTIVE: 'gray',
  };

  const typeBadges: Record<string, any> = {
    RETAIL: 'info',
    WHOLESALE: 'purple',
    DISTRIBUTOR: 'default',
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer CRM</h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Manage accounts, leads, and sales follow-up schedules.</p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button onClick={openAddModal} className="sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by customer name, business, mobile..."
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
            { label: 'LEAD', value: 'LEAD' },
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'INACTIVE', value: 'INACTIVE' },
          ]}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="All Customer Types"
          options={[
            { label: 'RETAIL', value: 'RETAIL' },
            { label: 'WHOLESALE', value: 'WHOLESALE' },
            { label: 'DISTRIBUTOR', value: 'DISTRIBUTOR' },
          ]}
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <LoadingSpinner message="Loading customer directory..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={() => fetchCustomers(1)} />
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Customer & Business</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Next Follow-Up</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      No customer records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/customers/${cust.id}`} className="font-bold text-white hover:text-cyan-400 transition-colors">
                          {cust.name}
                        </Link>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-zinc-500" />
                          {cust.businessName} {cust.gstNumber ? `• GST: ${cust.gstNumber}` : ''}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          {cust.mobile}
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            {cust.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={typeBadges[cust.type]}>{cust.type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadges[cust.status]}>{cust.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {cust.followupDate ? (
                          <span className="text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-500/40 font-bold">
                            {new Date(cust.followupDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-zinc-500">None set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/customers/${cust.id}`}
                            className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-xl transition-all"
                            title="View Customer Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {hasRole('ADMIN', 'SALES') && (
                            <button
                              onClick={() => openEditModal(cust)}
                              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-xl transition-all"
                              title="Edit Customer"
                            >
                              <Edit2 className="w-4 h-4" />
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
          <Pagination pagination={pagination} onPageChange={(page) => fetchCustomers(page)} />
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Account' : 'Add New Customer'}
        maxWidth="lg"
      >
        {formError && <ErrorAlert message={formError} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
            <Input
              label="Email Address (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Customer Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Wholesale', value: 'WHOLESALE' },
                { label: 'Distributor', value: 'DISTRIBUTOR' },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { label: 'Lead', value: 'LEAD' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
            />
            <Input
              label="GST Number (Optional)"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </div>

          <Input
            label="Full Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Next Follow-up Date"
              type="date"
              value={formData.followupDate}
              onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
            />
            <Input
              label="Initial Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key notes or interest..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingCustomer ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
