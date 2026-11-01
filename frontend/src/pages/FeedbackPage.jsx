import { useState } from 'react';
import api from '../services/api';
import useRemote from '../hooks/useRemote';
import { Empty, Loading, Toast } from '../components/Ui';
import { useAuth } from '../context/AuthContext';

export default function FeedbackPage() {
  const { user } = useAuth(); const { data, loading, error, reload } = useRemote(user.role === 'admin' ? '/feedback?limit=100' : '/requests?limit=100'); const [message, setMessage] = useState(''); const [rating, setRating] = useState(5); const [request, setRequest] = useState(''); const [toast, setToast] = useState('');
  async function submit(event) { event.preventDefault(); try { await api.post('/feedback', { message, rating, request: request || undefined }); setMessage(''); setRating(5); setRequest(''); setToast('Feedback submitted. Thank you.'); } catch (e) { setToast(e.response?.data?.message || 'Unable to submit feedback.'); } }
  if (loading) return <Loading />; if (error) return <p className="error-message">{error}</p>;
  if (user.role === 'admin') return <><section className="page-heading"><div><h1>Student feedback</h1><p>Feedback submitted through Campus Service Hub.</p></div></section><section className="table-panel"><table><thead><tr><th>Student</th><th>Rating</th><th>Feedback</th><th>Request</th></tr></thead><tbody>{data.feedback.map((item) => <tr key={item._id}><td>{item.student?.name}<small>{item.student?.email}</small></td><td>{item.rating}/5</td><td className="wide-cell">{item.message}</td><td>{item.request?.title || 'General'}</td></tr>)}</tbody></table>{!data.feedback.length && <Empty title="No feedback received" detail="Student feedback will appear here." />}</section></>;
  return <><section className="page-heading"><div><h1>Share feedback</h1><p>Help improve the way campus services work.</p></div></section><section className="panel feedback-form"><form onSubmit={submit}><label>Rating<select value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map((item) => <option value={item} key={item}>{item} / 5</option>)}</select></label><label>Related request <select value={request} onChange={(e) => setRequest(e.target.value)}><option value="">General feedback</option>{data.requests.map((item) => <option value={item._id} key={item._id}>{item.title}</option>)}</select></label><label>Feedback<textarea required value={message} onChange={(e) => setMessage(e.target.value)} /></label><button className="button button-primary">Send feedback</button></form></section><Toast message={toast} onClose={() => setToast('')} /></>;
}
