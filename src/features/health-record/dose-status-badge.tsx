'use client';
import './dose-status-badge.css';
import { useSyncExternalStore } from 'react';
import { StatusBadge, type StatusTone, type StatusSymbolName } from '@/features/brand/status-badge';
import { calculateDoseStatus, type DoseStatus } from './domain';
const labels: Record<DoseStatus, string> = { 'sin-informacion': 'Sin información', 'sin-proxima-fecha': 'Sin próxima fecha', vencida: 'Vencida', 'proxima-a-vencer': 'Próxima a vencer', 'al-dia': 'Al día' };
export const doseStatusTone: Record<DoseStatus, StatusTone> = { 'sin-informacion': 'unknown', 'sin-proxima-fecha': 'unknown', vencida: 'critical', 'proxima-a-vencer': 'precaution', 'al-dia': 'current' };
const icons: Record<DoseStatus, StatusSymbolName> = { 'sin-informacion': 'unknown', 'sin-proxima-fecha': 'calendar', vencida: 'urgent', 'proxima-a-vencer': 'clock', 'al-dia': 'check' };
export function DoseStatusBadge({ status }: { status: DoseStatus | null }) {
  return <StatusBadge tone={status ? doseStatusTone[status] : 'unknown'} icon={status ? icons[status] : 'calendar'}>{status ? labels[status] : 'Calculando estado'}</StatusBadge>;
}
const subscribe = () => () => {};
export function DoseRecordStatus({ administeredOn, nextDoseDate }: { administeredOn: string; nextDoseDate: string | null }) {
  const today = useSyncExternalStore(subscribe, () => new Intl.DateTimeFormat('en-CA').format(new Date()), () => '');
  const status = today ? calculateDoseStatus([{ administeredOn, nextDoseDate }], today) : null;
  return <span className="dose-record-status" data-tone={status ? doseStatusTone[status] : 'unknown'}><DoseStatusBadge status={status} />{nextDoseDate && <time dateTime={nextDoseDate}>Próxima: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${nextDoseDate}T12:00:00Z`))}</time>}</span>;
}
