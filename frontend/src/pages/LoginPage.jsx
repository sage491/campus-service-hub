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
    try {
      await authenticate('/auth/login', { email, password });
    } catch (error) { setStatus(error.response?.data?.message || 'Unable to sign in. Please try again.'); } finally { setIsSubmitting(false); }
  }

  return (
    <section className="auth-panel">
      <p className="eyebrow">CAMPUS ACCESS</p>
      <h1>Sign in</h1>
      <p>Use your Campus Service Hub account to continue.</p>
      <form onSubmit={signIn}>
        <label htmlFor="email">University email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@cumail.in" required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="8" />
        <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
      </form>
      {status && <p className="form-status" role="status">{status}</p>}
      <p className="auth-link">New student? <Link to="/register">Create your account</Link></p>
    </section>
  );
}
