'use client';

import './rescue-qr-tools.css';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

export function RescueQrTools({ url, code, name }: { url: string; code: string; name: string }) {
  const qr = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function download(format: 'svg' | 'png') {
    const svg = qr.current?.querySelector('svg');
    if (!svg) return;
    setBusy(true); setMessage('');
    let sourceUrl: string | undefined;
    try {
      const source = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
      let blob = source;
      if (format === 'png') {
        sourceUrl = URL.createObjectURL(source);
        const image = new window.Image();
        image.src = sourceUrl;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 1200; canvas.height = 1200;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No pudimos crear el PNG. Intenta descargar el SVG.');
        context.fillStyle = '#fff'; context.fillRect(0, 0, 1200, 1200);
        context.drawImage(image, 0, 0, 1200, 1200);
        blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No pudimos crear la imagen.')), 'image/png'));
      }
      const target = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = target; link.download = `pawpass-qr-${code}.${format}`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(target), 10000);
      setMessage(`QR en ${format.toUpperCase()} preparado. Si no se guardó, revisa los permisos de descarga del navegador.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No pudimos descargar el QR. Inténtalo de nuevo.'); }
    finally { if (sourceUrl) URL.revokeObjectURL(sourceUrl); setBusy(false); }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: `Ficha de ${name}`, url });
      else { await navigator.clipboard.writeText(url); setMessage('Enlace copiado. Puedes pegarlo en un mensaje.'); }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage('No pudimos compartirlo. Copia la dirección que aparece debajo del QR.'); }
  }
  return <section className="qr-tools" aria-labelledby="qr-heading"><h2 id="qr-heading">Su QR permanente</h2><div ref={qr} className="qr-tools__code"><QRCodeSVG value={url} size={240} level="M" marginSize={4} title={`Código QR de ${name}`} /></div><a href={url}>{url}</a><p>Este código siempre abre la ficha vigente. Descarga PNG para mensajes o SVG para imprimir a cualquier tamaño. Abre el archivo descargado y elige Imprimir. Conserva el margen blanco y prueba escanearlo antes de hacer varias copias.</p><div className="qr-tools__actions"><button className="button button--primary" type="button" disabled={busy} onClick={() => void download('png')}>Descargar PNG</button><button className="button button--outline" type="button" disabled={busy} onClick={() => void download('svg')}>Descargar SVG</button><button className="button button--text" type="button" onClick={() => void share()}>Compartir ficha</button></div><p role="status" aria-live="polite">{message}</p></section>;
}
