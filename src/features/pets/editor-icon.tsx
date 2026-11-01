import './editor-icon.css';
export function EditorIcon({ kind }: { kind: 'info' | 'photo' | 'care' | 'health' | 'document' | 'contact' | 'eye' }) {
  const paths = {
    info: 'M12 10v7m0-10h.01M4 3h16v18H4z',
    photo: 'M3 5h18v14H3zM3 15l5-5 5 5 3-3 5 5M16 8h.01',
    care: 'M12 3l9 17H3zM12 9v5m0 3h.01',
    health: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
    document: 'M5 3h9l5 5v13H5zM14 3v6h5M8 13h8m-8 4h6',
    contact: 'M8 3l3 5-3 3 5 5 3-3 5 3c0 7-10 5-15 0S-1 3 8 3z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  };
  return <svg className={`editor-icon editor-icon--${kind}`} viewBox="0 0 24 24" aria-hidden="true"><path d={paths[kind]} /></svg>;
}
