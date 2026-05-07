'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ResumeItem { id: number; employee_id: number; employee_name: string; title: string; file_url: string; file_type: string; file_size: number; created_at: string; }

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('hrms_user') || '{}') : null;
  const isAdmin = user?.role === 'admin';

  useEffect(() => { loadResumes(); }, []);

  const loadResumes = async () => {
    try {
      const qs = isAdmin ? '' : `?employee_id=${user?.employee_id || 0}`;
      const res = await api.get(`/documents${qs}`);
      const data = (res.data.data || []).filter((item: ResumeItem) => /resume/i.test(item.title) || /resume/i.test(item.file_type || '')); 
      setResumes(data);
    } catch {
      toast.error('Failed to load resumes');
      setResumes([]);
    }
  };

  const uploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Select a file first'); return; }
    if (!user?.employee_id) { toast.error('Employee info missing'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('employee_id', String(user.employee_id));
      form.append('title', title || `Resume - ${file.name}`);
      await api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded');
      setTitle(''); setFile(null); loadResumes();
    } catch {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const download = (url: string) => window.open(url, '_blank');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Resume Portal</h1>
        <p className="text-sm text-gray-500">{isAdmin ? 'Admin: All employee resumes' : 'Employee: upload your resume'}</p>
      </div>

      {!isAdmin && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Upload Your Resume</h2>
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={uploadResume}>
            <input type="text" className="form-input" placeholder="Resume title" value={title} onChange={e => setTitle(e.target.value)} />
            <input type="file" className="form-input" onChange={e => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx" />
            <button type="submit" disabled={loading} className="btn-yellow">{loading ? 'Uploading…' : 'Upload'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Resumes</h2>
        {resumes.length === 0 ? (<p className="text-gray-500">No resumes found.</p>) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {isAdmin && <th className="text-left px-2 py-2">Employee</th>}
                <th className="text-left px-2 py-2">Title</th>
                <th className="text-left px-2 py-2">Type</th>
                <th className="text-left px-2 py-2">Uploaded</th>
                <th className="text-left px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map(resume => (
                <tr key={resume.id} className="border-t">
                  {isAdmin && <td className="px-2 py-2">{resume.employee_name}</td>}
                  <td className="px-2 py-2">{resume.title}</td>
                  <td className="px-2 py-2">{resume.file_type || 'N/A'}</td>
                  <td className="px-2 py-2">{new Date(resume.created_at).toLocaleDateString()}</td>
                  <td className="px-2 py-2"><button className="text-blue-600 hover:underline" onClick={() => download(resume.file_url)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
