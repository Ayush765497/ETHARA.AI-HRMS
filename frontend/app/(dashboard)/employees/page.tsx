'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  job_category: string;
  phone_number: string;
  is_deleted: boolean;
  city?: string;
  date_of_birth?: string;
  gender?: string;
  residential_address?: string;
  employment_date?: string;
  salary?: number;
  next_of_kin_name?: string;
}

interface Department { id: number; name: string; }

function EmployeeModal({ emp, departments, onClose, onSaved }:
  { emp: Employee | null; departments: Department[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    first_name: emp?.first_name || '', last_name: emp?.last_name || '',
    email: emp?.email || '', phone_number: emp?.phone_number || '',
    job_title: emp?.job_title || '', job_category: emp?.job_category || 'Full time',
    department_id: '', salary: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (emp) {
        await api.put(`/employees/${emp.id}`, form);
        toast.success('Employee updated');
      } else {
        await api.post('/employees/', form);
        toast.success('Employee added');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving employee');
    } finally {
      setLoading(false);
    }
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="text-lg font-bold mb-5 text-gray-800">{emp ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">First Name</label>
              <input className="form-input" value={form.first_name} onChange={f('first_name')} required />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.last_name} onChange={f('last_name')} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={f('email')} required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone_number} onChange={f('phone_number')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Job Title</label>
              <input className="form-input" value={form.job_title} onChange={f('job_title')} />
            </div>
            <div>
              <label className="form-label">Department</label>
              <select className="form-input" value={form.department_id} onChange={f('department_id')}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Job Category</label>
              <select className="form-input" value={form.job_category} onChange={f('job_category')}>
                <option>Full time</option><option>Part time</option><option>Contract</option>
              </select>
            </div>
            <div>
              <label className="form-label">Salary</label>
              <input className="form-input" type="number" value={form.salary} onChange={f('salary')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Saving...' : emp ? 'Update' : 'Add Employee'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeRecord, setEmployeeRecord] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [user, setUser] = useState<{ role?: string; employee_id?: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);

    if (!parsed || !parsed.role) {
      toast.error('Unauthorized access');
      router.push('/login');
      return;
    }

    if (parsed.role === 'admin') {
      loadAdminData();
      return;
    }

    if (parsed.role === 'employee') {
      if (!parsed.employee_id) {
        toast.error('No employee profile found for this account');
        router.push('/employee/dashboard');
        return;
      }
      loadEmployeeData(parsed.employee_id);
      return;
    }

    toast.error('Access denied');
    router.push('/login');
  }, [router]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees/?page=1&per_page=50'),
        api.get('/employees/departments')
      ]);
      setEmployees(empRes.data.data.employees || []);
      setDepartments(deptRes.data.data || []);
    } catch {
      console.log('Failed to load employees, using mock data');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeData = async (employeeId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/employees/${employeeId}`);
      setEmployeeRecord(res.data.data);
    } catch {
      toast.error('Unable to load your employee profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Soft-delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee removed');
      loadAdminData();
    } catch {
      toast.error('Error deleting employee');
    }
  };

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-sm text-gray-500">
            {user?.role === 'admin'
              ? `${employees.length} employees total`
              : 'Your employee profile'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-yellow flex items-center gap-2" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      <div className="card">
        {user?.role === 'admin' ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="form-input pl-9" placeholder="Search employees..." value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <p className="text-gray-400 text-sm py-8 text-center">Loading employees...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Job Title</th>
                    <th>Department</th><th>Category</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                            {emp.first_name[0]}
                          </div>
                          <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                        </div>
                      </td>
                      <td className="text-gray-500">{emp.email}</td>
                      <td>{emp.job_title}</td>
                      <td>{emp.department}</td>
                      <td>
                        <span className="badge badge-active">{emp.job_category}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={`/employees/${emp.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                            <Eye size={13} />
                          </Link>
                          <button onClick={() => { setEditing(emp); setShowModal(true); }}
                            className="w-7 h-7 flex items-center justify-center rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDelete(emp.id)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-8">No employees found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <p className="text-gray-400 text-sm py-8 text-center">Loading profile...</p>
            ) : employeeRecord ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                        {employeeRecord.first_name?.[0] || ''}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{employeeRecord.first_name} {employeeRecord.last_name}</h2>
                        <p className="text-sm text-gray-500">{employeeRecord.job_title || 'Employee'}</p>
                        <p className="text-sm text-gray-500">{employeeRecord.department || 'No department assigned'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div><span className="font-semibold text-gray-800">Email:</span> {employeeRecord.email}</div>
                      <div><span className="font-semibold text-gray-800">Phone:</span> {employeeRecord.phone_number || 'N/A'}</div>
                      <div><span className="font-semibold text-gray-800">Category:</span> {employeeRecord.job_category || 'N/A'}</div>
                      <div><span className="font-semibold text-gray-800">Location:</span> {employeeRecord.city || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Personal Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-semibold text-gray-800">Date of Birth:</span> {employeeRecord.date_of_birth || 'N/A'}</div>
                      <div><span className="font-semibold text-gray-800">Gender:</span> {employeeRecord.gender || 'N/A'}</div>
                      <div><span className="font-semibold text-gray-800">Residential Address:</span> {employeeRecord.residential_address || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Employment Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-semibold text-gray-800">Employment Date:</span> {employeeRecord.employment_date || 'N/A'}</div>
                      <div><span className="font-semibold text-gray-800">Salary:</span> {employeeRecord.salary ? `₦${employeeRecord.salary}` : 'N/A'}</div>
                      <div><span className="font-semibold text-gray-800">Next of Kin:</span> {employeeRecord.next_of_kin_name || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">No employee profile found.</p>
            )}
          </>
        )}
      </div>

      {showModal && user?.role === 'admin' && (
        <EmployeeModal
          emp={editing}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadAdminData(); }}
        />
      )}
    </div>
  );
}
