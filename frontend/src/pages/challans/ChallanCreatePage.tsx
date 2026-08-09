import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShoppingBag, Calculator, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { Customer, Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SelectedItem {
  productId: string;
  product?: Product;
  quantity: number;
}

export const ChallanCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([
    { productId: '', quantity: 1 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
        ]);

        if (custRes.data.success) setCustomers(custRes.data.data.customers);
        if (prodRes.data.success) setProducts(prodRes.data.data.products);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load metadata');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      product: selectedProd,
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(1, quantity),
    };
    setItems(updated);
  };

  // Calculations
  const grandTotalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const grandTotalAmount = items.reduce((sum, item) => {
    const price = item.product?.unitPrice || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedCustomerId) {
      setSubmitError('Please select a customer.');
      return;
    }

    const validItems = items.filter((i) => i.productId !== '');
    if (validItems.length === 0) {
      setSubmitError('Please select at least one product item.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/challans', {
        customerId: selectedCustomerId,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      if (res.data.success) {
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create sales challan draft');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading customer & product lists..." />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-zinc-100">
      <div className="flex items-center gap-4">
        <Link
          to="/challans"
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Challans
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New Sales Challan</h1>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Select customer, add products, verify unit prices, and save as a DRAFT.
        </p>
      </div>

      {submitError && <ErrorAlert message={submitError} />}

      <form onSubmit={handleSubmitDraft} className="space-y-6">
        {/* Customer Selection Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-4 border-b border-zinc-800/80 pb-2">
            1. Select Customer Account
          </h2>
          <Select
            label="Customer"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            placeholder="-- Choose Customer --"
            options={customers.map((c) => ({
              label: `${c.name} (${c.businessName}) • ${c.mobile}`,
              value: c.id,
            }))}
            required
          />
        </div>

        {/* Product Items Table Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h2 className="text-base font-bold text-white">2. Add Line Products</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>
              <Plus className="w-4 h-4 mr-1" /> Add Product Row
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const selectedProduct = item.product;
              const isInsufficient = selectedProduct && item.quantity > selectedProduct.currentStock;
              const lineTotal = (selectedProduct?.unitPrice || 0) * item.quantity;

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 items-center"
                >
                  <div className="sm:col-span-5">
                    <Select
                      label={`Product Item #${idx + 1}`}
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      placeholder="Select SKU item..."
                      options={products.map((p) => ({
                        label: `${p.name} (${p.sku})`,
                        value: p.id,
                      }))}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 text-xs">
                    <p className="font-semibold text-zinc-400 uppercase">Available Stock</p>
                    <p className={`font-bold mt-1 ${isInsufficient ? 'text-rose-400 font-extrabold' : 'text-zinc-200'}`}>
                      {selectedProduct ? `${selectedProduct.currentStock} units` : '-'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 text-xs">
                    <p className="font-semibold text-zinc-400 uppercase">Line Total</p>
                    <p className="font-extrabold text-cyan-400 text-sm mt-1">
                      ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isInsufficient && (
                    <div className="sm:col-span-12 text-xs text-rose-400 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Note: Requested quantity ({item.quantity}) exceeds available stock ({selectedProduct.currentStock}). Challan can be saved as DRAFT, but confirmation will be rejected.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculation Summary & Submit */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md">
          <div>
            <p className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Order Summary</p>
            <div className="flex items-center gap-6 mt-1">
              <div>
                <span className="text-xs text-zinc-400">Total Quantity:</span>{' '}
                <span className="font-bold text-white">{grandTotalQuantity} units</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400">Total Amount:</span>{' '}
                <span className="font-extrabold text-xl text-cyan-400">
                  ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/challans">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={submitting}>
              Save as Draft Challan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
