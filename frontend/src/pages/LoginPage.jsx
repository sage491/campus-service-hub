import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, authenticate } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  async function signIn(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    try { await authenticate('/auth/login', { email, password }); }
    catch (error) { setStatus(error.response?.data?.message || 'Unable to sign in. Please try again.'); }
    finally { setIsSubmitting(false); }
  }

  return (
    <section className="auth-panel">
      <p className="eyebrow">CAMPUS ACCESS</p>
      <h1>Sign in</h1>
      <p>Use your Campus Service Hub account to continue.</p>
      <form onSubmit={signIn}>
        <label htmlFor="email">University email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@cumail.in" required autoComplete="email" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8" autoComplete="current-password" />
        <button className="button button-primary" type="submit" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {status && <p className="form-status" role="alert">{status}</p>}
      <p className="auth-link">New student? <Link to="/register">Create your account</Link></p>
    </section>
  );
}
