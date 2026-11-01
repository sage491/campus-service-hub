import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = {
  student: [['/dashboard', 'Overview'], ['/requests', 'My requests'], ['/notices', 'Notices'], ['/feedback', 'Feedback'], ['/notifications', 'Notifications'], ['/profile', 'Profile']],
  faculty: [['/dashboard', 'Overview'], ['/requests', 'Assigned requests'], ['/notices', 'Notices'], ['/notifications', 'Notifications'], ['/profile', 'Profile']],
  admin: [['/dashboard', 'Overview'], ['/requests', 'Service requests'], ['/people', 'People'], ['/departments', 'Departments'], ['/notices', 'Notices'], ['/feedback', 'Feedback'], ['/analytics', 'Analytics'], ['/notifications', 'Notifications'], ['/profile', 'Profile']]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  return <div className={`workspace role-${user.role}`}><aside className="sidebar"><NavLink to="/dashboard" className="sidebar-brand">Campus<span>Hub</span></NavLink><div className="sidebar-role">{user.role} workspace</div><nav>{navigation[user.role].map(([to, label]) => <NavLink end={to === '/dashboard'} className={({ isActive }) => isActive ? 'side-link active' : 'side-link'} to={to} key={to}>{label}</NavLink>)}</nav><div className="sidebar-user"><b>{user.name}</b><small>{user.email}</small><button onClick={logout}>Sign out</button></div></aside><main className="workspace-main"><header className="workspace-header"><div><span className="eyebrow">{user.role === 'admin' ? 'CAMPUS OPERATIONS' : user.role === 'faculty' ? 'FACULTY SERVICE DESK' : 'STUDENT SERVICES'}</span><strong>Campus Service Hub</strong></div><span className="role-label">{user.role}</span></header><div className="workspace-content"><Outlet /></div></main></div>;
}
