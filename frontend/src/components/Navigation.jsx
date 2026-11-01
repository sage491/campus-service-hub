import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `nav-link${isActive ? ' nav-link-active' : ''}`;

export default function Navigation() {
  return (
    <header className="site-header">
      <nav className="container navigation" aria-label="Main navigation">
        <NavLink className="brand" to="/">Campus Service Hub</NavLink>
        <div className="nav-links">
          <NavLink className={linkClass} to="/">Home</NavLink>
          <NavLink className={linkClass} to="/login">Sign in</NavLink>
        </div>
      </nav>
    </header>
  );
}
