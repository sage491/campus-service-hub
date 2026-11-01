import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import useRemote from '../hooks/useRemote';
import { Badge, Empty, Loading, Modal, Toast } from '../components/Ui';
import { useAuth } from '../context/AuthContext';

const blankRequest = { title: '', description: '', category: 'Facilities', location: '', priority: 'Medium' };
const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Reopened'];

export default function RequestsPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useRemote('/requests?limit=100');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (user.role === 'admin') {
      Promise.all([api.get('/users?role=faculty'), api.get('/departments')])
        .then(([users, teams]) => { setFaculty(users.data.users); setDepartments(teams.data.departments); })
        .catch(() => {});
    }
  }, [user.role]);

  const rows = useMemo(() =>
    (data?.requests || []).filter((item) =>
      (!status || item.status === status) &&
      (!query || `${item.title} ${item.location} ${item.category} ${item.student?.name || ''}`.toLowerCase().includes(query.toLowerCase()))
    ), [data, query, status]);

  const done = (message) => { setModal(null); setToast(message); reload(); };

  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>{user.role === 'student' ? 'My service requests' : user.role === 'faculty' ? 'Assigned requests' : 'All service requests'}</h1>
          <p>{user.role === 'student' ? 'Submit and track requests with campus teams.' : 'Search, review, and act on current requests.'}</p>
        </div>
        {user.role === 'student' && (
          <button className="button button-primary" onClick={() => setModal({ type: 'create' })}>Submit request</button>
        )}
      </section>

      <div className="toolbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests…" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span>{rows.length} {rows.length === 1 ? 'request' : 'requests'}</span>
      </div>

      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Request</th>
              {user.role !== 'student' && <th>Student</th>}
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item._id}>
                <td>
                  <button className="table-link" onClick={() => setModal({ type: 'detail', item })}>
                    {item.title}
                    <small>{item.location}</small>
                  </button>
                </td>
                {user.role !== 'student' && (
                  <td>{item.student?.name}<small>{item.student?.email}</small></td>
                )}
                <td>{item.category}</td>
                <td><span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                <td><Badge value={item.status} /></td>
                <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                <td><button className="text-button" onClick={() => setModal({ type: 'detail', item })}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty title="No requests found" detail="Try another search or create a new request." />}
      </section>

      {modal?.type === 'create' && <CreateRequest onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'detail' && (
        <RequestDetail item={modal.item} user={user} faculty={faculty} departments={departments} onClose={() => setModal(null)} onDone={done} />
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function CreateRequest({ onClose, onDone }) {
  const [form, setForm] = useState(blankRequest);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try { await api.post('/requests', form); onDone('Service request submitted.'); }
    catch (e) { setError(e.response?.data?.message || 'Unable to submit request.'); }
    finally { setSaving(false); }
  }

  return (
    <Modal title="Submit service request" onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['Facilities', 'IT support', 'Electrical', 'Plumbing', 'Housekeeping', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Priority
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Location<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        <label className="full-width">Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        {error && <p className="error-message full-width">{error}</p>}
        <div className="modal-actions full-width">
          <button type="button" className="button" onClick={onClose}>Cancel</button>
          <button disabled={saving} className="button button-primary">{saving ? 'Submitting…' : 'Submit request'}</button>
        </div>
      </form>
    </Modal>
  );
}

function RequestDetail({ item, user, faculty, onClose, onDone }) {
  const [current, setCurrent] = useState(item);
  const [history, setHistory] = useState([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/requests/${item._id}/history`).then((r) => setHistory(r.data.history)).catch(() => {});
  }, [item._id]);

  async function changeStatus(e) {
    try { const r = await api.patch(`/requests/${current._id}/status`, { status: e.target.value }); setCurrent(r.data.request); onDone('Request status updated.'); }
    catch (e2) { setError(e2.response?.data?.message || 'Unable to update status.'); }
  }
  async function assign(e) {
    try { const r = await api.patch(`/requests/${current._id}/assign`, { facultyId: e.target.value, department: current.department?._id }); setCurrent(r.data.request); onDone('Request assigned.'); }
    catch (e2) { setError(e2.response?.data?.message || 'Unable to assign request.'); }
  }
  async function addNote(e) {
    e.preventDefault();
    try { const r = await api.post(`/requests/${current._id}/resolution-notes`, { body: note }); setCurrent(r.data.request); setNote(''); onDone('Resolution note added.'); }
    catch (e2) { setError(e2.response?.data?.message || 'Unable to add note.'); }
  }

  return (
    <Modal title={current.title} onClose={onClose}>
      <div className="detail-meta">
        <Badge value={current.status} />
        <span style={{ color: 'var(--slate-500)', fontSize: '0.83rem' }}>{current.category} · {current.priority}</span>
      </div>
      <p className="detail-description">{current.description}</p>
      <p className="muted-copy" style={{ marginTop: '0.5rem' }}>
        <strong style={{ color: 'var(--slate-600)' }}>Location:</strong> {current.location}
      </p>
      {user.role === 'admin' && (
        <label className="form-label" style={{ marginTop: '1rem' }}>
          Assign faculty
          <select value={current.assignedTo?._id || ''} onChange={assign}>
            <option value="">Choose faculty member</option>
            {faculty.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
      )}
      {user.role !== 'student' && (
        <label className="form-label" style={{ marginTop: '0.75rem' }}>
          Update status
          <select value={current.status} onChange={changeStatus}>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      )}
      {user.role !== 'student' && (
        <form onSubmit={addNote} className="note-form">
          <label>Add resolution note<textarea value={note} onChange={(e) => setNote(e.target.value)} required /></label>
          <button className="button button-primary" style={{ justifySelf: 'start' }}>Add note</button>
        </form>
      )}
      {error && <p className="error-message" style={{ marginTop: '0.75rem' }}>{error}</p>}
      <section className="history">
        <h3>Request history</h3>
        {history.length
          ? history.map((entry) => (
              <div key={entry._id}>
                <b>{entry.action}</b>
                <span>{entry.actor?.name} · {new Date(entry.createdAt).toLocaleString()}</span>
                {entry.note && <p>{entry.note}</p>}
              </div>
            ))
          : <p className="muted-copy" style={{ fontSize: '0.8rem' }}>No history recorded yet.</p>}
      </section>
    </Modal>
  );
}
