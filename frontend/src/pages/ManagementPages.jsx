import { useEffect, useState } from 'react';
import api from '../services/api';
import useRemote from '../hooks/useRemote';
import { Empty, Loading, Modal, Toast } from '../components/Ui';

export function PeoplePage() {
  const { data, loading, error, reload } = useRemote('/users');
  const [modal, setModal] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data.departments)).catch(() => {});
  }, []);

  const users = (data?.users || []).filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  );

  async function toggle(user) {
    try { await api.patch(`/users/${user.id}`, { isActive: !user.isActive }); reload(); setToast(`${user.name} is now ${user.isActive ? 'inactive' : 'active'}.`); }
    catch (e) { setToast(e.response?.data?.message || 'Unable to update account.'); }
  }

  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>People and faculty</h1>
          <p>Provision and manage Campus Service Hub accounts.</p>
        </div>
        <button className="button button-primary" onClick={() => setModal(true)}>Add account</button>
      </section>

      <div className="toolbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people…" />
        <span>{users.length} {users.length === 1 ? 'account' : 'accounts'}</span>
      </div>

      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Person</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}<small>{user.email}</small></td>
                <td><span className="role-chip">{user.role}</span></td>
                <td>{user.department?.name || <span style={{ color: 'var(--slate-400)' }}>—</span>}</td>
                <td>
                  <span style={{ color: user.isActive ? 'var(--teal-700)' : 'var(--slate-400)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="text-button" onClick={() => toggle(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <Empty title="No accounts found" detail="Create an account for a student, faculty member, or administrator." />}
      </section>

      {modal && (
        <CreateUser
          departments={departments}
          onClose={() => setModal(false)}
          onDone={(msg) => { setModal(false); reload(); setToast(msg); }}
        />
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function CreateUser({ departments, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'faculty', department: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try { await api.post('/users', form); onDone('Account created.'); }
    catch (e) { setError(e.response?.data?.message || 'Unable to create account.'); }
  }

  return (
    <Modal title="Add campus account" onClose={onClose}>
      <form className="form-grid" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Role
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {['student', 'faculty', 'admin'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label>Department
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option value="">None</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </label>
        <label className="full-width">Temporary password<input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error-message full-width">{error}</p>}
        <div className="modal-actions full-width">
          <button type="button" className="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary">Create account</button>
        </div>
      </form>
    </Modal>
  );
}

export function DepartmentsPage() {
  const { data, loading, error, reload } = useRemote('/departments');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');

  async function deactivate(dept) {
    try { await api.patch(`/departments/${dept._id}`, { isActive: false }); reload(); setToast(`${dept.name} deactivated.`); }
    catch (e) { setToast(e.response?.data?.message || 'Unable to update department.'); }
  }

  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Departments</h1>
          <p>Manage campus service teams and their visibility.</p>
        </div>
        <button className="button button-primary" onClick={() => setModal(true)}>Add department</button>
      </section>

      <section className="department-grid">
        {data.departments.map((dept) => (
          <article className="department-card" key={dept._id}>
            <span>{dept.code}</span>
            <h2>{dept.name}</h2>
            <p>{dept.description || 'No description added.'}</p>
            <button className="text-button danger" style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }} onClick={() => deactivate(dept)}>Deactivate</button>
          </article>
        ))}
      </section>

      {!data.departments.length && <Empty title="No departments yet" detail="Create the teams responsible for campus services." />}

      {modal && (
        <CreateDepartment
          onClose={() => setModal(false)}
          onDone={(msg) => { setModal(false); reload(); setToast(msg); }}
        />
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function CreateDepartment({ onClose, onDone }) {
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try { await api.post('/departments', form); onDone('Department created.'); }
    catch (e) { setError(e.response?.data?.message || 'Unable to create department.'); }
  }

  return (
    <Modal title="Add department" onClose={onClose}>
      <form className="form-grid" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Code<input required maxLength="12" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></label>
        <label className="full-width">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        {error && <p className="error-message full-width">{error}</p>}
        <div className="modal-actions full-width">
          <button type="button" className="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary">Create department</button>
        </div>
      </form>
    </Modal>
  );
}
