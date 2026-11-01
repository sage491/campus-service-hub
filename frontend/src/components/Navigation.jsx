import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `nav-link${isActive ? ' nav-link-active' : ''}`;

export default function Navigation() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <nav className="container navigation" aria-label="Main navigation">
        <NavLink className="brand" to="/">Campus Service Hub</NavLink>
        <div className="nav-links">
          <NavLink className={linkClass} to="/">Home</NavLink>
          {user ? <button className="nav-button" onClick={logout}>Sign out</button> : <NavLink className={linkClass} to="/login">Sign in</NavLink>}
        </div>
      </nav>
    </header>
  );
}
