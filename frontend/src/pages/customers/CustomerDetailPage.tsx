import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Send,
  Plus,
} from 'lucide-react';
import api from '../../api/client';
import { Customer, CustomerFollowup } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { useAuth } from '../../context/AuthContext';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followups, setFollowups] = useState<CustomerFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Followup Form
  const [noteInput, setNoteInput] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setCustomer(res.data.data);
        setFollowups(res.data.data.followups || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    setSubmittingNote(true);
    setNoteError(null);

    try {
      const res = await api.post(`/customers/${id}/followups`, { note: noteInput });
      if (res.data.success) {
        setFollowups([res.data.data, ...followups]);
        setNoteInput('');
      }
    } catch (err: any) {
      setNoteError(err.response?.data?.message || 'Failed to post follow-up note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading customer record..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchCustomerDetails} />;
  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      {/* Main Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'warning'}>
                {customer.status}
              </Badge>
              <Badge variant="purple">{customer.type}</Badge>
            </div>
            <p className="text-sm font-semibold text-gray-600 mt-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600" />
              {customer.businessName}
              {customer.gstNumber && <span className="text-gray-400 font-mono">• GST: {customer.gstNumber}</span>}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 text-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Contact Information</p>
            <p className="flex items-center gap-2 text-gray-800 font-medium">
              <Phone className="w-4 h-4 text-gray-400" /> {customer.mobile}
            </p>
            {customer.email && (
              <p className="flex items-center gap-2 text-gray-800 font-medium">
                <Mail className="w-4 h-4 text-gray-400" /> {customer.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Location & Schedule</p>
            <p className="flex items-start gap-2 text-gray-800 font-medium">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> {customer.address}
            </p>
            <p className="flex items-center gap-2 text-purple-800 font-semibold">
              <Calendar className="w-4 h-4 text-purple-600" /> Next Follow-up: {' '}
              {customer.followupDate ? new Date(customer.followupDate).toLocaleDateString() : 'Not Scheduled'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Account Notes</p>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs italic">
              {customer.notes || 'No account notes documented.'}
            </p>
          </div>
        </div>
      </div>

      {/* CRM Follow-up Timeline Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Clock className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-gray-900">CRM Follow-up History & Log</h2>
        </div>

        {/* Add Follow-up Form */}
        {hasRole('ADMIN', 'SALES') && (
          <form onSubmit={handleAddFollowup} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Log New Interactions / Call Notes</p>
            {noteError && <ErrorAlert message={noteError} />}
            <div className="flex gap-3">
              <Input
                placeholder="Type note about client discussion, quotation sent, next steps..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                required
              />
              <Button type="submit" isLoading={submittingNote} className="shrink-0">
                <Send className="w-4 h-4 mr-1.5" /> Log Note
              </Button>
            </div>
          </form>
        )}

        {/* Timeline */}
        <div className="space-y-4 pt-2">
          {followups.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No previous follow-up interactions recorded.</p>
          ) : (
            followups.map((fp) => (
              <div key={fp.id} className="relative pl-6 border-l-2 border-brand-200 space-y-1">
                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-brand-600 border-2 border-white" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">{fp.createdBy?.name || 'Staff Member'} ({fp.createdBy?.role})</span>
                  <span>{new Date(fp.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-100 shadow-2xs font-medium">
                  {fp.note}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
