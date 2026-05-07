'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Edit } from 'lucide-react';

const TABS = ['Personal Details', 'Contact Details', 'Next of kin Details',
  'Education Qualifications', 'Guarantor Details', 'Family Details', 'Job Details', 'Financial Details'];

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const [emp, setEmp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      setEmp(data.data);
      setForm(data.data);
    } catch {
      setEmp({ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@company.com',
        job_title: 'UI / UX Designer', department: 'Design & Marketing', job_category: 'Full time',
        phone_number: '099344434', city: 'Addis Ababa', residential_address: 'Alembank, Addis Ababa',
        guarantor_name: 'Birhanu alemu', guarantor_occupation: 'Accountant', guarantor_phone: '09345545455' });
      setForm({ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@company.com' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/employees/${id}`, form);
      toast.success('Updated successfully');
      setEditing(false);
      loadEmployee();
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const renderTab = () => {
    const inputClass = editing ? 'form-input' : 'form-input bg-gray-100 cursor-not-allowed';
    const props = (field: string) => ({
      className: inputClass,
      value: form[field] || '',
      onChange: (e: any) => setForm({ ...form, [field]: e.target.value }),
      disabled: !editing
    });

    switch (activeTab) {
      case 0: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">First Name</label><input {...props('first_name')} /></div>
          <div><label className="form-label">Last Name</label><input {...props('last_name')} /></div>
          <div><label className="form-label">Job Title</label><input {...props('job_title')} /></div>
          <div><label className="form-label">Date of Birth</label><input type="date" {...props('date_of_birth')} /></div>
          <div><label className="form-label">Gender</label>
            <select className={inputClass} value={form.gender||''} onChange={e=>setForm({...form,gender:e.target.value})} disabled={!editing}>
              <option value="">Select</option><option>Male</option><option>Female</option>
            </select>
          </div>
          <div><label className="form-label">Employment Date</label><input type="date" {...props('employment_date')} /></div>
        </div>
      );
      case 1: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Phone Number 1</label><input {...props('phone_number')} /></div>
          <div><label className="form-label">Phone Number 2</label><input {...props('phone_number_2')} /></div>
          <div className="col-span-2"><label className="form-label">E-mail Address</label><input {...props('email')} /></div>
          <div><label className="form-label">City of residence</label><input {...props('city')} /></div>
          <div className="col-span-2"><label className="form-label">Residential Address</label>
            <textarea className={inputClass} value={form.residential_address||''} rows={3}
              onChange={e=>setForm({...form,residential_address:e.target.value})} disabled={!editing} /></div>
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Next of Kin Name</label><input {...props('next_of_kin_name')} /></div>
          <div><label className="form-label">Phone</label><input {...props('next_of_kin_phone')} /></div>
          <div><label className="form-label">Relationship</label><input {...props('next_of_kin_relationship')} /></div>
        </div>
      );
      case 3: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Highest Qualification</label><input {...props('highest_qualification')} /></div>
          <div><label className="form-label">Institution</label><input {...props('institution')} /></div>
          <div><label className="form-label">Graduation Year</label><input type="number" {...props('graduation_year')} /></div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">View Guarantor Details</h3>
          <div><label className="form-label">Guarantor&apos;s Name</label><input {...props('guarantor_name')} /></div>
          <div><label className="form-label">Job title / Occupation</label><input {...props('guarantor_occupation')} /></div>
          <div><label className="form-label">Phone No</label><input {...props('guarantor_phone')} /></div>
        </div>
      );
      case 5: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Marital Status</label>
            <select className={inputClass} value={form.marital_status||''} onChange={e=>setForm({...form,marital_status:e.target.value})} disabled={!editing}>
              <option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option>
            </select>
          </div>
          <div><label className="form-label">Spouse Name</label><input {...props('spouse_name')} /></div>
          <div><label className="form-label">Number of Children</label><input type="number" {...props('number_of_children')} /></div>
        </div>
      );
      case 6: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Job Title</label><input {...props('job_title')} /></div>
          <div><label className="form-label">Job Category</label>
            <select className={inputClass} value={form.job_category||''} onChange={e=>setForm({...form,job_category:e.target.value})} disabled={!editing}>
              <option>Full time</option><option>Part time</option><option>Contract</option>
            </select>
          </div>
          <div><label className="form-label">Salary</label><input type="number" {...props('salary')} /></div>
        </div>
      );
      case 7: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Bank Name</label><input {...props('bank_name')} /></div>
          <div><label className="form-label">Account Number</label><input {...props('account_number')} /></div>
          <div className="col-span-2"><label className="form-label">Account Name</label><input {...props('account_name')} /></div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        Employee Mgmt / Employee Profile / <span className="font-semibold text-gray-700">{emp?.first_name} {emp?.last_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tab sidebar */}
        <div className="card flex flex-col gap-2">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition ${
                activeTab === i ? 'bg-yellow-400 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Avatar + info card */}
          <div className="card flex flex-col items-center gap-3 relative">
            <button onClick={() => setEditing(!editing)}
              className="absolute top-4 right-4 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              <Edit size={15} /> Edit
            </button>
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 text-3xl font-bold">
              {emp?.first_name?.[0]}
            </div>
            <p className="text-lg font-bold text-gray-800">{emp?.first_name} {emp?.last_name}</p>
            <p className="text-sm text-gray-500">{emp?.department}</p>
            <div className="grid grid-cols-2 gap-4 w-full mt-2 text-center">
              <div>
                <p className="text-xs text-gray-400">Job Title</p>
                <p className="font-semibold text-gray-700">{emp?.job_title || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Job Category</p>
                <p className="font-semibold text-gray-700">{emp?.job_category || '—'}</p>
              </div>
            </div>
          </div>

          {/* Tab form */}
          <div className="card">
            {renderTab()}
            {editing && (
              <div className="flex gap-3 mt-6">
                <button onClick={handleUpdate} className="btn-green">Update</button>
                <button onClick={() => setEditing(false)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
