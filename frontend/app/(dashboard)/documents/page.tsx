'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DocumentItem { id: number; employee_id: number; employee_name: string; title: string; file_url: string; file_type: string; file_size: number; created_at: string; }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('hrms_user') || '{}') : null;
  const isAdmin = user?.role === 'admin';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try {
      const qs = isAdmin ? '' : `?employee_id=${user?.employee_id || 0}`;
      const res = await api.get(`/documents${qs}`);
      setDocuments(res.data.data || []);
    } catch {
      toast.error('Failed to load documents');
      setDocuments([]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!user?.employee_id) { toast.error('Employee ID unavailable'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('employee_id', String(user.employee_id));
      form.append('title', title || file.name);
      await api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded');
      setTitle(''); setFile(null);
      loadDocs();
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
        <h1 className="text-xl font-bold text-gray-800">Document Management</h1>
        <span className="text-sm text-gray-500">{isAdmin ? 'Admin: viewing all documents' : 'Employee area: upload & view your resumes and docs'}</span>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Upload Document / Resume</h2>
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={handleUpload}>
          <input type="text" className="form-input" placeholder="Document title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
          <input type="file" className="form-input" onChange={e => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx,.txt" />
          <button type="submit" disabled={loading} className="btn-yellow">
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Saved Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {isAdmin && <th className="text-left px-2 py-2">Employee</th>}
                <th className="text-left px-2 py-2">Title</th>
                <th className="text-left px-2 py-2">Type</th>
                <th className="text-left px-2 py-2">Size</th>
                <th className="text-left px-2 py-2">Uploaded</th>
                <th className="text-left px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t">
                  {isAdmin && <td className="px-2 py-2">{doc.employee_name || doc.employee_id}</td>}
                  <td className="px-2 py-2">{doc.title}</td>
                  <td className="px-2 py-2">{doc.file_type || 'n/a'}</td>
                  <td className="px-2 py-2">{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '-'}</td>
                  <td className="px-2 py-2">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-2 py-2">
                    <button className="text-blue-600 hover:underline" onClick={() => download(doc.file_url)}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
