import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { user, authenticate } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function updateField(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function register(event) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try { await authenticate('/auth/register', form); }
    catch (error) { setMessage(error.response?.data?.message || 'Unable to create your account.'); }
    finally { setIsSubmitting(false); }
  }

  return (
    <section className="auth-panel">
      <p className="eyebrow">STUDENT REGISTRATION</p>
      <h1>Create account</h1>
      <p>Student accounts are created here. Faculty and administrator accounts are provisioned securely.</p>
      <form onSubmit={register}>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" value={form.name} onChange={updateField} required maxLength="80" autoComplete="name" />
        <label htmlFor="email">University email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" />
        <label htmlFor="studentId">Student ID <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span></label>
        <input id="studentId" name="studentId" value={form.studentId} onChange={updateField} maxLength="40" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={updateField} required minLength="8" autoComplete="new-password" />
        <button className="button button-primary" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
          {isSubmitting ? 'Creating account…' : 'Create student account'}
        </button>
      </form>
      {message && <p className="form-status" role="alert">{message}</p>}
      <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
    </section>
  );
}
