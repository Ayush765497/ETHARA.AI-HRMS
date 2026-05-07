'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { GraduationCap, Play, Plus, Clock, X } from 'lucide-react';

interface Course {
  id: number; title: string; description: string; category: string;
  duration_hours: number; instructor: string; thumbnail?: string;
}
interface Enrollment {
  id: number; course_id: number; progress: number; status: string;
}

function CourseModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', duration_hours: '', instructor: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/courses/', form); toast.success('Course created!'); onSaved(); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">Add New Course</h2><button onClick={onClose}><X size={18} className="text-gray-400" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Course Title</label><input className="form-input" value={form.title} onChange={f('title')} required /></div>
          <div><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={f('description')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={f('category')} /></div>
            <div><label className="form-label">Duration (hours)</label><input type="number" className="form-input" value={form.duration_hours} onChange={f('duration_hours')} /></div>
          </div>
          <div><label className="form-label">Instructor</label><input className="form-input" value={form.instructor} onChange={f('instructor')} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Creating...' : 'Create Course'}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const COURSE_COLORS = ['#1e3a5f', '#1e5f3a', '#5f1e3a', '#5f3a1e', '#1e3a5f'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState('Courses');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([api.get('/courses/'), api.get('/courses/enrollments?employee_id=1')]);
      setCourses(cRes.data.data || []);
      setEnrollments(eRes.data.data || []);
    } catch {
      setCourses([
        { id:1, title:'Advanced Microsoft Excel', description:'Master Excel formulas, pivot tables, and data analysis', category:'Technology', duration_hours:24, instructor:'John Smith' },
        { id:2, title:'Leadership & Management', description:'Effective leadership strategies for team leads and managers', category:'Management', duration_hours:16, instructor:'Dr. Ada Okafor' },
        { id:3, title:'Communication Skills', description:'Professional communication in the workplace', category:'Soft Skills', duration_hours:8, instructor:'Mary Johnson' },
        { id:4, title:'Project Management (PMP)', description:'Essential project management methodologies', category:'Management', duration_hours:40, instructor:'Ahmed Hassan' },
      ]);
      setEnrollments([
        { id:1, course_id:1, progress:65, status:'enrolled' },
        { id:2, course_id:3, progress:100, status:'completed' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const enroll = async (courseId: number) => {
    try {
      await api.post('/courses/enroll', { course_id: courseId, employee_id: 1 });
      toast.success('Enrolled!'); loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Already enrolled or failed');
    }
  };

  const isEnrolled = (courseId: number) => enrollments.some(e => e.course_id === courseId);
  const getEnrollment = (courseId: number) => enrollments.find(e => e.course_id === courseId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Learning Management System</h1>
        <button className="btn-yellow flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-2xl font-bold text-blue-900">{courses.length}</p><p className="text-xs text-gray-500">Available Courses</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-yellow-600">{enrollments.filter(e=>e.status==='enrolled').length}</p><p className="text-xs text-gray-500">Enrolled</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-green-600">{enrollments.filter(e=>e.status==='completed').length}</p><p className="text-xs text-gray-500">Completed</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['Courses', 'My Learning'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === t ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course, idx) => {
            const enrolled = isEnrolled(course.id);
            const enrollment = getEnrollment(course.id);
            return (
              <div key={course.id} className="card overflow-hidden hover:shadow-md transition">
                <div className="h-24 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `linear-gradient(135deg, ${COURSE_COLORS[idx % COURSE_COLORS.length]}, #2d5986)` }}>
                  <GraduationCap size={36} className="text-white/80" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{course.category}</span>
                  <h3 className="font-bold text-gray-800 mt-2 text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.duration_hours}h</span>
                    <span>{course.instructor}</span>
                  </div>
                  {enrolled && enrollment && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-blue-700">{enrollment.progress}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => !enrolled && enroll(course.id)}
                    className={`w-full mt-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                      enrolled
                        ? enrollment?.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        : 'btn-primary'
                    }`}>
                    {enrolled
                      ? enrollment?.status === 'completed' ? '✓ Completed' : <><Play size={13} /> Continue</>
                      : 'Enroll Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'My Learning' && (
        <div className="space-y-3">
          {enrollments.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              No courses enrolled yet. Enroll in a course to get started.
            </div>
          ) : enrollments.map(e => {
            const course = courses.find(c => c.id === e.course_id);
            if (!course) return null;
            return (
              <div key={e.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5986)' }}>
                  <GraduationCap size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{course.title}</h3>
                  <p className="text-xs text-gray-400">{course.instructor}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${e.progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-blue-700">{e.progress}%</span>
                  </div>
                </div>
                <span className={`badge ${e.status === 'completed' ? 'badge-approved' : 'badge-pending'}`}>
                  {e.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CourseModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadData(); }} />}
    </div>
  );
}
