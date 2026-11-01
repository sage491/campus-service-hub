import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name); setStudentId(user.studentId || ''); }
  }, [user]);

  if (isLoading) return <p>Loading account…</p>;
  if (!user) return <Navigate to="/login" replace />;

  async function saveProfile(event) {
    event.preventDefault(); setMessage(''); setIsSaving(true);
    try { await updateProfile({ name, studentId }); setMessage('Profile saved.'); } catch (error) { setMessage(error.response?.data?.message || 'Unable to save your profile.'); } finally { setIsSaving(false); }
  }

  return <section className="auth-panel"><p className="eyebrow">YOUR PROFILE</p><h1>{user.name}</h1><p>{user.email}</p><dl className="profile-list"><div><dt>Role</dt><dd>{user.role}</dd></div><div><dt>Department</dt><dd>{user.department?.name || 'Not assigned'}</dd></div></dl><form onSubmit={saveProfile}><label htmlFor="profile-name">Full name</label><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength="80" /><label htmlFor="profile-student-id">Student ID</label><input id="profile-student-id" value={studentId} onChange={(event) => setStudentId(event.target.value)} maxLength="40" /><button className="button button-primary" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save profile'}</button></form>{message && <p className="form-status" role="status">{message}</p>}</section>;
}
