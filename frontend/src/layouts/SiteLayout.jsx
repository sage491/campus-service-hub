import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function SiteLayout() {
  return (
    <div className="app-shell">
      <Navigation />
      <main className="container page-content"><Outlet /></main>
    </div>
  );
}
