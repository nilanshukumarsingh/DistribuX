import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import api from '../../api/client';
import { DashboardStats } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Badge } from '../../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Fetching live operational statistics..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchStats} />;
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      subtitle: `${stats.activeCustomers} Active Accounts`,
      icon: Users,
      color: 'bg-blue-500 text-white',
      link: '/customers',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subtitle: 'Catalog Items',
      icon: Package,
      color: 'bg-indigo-500 text-white',
      link: '/products',
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProductsCount,
      subtitle: 'Needs replenishment',
      icon: AlertTriangle,
      color: stats.lowStockProductsCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-500 text-white',
      link: '/products?lowStock=true',
    },
    {
      title: 'Draft Challans',
      value: stats.draftChallans,
      subtitle: 'Pending confirmation',
      icon: FileSpreadsheet,
      color: 'bg-sky-500 text-white',
      link: '/challans?status=DRAFT',
    },
    {
      title: 'Confirmed Challans',
      value: stats.confirmedChallans,
      subtitle: 'Stock Deducted',
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white',
      link: '/challans?status=CONFIRMED',
    },
  ];

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Operations Dashboard</h1>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Real-time overview of inventory, sales challans, and CRM status.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl transition-all duration-200 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:-translate-y-0.5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all" />
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{card.value}</h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">{card.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid: Stock Movements & Followups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Stock Movements */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Recent Stock Movements</h2>
            </div>
            <Link to="/inventory" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentMovements.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No recent stock movements found.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {stats.recentMovements.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-bold text-zinc-100">{mov.product?.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      SKU: <span className="font-mono text-zinc-300">{mov.product?.sku}</span> • {mov.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 text-xs font-extrabold rounded-lg ${
                      mov.type === 'IN' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}>
                      {mov.type === 'IN' ? `+${mov.quantityChanged} IN` : `-${mov.quantityChanged} OUT`}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Customer Follow-ups */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Upcoming CRM Follow-ups</h2>
            </div>
            <Link to="/customers" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              View Customers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.upcomingFollowups.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No scheduled follow-ups pending.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {stats.upcomingFollowups.map((cust) => (
                <div key={cust.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link to={`/customers/${cust.id}`} className="text-sm font-bold text-zinc-100 hover:text-cyan-400 transition-colors">
                      {cust.name} ({cust.businessName})
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">Mobile: {cust.mobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-purple-950 text-purple-300 border border-purple-500/40">
                      {cust.followupDate ? new Date(cust.followupDate).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
