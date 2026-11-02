import type { ReactNode } from 'react';
import './status-badge.css';
export type StatusTone = 'informative' | 'precaution' | 'critical' | 'current' | 'unknown';
export type StatusSymbolName = 'info' | 'shield' | 'urgent' | 'clock' | 'calendar' | 'check' | 'unknown';
export function StatusSymbol({ name }: { name: StatusSymbolName }) {
  const paths: Record<StatusSymbolName, string> = {
    info: 'M12 10v7m0-10h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
    shield: 'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6zM12 7v6m0 4h.01',
    urgent: 'm12 3 10 18H2zM12 9v5m0 3h.01',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6v6l4 2',
    calendar: 'M4 5h16v16H4zM8 2v6m8-6v6M4 10h16',
    check: 'M4 5h16v16H4zM8 2v6m8-6v6M4 10h16m-12 5 3 3 5-5',
    unknown: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 4h.01',
  };
  return <svg className="status-symbol" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function StatusBadge({ tone, icon, children }: { tone: StatusTone; icon: StatusSymbolName; children: ReactNode }) {
  return <span className={`status-badge status-badge--${tone}`}><StatusSymbol name={icon} /><span className="status-badge__label">{children}</span></span>;
}
export function CareSeverityBadge({ severity }: { severity: 'informative' | 'precaution' | 'critical' }) {
  return <StatusBadge tone={severity} icon={severity === 'critical' ? 'urgent' : severity === 'precaution' ? 'shield' : 'info'}>{severity === 'critical' ? 'Urgente' : severity === 'precaution' ? 'Precaución' : 'Informativa'}</StatusBadge>;
}
