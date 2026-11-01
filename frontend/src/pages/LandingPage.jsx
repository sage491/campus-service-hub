import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <section className="hero">
      <p className="eyebrow">CHANDIGARH UNIVERSITY</p>
      <h1>Campus support, in one place.</h1>
      <p className="hero-copy">
        Campus Service Hub will make it easier for students, faculty and service teams
        to manage campus requests and updates.
      </p>
      <Link className="button button-primary" to="/login">Sign in to continue</Link>
    </section>
  );
}
