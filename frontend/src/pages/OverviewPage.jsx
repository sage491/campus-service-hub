import { Link } from 'react-router-dom';
import useRemote from '../hooks/useRemote';
import { Empty, Loading } from '../components/Ui';
import { useAuth } from '../context/AuthContext';

export default function OverviewPage() {
  const { user } = useAuth();
  const { data, loading, error } = useRemote('/dashboard');
  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  const dashboard = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const metrics = dashboard.metrics && typeof dashboard.metrics === 'object' && !Array.isArray(dashboard.metrics)
    ? dashboard.metrics
    : {};
  const requestsByStatus = Array.isArray(dashboard.requestsByStatus)
    ? dashboard.requestsByStatus.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    : [];
  const adminMetrics = dashboard.adminMetrics && typeof dashboard.adminMetrics === 'object' && !Array.isArray(dashboard.adminMetrics)
    ? dashboard.adminMetrics
    : {};
  const departmentMetrics = dashboard.departmentMetrics && typeof dashboard.departmentMetrics === 'object' && !Array.isArray(dashboard.departmentMetrics)
    ? dashboard.departmentMetrics
    : {};
  const cards = user.role === 'admin'
    ? [['All requests', metrics.totalRequests], ['Active users', adminMetrics.users], ['Faculty members', adminMetrics.faculty], ['Feedback entries', adminMetrics.feedback]]
    : user.role === 'faculty'
    ? [['Assigned to me', metrics.totalRequests], ['Awaiting action', metrics.submitted], ['Dept. requests', departmentMetrics.departmentRequests ?? 0], ['Dept. resolved', departmentMetrics.departmentResolved ?? 0]]
    : [['My requests', metrics.totalRequests], ['Awaiting action', metrics.submitted], ['In progress', metrics.active], ['Resolved', metrics.resolved]];

  const maxCount = Math.max(...requestsByStatus.map((r) => r.count), 1);

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>{user.role === 'admin' ? 'Campus operations' : user.role === 'faculty' ? 'Your service queue' : `Welcome back, ${user.name.split(' ')[0]}`}</h1>
          <p>{user.role === 'student' ? 'Track your requests and stay up to date with campus services.' : 'Live information from the Campus Service Hub.'}</p>
        </div>
        {user.role === 'student' && <Link className="button button-primary" to="/requests">Submit a request</Link>}
      </section>

      <div className="metric-grid">
        {cards.map(([label, value]) => (
          <article className="metric" key={label}>
            <span>{label}</span>
            <b>{value ?? '—'}</b>
          </article>
        ))}
      </div>

      <section className="split-section">
        <article className="panel">
          <div className="panel-heading">
            <h2>Request activity</h2>
            <Link to="/requests">View all</Link>
          </div>
          {requestsByStatus.length
            ? <div className="bar-list">
                {requestsByStatus.map((item) => (
                  <div key={item._id}>
                    <span>{item._id}</span>
                    <i style={{ width: `${Math.max(6, (item.count / maxCount) * 100)}%` }} />
                    <b>{item.count}</b>
                  </div>
                ))}
              </div>
            : <Empty title="No request activity" detail="Requests will appear here once submitted." />}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Notifications</h2>
            <Link to="/notifications">{metrics.unreadNotifications} unread</Link>
          </div>
          <p className="muted-copy">
            {metrics.unreadNotifications > 0
              ? `You have ${metrics.unreadNotifications} unread notification${metrics.unreadNotifications > 1 ? 's' : ''}. Visit the notification centre for request updates and campus announcements.`
              : 'You are all caught up. New activity will appear here.'}
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link className="button" to="/notifications" style={{ fontSize: '0.8rem', minHeight: '34px' }}>View notifications</Link>
          </div>
        </article>
      </section>
    </>
  );
}
