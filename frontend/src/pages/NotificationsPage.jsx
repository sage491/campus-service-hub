import api from '../services/api';
import useRemote from '../hooks/useRemote';
import { Empty, Loading } from '../components/Ui';

export default function NotificationsPage() {
  const { data, loading, error, reload } = useRemote('/notifications?limit=100');
  async function markAll() { await api.patch('/notifications/read-all'); reload(); }
  if (loading) return <Loading />; if (error) return <p className="error-message">{error}</p>;
  return <><section className="page-heading"><div><h1>Notifications</h1><p>Updates about your requests and campus notices.</p></div><button className="button" onClick={markAll}>Mark all read</button></section><section className="panel notification-list">{data.notifications.map((item) => <article className={item.readAt ? '' : 'unread'} key={item._id}><b>{item.title}</b><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></article>)}{!data.notifications.length && <Empty title="You are all caught up" detail="New activity will be shown here." />}</section></>;
}
