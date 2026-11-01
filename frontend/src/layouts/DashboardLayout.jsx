import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  '/dashboard':    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  '/requests':     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  '/people':       'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
  '/departments':  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  '/notices':      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  '/feedback':     'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  '/analytics':    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  '/notifications':'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  '/profile':      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
};

const navigation = {
  student: [['/dashboard','Overview'],['/requests','My requests'],['/notices','Notices'],['/feedback','Feedback'],['/notifications','Notifications'],['/profile','Profile']],
  faculty: [['/dashboard','Overview'],['/requests','Assigned requests'],['/notices','Notices'],['/notifications','Notifications'],['/profile','Profile']],
  admin:   [['/dashboard','Overview'],['/requests','Service requests'],['/people','People'],['/departments','Departments'],['/notices','Notices'],['/feedback','Feedback'],['/analytics','Analytics'],['/notifications','Notifications'],['/profile','Profile']],
};

function NavIcon({ path }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const headerLabel = user.role === 'admin' ? 'CAMPUS OPERATIONS' : user.role === 'faculty' ? 'FACULTY SERVICE DESK' : 'STUDENT SERVICES';

  return (
    <div className={`workspace role-${user.role}`}>
      <aside className="sidebar">
        <NavLink to="/dashboard" className="sidebar-brand">Campus<span>Hub</span></NavLink>
        <div className="sidebar-role">{user.role} workspace</div>
        <nav>
          {navigation[user.role].map(([to, label]) => (
            <NavLink
              end={to === '/dashboard'}
              className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}
              to={to}
              key={to}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              {icons[to] && <NavIcon path={icons[to]} />}
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <b>{user.name}</b>
          <small>{user.email}</small>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">{headerLabel}</span>
          </div>
          <span className="role-label">{user.role}</span>
        </header>
        <div className="workspace-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
