import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="container not-found">
      <p className="eyebrow">404</p>
      <h1>That page does not exist.</h1>
      <p>Return to the Campus Service Hub homepage.</p>
      <Link className="button button-primary" to="/">Go home</Link>
    </main>
  );
}
