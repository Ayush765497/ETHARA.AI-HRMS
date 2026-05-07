'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      const token = data?.data?.token;
      const user = data?.data?.user;
      if (!token) throw new Error('No token received');
      localStorage.setItem('hrms_token', token);
      localStorage.setItem('hrms_user', JSON.stringify(user));
      toast.success('Welcome back!');
      const destination = user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      router.push(destination);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'admin@xceltech.com', password: 'admin123' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-black text-sm">X</span>
            </div>
            <span className="font-bold text-blue-900 text-xl tracking-wide">Next AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Login</h1>
          <p className="text-gray-500 text-sm mb-8">Login to your account.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label" style={{ color: '#1e3a5f' }}>E-mail Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label" style={{ color: '#1e3a5f' }}>Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">Reset Password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-yellow w-full py-3 text-base font-bold rounded-lg disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-700 font-semibold hover:underline">
              Join Next AI today.
            </Link>
          </p>
          {/* Demo credentials */}
          <button
            onClick={fillDemo}
            className="mt-5 w-full p-3 bg-blue-50 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition text-left border border-blue-100"
          >
            <strong>Demo credentials</strong> (click to fill): admin@xceltech.com / admin123
          </button>
        </div>
      </div>

      {/* Right - Hero */}
      <div
        className="hidden lg:flex flex-1 items-end justify-start p-12"
        style={{ background: 'linear-gradient(135deg, #0f1b2d 0%, #1e3a5f 60%, #2d5986 100%)' }}
      >
        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Manage all{' '}
            <span style={{ color: '#f5a623' }}>HR Operations</span>{' '}
            from the comfort of your home.
          </h2>
          <p className="text-blue-200 text-base">
            Employees, payroll, leave management, performance — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
