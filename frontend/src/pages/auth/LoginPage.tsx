import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, KeyRound, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setTestRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-cyan-400 shadow-xl shadow-cyan-500/10 mb-3 border border-cyan-500/40 p-2 backdrop-blur-md">
            <img src="/logo.png" alt="Distribora Icon" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Distribora</h2>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-medium">
            Wholesale & Distribution ERP Portal
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900/90 p-8 shadow-2xl border border-zinc-800 backdrop-blur-md">
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Sign In to Your Account</h3>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <Button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Quick Demo Role Login:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTestRole('admin@company.com', 'Admin123!')}
                className="rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-900/50 hover:border-purple-500/60 transition-all text-left flex items-center gap-1.5"
              >
                <span>🔑</span> Admin Role
              </button>
              <button
                type="button"
                onClick={() => setTestRole('sales@company.com', 'Sales123!')}
                className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500/60 transition-all text-left flex items-center gap-1.5"
              >
                <span>💼</span> Sales Role
              </button>
              <button
                type="button"
                onClick={() => setTestRole('warehouse@company.com', 'Warehouse123!')}
                className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 hover:border-amber-500/60 transition-all text-left flex items-center gap-1.5"
              >
                <span>📦</span> Warehouse Role
              </button>
              <button
                type="button"
                onClick={() => setTestRole('accounts@company.com', 'Accounts123!')}
                className="rounded-xl border border-sky-500/30 bg-sky-950/40 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/50 hover:border-sky-500/60 transition-all text-left flex items-center gap-1.5"
              >
                <span>📊</span> Accounts Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
