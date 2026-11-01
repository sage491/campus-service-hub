export function Badge({ value }) { return <span className={`badge badge-${value?.toLowerCase().replaceAll(' ', '-')}`}>{value}</span>; }
export function Empty({ title, detail }) { return <div className="empty"><b>{title}</b><span>{detail}</span></div>; }
export function Loading() { return <div className="loading">Loading campus data…</div>; }
export function Modal({ title, children, onClose }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal"><header><div><span className="eyebrow">CAMPUS SERVICE HUB</span><h2>{title}</h2></div><button className="icon-action" onClick={onClose}>×</button></header>{children}</section></div>; }
export function Toast({ message, onClose }) { return message ? <div className="toast" role="status">{message}<button onClick={onClose}>×</button></div> : null; }
