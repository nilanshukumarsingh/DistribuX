import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, KeyRound, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ErrorAlert } from '../components/ui/ErrorAlert';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-600/30 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">DistribuX</h2>
          <p className="text-sm text-slate-400 mt-1">Wholesale & Distribution Operations Management</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sign In to Your Account</h3>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-2.5" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-brand-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Demo Role Login:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTestRole('admin@company.com', 'Admin123!')}
                className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100 transition-colors text-left"
              >
                🔑 Admin Role
              </button>
              <button
                type="button"
                onClick={() => setTestRole('sales@company.com', 'Sales123!')}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors text-left"
              >
                💼 Sales Role
              </button>
              <button
                type="button"
                onClick={() => setTestRole('warehouse@company.com', 'Warehouse123!')}
                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors text-left"
              >
                📦 Warehouse Role
              </button>
              <button
                type="button"
                onClick={() => setTestRole('accounts@company.com', 'Accounts123!')}
                className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors text-left"
              >
                📊 Accounts Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
