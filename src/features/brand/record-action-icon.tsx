import './record-action-icon.css';
export function RecordActionIcon({ kind }: { kind: 'edit' | 'eye' | 'eye-off' }) {
  return <svg className="record-action-icon" viewBox="0 0 24 24" aria-hidden="true">{kind === 'edit' ? <path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14z" /> : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />{kind === 'eye-off' && <path d="m3 3 18 18" />}</>}</svg>;
}
