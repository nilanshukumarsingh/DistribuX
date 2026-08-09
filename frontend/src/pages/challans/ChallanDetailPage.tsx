import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, CheckCircle2, XCircle, User, Building, Phone, Calendar, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { Challan } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { useAuth } from '../context/AuthContext';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirmation Action state
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Cancel Action state
  const [cancelling, setCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchChallanDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallanDetails();
  }, [id]);

  const handleConfirmChallan = async () => {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await api.post(`/challans/${id}/confirm`);
      if (res.data.success) {
        setChallan(res.data.data);
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      // Backend returns explicit error e.g. Insufficient stock for product XYZ. Available: 5, Requested: 8.
      setConfirmError(err.response?.data?.message || 'Failed to confirm challan');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelChallan = async () => {
    setCancelling(true);
    try {
      const res = await api.post(`/challans/${id}/cancel`);
      if (res.data.success) {
        setChallan(res.data.data);
        setIsCancelModalOpen(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel challan');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading sales challan record..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchChallanDetails} />;
  if (!challan) return null;

  const statusBadges: Record<string, any> = {
    DRAFT: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'danger',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link
          to="/challans"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales Challans
        </Link>
      </div>

      {confirmError && <ErrorAlert title="Challan Confirmation Rejected" message={confirmError} />}

      {/* Main Challan Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-gray-900">{challan.challanNumber}</h1>
              <Badge variant={statusBadges[challan.status]}>{challan.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Created on {new Date(challan.createdAt).toLocaleString()} by{' '}
              <span className="font-semibold text-gray-700">{challan.createdBy?.name}</span> ({challan.createdBy?.role})
            </p>
          </div>

          {/* Action Buttons for DRAFT status */}
          <div className="flex items-center gap-3">
            {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES', 'WAREHOUSE') && (
              <Button variant="success" onClick={() => setIsConfirmModalOpen(true)}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Challan (Deduct Stock)
              </Button>
            )}
            {challan.status !== 'CANCELLED' && hasRole('ADMIN', 'SALES') && (
              <Button variant="outline" onClick={() => setIsCancelModalOpen(true)}>
                <XCircle className="w-4 h-4 mr-1.5 text-rose-600" /> Cancel Challan
              </Button>
            )}
          </div>
        </div>

        {/* Customer & Billing Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">Customer Details</p>
            <p className="font-bold text-gray-900 text-base">{challan.customer?.name}</p>
            <p className="text-gray-700 flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-brand-600" /> {challan.customer?.businessName}
            </p>
            <p className="text-gray-600 flex items-center gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> {challan.customer?.mobile}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">Financial Summary</p>
            <p className="text-xs text-gray-500">
              Total Items Quantity: <span className="font-bold text-gray-900">{challan.totalQuantity} units</span>
            </p>
            <p className="text-2xl font-extrabold text-brand-600">
              ₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Snapshot Line Items Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
          Line Item Snapshots
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {challan.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                  <td className="px-4 py-3 text-gray-800">
                    ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50 text-sm font-bold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-gray-700">Totals:</td>
                <td className="px-4 py-3 text-gray-900">{challan.totalQuantity} items</td>
                <td className="px-4 py-3 text-right text-brand-700 text-base">
                  ₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Sales Challan"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              Confirming this challan will execute an atomic database transaction to reduce product inventory and log stock OUT movements.
            </p>
          </div>
          <p className="text-sm text-gray-700">
            Are you sure you want to confirm sales challan <span className="font-mono font-bold text-gray-900">{challan.challanNumber}</span>?
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleConfirmChallan} isLoading={confirming}>
              Confirm & Deduct Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Sales Challan"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to cancel sales challan <span className="font-mono font-bold text-gray-900">{challan.challanNumber}</span>?
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Active
            </Button>
            <Button variant="danger" onClick={handleCancelChallan} isLoading={cancelling}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
