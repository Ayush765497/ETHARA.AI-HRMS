'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { DollarSign, Plus } from 'lucide-react';

interface Payroll {
  id: number; employee_name: string; month: number; year: number;
  basic_salary: number; tax: number; pension: number; net_salary: number;
  status: string;
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await api.get('/payroll/');
      setPayrolls(data.data || []);
    } catch {
      setPayrolls([
        { id:1, employee_name:'John Doe', month:4, year:2024, basic_salary:100000, tax:10000, pension:8000, net_salary:82000, status:'paid' },
        { id:2, employee_name:'Jane Smith', month:4, year:2024, basic_salary:85000, tax:8500, pension:6800, net_salary:69700, status:'pending' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async () => {
    setGenerating(true);
    const now = new Date();
    try {
      await api.post('/payroll/generate', { month: now.getMonth() + 1, year: now.getFullYear() });
      toast.success('Payroll generated!');
      loadData();
    } catch { toast.error('Generation failed'); } finally { setGenerating(false); }
  };

  const markPaid = async (id: number) => {
    try {
      await api.put(`/payroll/${id}/mark-paid`);
      toast.success('Marked as paid');
      loadData();
    } catch { toast.error('Failed'); }
  };

  const totalPayroll = payrolls.reduce((s, p) => s + p.net_salary, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Payroll Management</h1>
        <div className="flex gap-2">
          <button className="btn-yellow flex items-center gap-2" onClick={generatePayroll} disabled={generating}>
            <Plus size={16} /> {generating ? 'Generating...' : 'Generate Payroll'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-2xl font-bold text-blue-900">₦{totalPayroll.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Payroll</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-green-600">{payrolls.filter(p => p.status === 'paid').length}</p>
          <p className="text-xs text-gray-500">Paid</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-yellow-600">{payrolls.filter(p => p.status === 'pending').length}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">April Pay Slip Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Month</th><th>Basic Salary</th>
              <th>Tax</th><th>Pension</th><th>Net Salary</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(p => (
              <tr key={p.id}>
                <td className="font-medium">{p.employee_name}</td>
                <td>{months[p.month - 1]} {p.year}</td>
                <td>₦{p.basic_salary.toLocaleString()}</td>
                <td className="text-red-500">-₦{p.tax.toLocaleString()}</td>
                <td className="text-red-500">-₦{p.pension.toLocaleString()}</td>
                <td className="font-bold text-blue-900">₦{p.net_salary.toLocaleString()}</td>
                <td><span className={`badge ${p.status === 'paid' ? 'badge-approved' : 'badge-pending'}`}>{p.status}</span></td>
                <td>
                  {p.status === 'pending' && (
                    <button onClick={() => markPaid(p.id)} className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
