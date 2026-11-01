import { Link } from 'react-router-dom';

const features = [
  { label: 'Submit requests', detail: 'Log facilities, IT, and campus service requests in seconds.' },
  { label: 'Track progress', detail: 'Follow every update from submission through to resolution.' },
  { label: 'Stay informed', detail: 'Receive notices and notifications relevant to your role.' },
];

export default function LandingPage() {
  return (
    <section className="hero">
      <p className="eyebrow">CHANDIGARH UNIVERSITY</p>
      <h1>Campus support,<br />in one place.</h1>
      <p className="hero-copy">
        Campus Service Hub connects students, faculty, and service teams to manage
        campus requests, notices, and updates — all from a single dashboard.
      </p>
      <Link className="button button-primary" to="/login" style={{ fontSize: '0.9rem', minHeight: '42px', padding: '0 1.4rem' }}>
        Sign in to continue
      </Link>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '3rem', maxWidth: '640px' }}>
        {features.map(({ label, detail }) => (
          <div key={label} style={{ borderTop: '2px solid var(--blue-100)', paddingTop: '0.85rem' }}>
            <p style={{ color: 'var(--slate-800)', fontWeight: 700, fontSize: '0.85rem', margin: '0 0 0.3rem' }}>{label}</p>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.8rem', lineHeight: 1.55, margin: 0 }}>{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
