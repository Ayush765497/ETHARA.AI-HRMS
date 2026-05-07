'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the Terms & Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      const token = data?.data?.token;
      const user = data?.data?.user;
      if (!token) throw new Error('No token received');
      localStorage.setItem('hrms_token', token);
      localStorage.setItem('hrms_user', JSON.stringify(user));
      toast.success('Account created! Welcome to ETHARA.AI.');
      router.push('/employee/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero */}
      <div
        className="hidden lg:flex flex-col justify-center p-12 w-5/12"
        style={{ background: 'linear-gradient(135deg, #0f1b2d 0%, #1e3a5f 100%)' }}
      >
        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-blue-900 font-black text-sm">E</span>
          </div>
          <span className="font-bold text-white text-xl tracking-wide">ETHARA.AI</span>
        </div>
        <h2 className="text-white text-4xl font-bold leading-tight mb-4">HR Management Platform</h2>
        <div className="w-12 h-1 mb-4 rounded" style={{ background: '#f5a623' }} />
        <p className="text-blue-200 text-base leading-relaxed mb-8">
          Manage all employees, payrolls, and other human resource operations.
        </p>
        <div className="flex gap-3">
          <button className="btn-yellow px-6 py-3 rounded-lg font-semibold">Learn More</button>
          <button className="px-6 py-3 rounded-lg font-semibold border border-white/30 text-white hover:bg-white/10 transition">
            Our Features
          </button>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-10">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold text-blue-900 mb-1">Welcome to ETHARA.AI</h1>
          <p className="text-gray-500 text-sm mb-8">Register your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label" style={{ color: '#1e3a5f' }}>Full Name</label>
              <input
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={f('name')}
                autoComplete="name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" style={{ color: '#1e3a5f' }}>E-mail Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={f('email')}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="form-label" style={{ color: '#1e3a5f' }}>Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="+1234567890"
                  value={form.phone}
                  onChange={f('phone')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" style={{ color: '#1e3a5f' }}>Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={f('password')}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="form-label" style={{ color: '#1e3a5f' }}>Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm_password}
                  onChange={f('confirm_password')}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded mt-0.5"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              I agree to all the{' '}
              <a href="#" className="text-blue-600 underline">Terms &amp; Privacy Policy</a>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-bold text-base rounded-lg disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-700 font-semibold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
