export function Badge({ value }) {
  return <span className={`badge badge-${value?.toLowerCase().replaceAll(' ', '-')}`}>{value}</span>;
}

export function Empty({ title, detail }) {
  return (
    <div className="empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.35 }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <b>{title}</b>
      <span>{detail}</span>
    </div>
  );
}

export function Loading() {
  return (
    <div className="loading" role="status" aria-label="Loading">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ animation: 'spin 0.9s linear infinite', opacity: 0.5 }}>
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      Loading…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <div>
            <span className="eyebrow">CAMPUS SERVICE HUB</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-action" onClick={onClose} aria-label="Close">✕</button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function Toast({ message, onClose }) {
  return message ? (
    <div className="toast" role="status">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, color: '#4ade80' }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} aria-label="Dismiss">✕</button>
    </div>
  ) : null;
}
