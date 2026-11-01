import { useState } from 'react';
import api from '../services/api';
import useRemote from '../hooks/useRemote';
import { Empty, Loading, Modal, Toast } from '../components/Ui';
import { useAuth } from '../context/AuthContext';

export default function NoticesPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useRemote(`/notices?limit=100${user.role === 'admin' ? '&includeDrafts=true' : ''}`);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');

  async function publish(id) {
    try { await api.patch(`/notices/${id}/publish`); reload(); setToast('Notice published and shared.'); }
    catch (e) { setToast(e.response?.data?.message || 'Unable to publish notice.'); }
  }
  async function remove(id) {
    if (!window.confirm('Remove this notice?')) return;
    try { await api.delete(`/notices/${id}`); reload(); setToast('Notice removed.'); }
    catch (e) { setToast(e.response?.data?.message || 'Unable to remove notice.'); }
  }

  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  const notices = (Array.isArray(data)
    ? data
    : Array.isArray(data?.notices)
      ? data.notices
      : Array.isArray(data?.data?.notices)
        ? data.data.notices
        : []
  ).filter((notice) => notice && typeof notice === 'object' && !Array.isArray(notice));

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Campus notices</h1>
          <p>Updates and information for your campus community.</p>
        </div>
        {user.role === 'admin' && (
          <button className="button button-primary" onClick={() => setModal(true)}>Create notice</button>
        )}
      </section>

      <div className="notice-grid">
        {notices.map((notice) => (
          <article className="notice-card" key={notice._id}>
            <span>{notice.isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
            <h2>{notice.title}</h2>
            <p>{notice.body}</p>
            <footer>
              <span>By {notice.author?.name || 'Campus team'} · {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}</span>
              {user.role === 'admin' && (
                <div>
                  <button className="text-button" disabled={notice.isPublished} onClick={() => publish(notice._id)}>Publish</button>
                  <button className="text-button danger" onClick={() => remove(notice._id)}>Remove</button>
                </div>
              )}
            </footer>
          </article>
        ))}
      </div>

      {!notices.length && <Empty title="No notices to show" detail="Published campus notices will appear here." />}

      {modal && (
        <CreateNotice
          onClose={() => setModal(false)}
          onDone={(message) => { setModal(false); reload(); setToast(message); }}
        />
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function CreateNotice({ onClose, onDone }) {
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', publish: true });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try { await api.post('/notices', form); onDone(form.publish ? 'Notice published.' : 'Notice saved as draft.'); }
    catch (e) { setError(e.response?.data?.message || 'Unable to create notice.'); }
  }

  return (
    <Modal title="Create notice" onClose={onClose}>
      <form className="form-grid" onSubmit={submit}>
        <label className="full-width">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="full-width">Message<textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
        <label>Audience
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            {['all', 'student', 'faculty', 'admin'].map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.publish} onChange={(e) => setForm({ ...form, publish: e.target.checked })} />
          Publish immediately
        </label>
        {error && <p className="error-message full-width">{error}</p>}
        <div className="modal-actions full-width">
          <button type="button" className="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary">Save notice</button>
        </div>
      </form>
    </Modal>
  );
}
