import useRemote from '../hooks/useRemote';
import { Empty, Loading } from '../components/Ui';

export default function AnalyticsPage() {
  const { data, loading, error } = useRemote('/dashboard');
  if (loading) return <Loading />;
  if (error) return <p className="error-message">{error}</p>;

  const catRows = data.requestsByCategory;
  const statusRows = data.requestsByStatus;
  const catMax = Math.max(...catRows.map((r) => r.count), 1);
  const statusMax = Math.max(...statusRows.map((r) => r.count), 1);

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Campus analytics</h1>
          <p>Current request distribution from live Campus Service Hub data.</p>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric"><span>Total requests</span><b>{data.metrics.totalRequests}</b></article>
        <article className="metric"><span>Resolved</span><b>{data.metrics.resolved}</b></article>
        <article className="metric"><span>Published notices</span><b>{data.adminMetrics.notices}</b></article>
        <article className="metric"><span>Feedback entries</span><b>{data.adminMetrics.feedback}</b></article>
      </div>

      <div className="split-section">
        <article className="panel">
          <div className="panel-heading"><h2>Requests by category</h2></div>
          {catRows.length
            ? <div className="bar-list">{catRows.map((row) => <div key={row._id}><span>{row._id}</span><i style={{ width: `${(row.count / catMax) * 100}%` }} /><b>{row.count}</b></div>)}</div>
            : <Empty title="No analytics yet" detail="Category data appears when requests are created." />}
        </article>
        <article className="panel">
          <div className="panel-heading"><h2>Requests by status</h2></div>
          {statusRows.length
            ? <div className="bar-list">{statusRows.map((row) => <div key={row._id}><span>{row._id}</span><i style={{ width: `${(row.count / statusMax) * 100}%` }} /><b>{row.count}</b></div>)}</div>
            : <Empty title="No status data" detail="Status breakdown appears when requests are created." />}
        </article>
      </div>
    </>
  );
}
