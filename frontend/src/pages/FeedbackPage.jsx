import { useState } from 'react';
import api from '../services/api';
import useRemote from '../hooks/useRemote';
import { Empty, Loading, Toast } from '../components/Ui';
import { useAuth } from '../context/AuthContext';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { data, loading, error } = useRemote(user.role === 'admin' ? '/feedback?limit=100' : '/requests?limit=100');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [request, setRequest] = useState('');
  const [toast, setToast] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/feedback', { message, rating, request: request || undefined });
      setMessage(''); setRating(5); setRequest('');
      setToast('Feedback submitted. Thank you.');
    } catch (e) { setToast(e.response?.data?.message || 'Unable to submit feedback.'); }
  }

  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  if (user.role === 'admin') {
    return (
      <>
        <section className="page-heading">
          <div>
            <h1>Student feedback</h1>
            <p>Feedback submitted through Campus Service Hub.</p>
          </div>
        </section>
        <section className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Request</th>
              </tr>
            </thead>
            <tbody>
              {data.feedback.map((item) => (
                <tr key={item._id}>
                  <td>{item.student?.name}<small>{item.student?.email}</small></td>
                  <td>
                    <span style={{ fontWeight: 700, color: item.rating >= 4 ? 'var(--teal-700)' : item.rating <= 2 ? '#b91c1c' : 'var(--slate-700)' }}>
                      {item.rating}/5
                    </span>
                  </td>
                  <td className="wide-cell">{item.message}</td>
                  <td>{item.request?.title || <span style={{ color: 'var(--slate-400)' }}>General</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.feedback.length && <Empty title="No feedback received" detail="Student feedback will appear here." />}
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Share feedback</h1>
          <p>Help improve the way campus services work.</p>
        </div>
      </section>
      <section className="panel feedback-form">
        <form onSubmit={submit} className="form-grid">
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option value={n} key={n}>{n} / 5</option>)}
            </select>
          </label>
          <label>
            Related request
            <select value={request} onChange={(e) => setRequest(e.target.value)}>
              <option value="">General feedback</option>
              {data.requests.map((r) => <option value={r._id} key={r._id}>{r.title}</option>)}
            </select>
          </label>
          <label className="full-width">
            Your feedback
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about your experience…" />
          </label>
          <div className="full-width">
            <button className="button button-primary">Send feedback</button>
          </div>
        </form>
      </section>
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
