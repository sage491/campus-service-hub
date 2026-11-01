import { useState } from 'react';
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function checkApi(event) {
    event.preventDefault();
    setStatus('Checking Campus Service Hub…');

    try {
      const { data } = await api.get('/health');
      setStatus(`API is ${data.status}. Sign-in will be added in the authentication milestone.`);
    } catch {
      setStatus('The API is unavailable. Start the backend and try again.');
    }
  }

  return (
    <section className="auth-panel">
      <p className="eyebrow">CAMPUS ACCESS</p>
      <h1>Sign in</h1>
      <p>Authentication is being prepared. Use this page to verify frontend-to-backend communication.</p>
      <form onSubmit={checkApi}>
        <label htmlFor="email">University email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@cumail.in" required />
        <button className="button button-primary" type="submit">Check connection</button>
      </form>
      {status && <p className="form-status" role="status">{status}</p>}
    </section>
  );
}
