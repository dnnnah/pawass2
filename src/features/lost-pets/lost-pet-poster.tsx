'use client';

import { QRCodeSVG } from 'qrcode.react';
import NextImage from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPosterFormats, type PosterFormatId } from './poster-domain';
import './lost-pet-poster.css';

export type PosterAlert = { label: string; severity: 'critical' | 'precaution' | 'informative'; instructions: string };

export type LostPosterData = {
  name: string;
  species: 'perro' | 'gato';
  code: string;
  photoUrl: string;
  phone: string;
  qrUrl: string;
  lastSeenLocation: string;
  lastSeenAt: string | null;
  description: string | null;
  wearing: string | null;
  reward: string | null;
  alerts: PosterAlert[];
};

type PosterImage = { id: PosterFormatId; label: string; url: string; width: number; height: number };

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function limitText(text: string | null, maximum: number): string | null {
  if (!text?.trim()) return null;
  const cleanText = text.trim();
  return cleanText.length > maximum ? `${cleanText.slice(0, maximum - 1).trimEnd()}…` : cleanText;
}

function drawPaw(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.fillStyle = '#ffffff';
  const dots = [[0.2, 0.26, -0.25], [0.42, 0.14, 0], [0.65, 0.18, 0.2], [0.82, 0.36, 0.48]];
  for (const [dx, dy, rotation] of dots) {
    context.beginPath();
    context.ellipse(x + size * dx, y + size * dy, size * 0.09, size * 0.13, rotation, 0, Math.PI * 2);
    context.fill();
  }
  context.beginPath();
  context.moveTo(x + size * 0.5, y + size * 0.4);
  context.bezierCurveTo(x + size * 0.28, y + size * 0.4, x + size * 0.22, y + size * 0.63, x + size * 0.3, y + size * 0.75);
  context.bezierCurveTo(x + size * 0.36, y + size * 0.84, x + size * 0.44, y + size * 0.77, x + size * 0.51, y + size * 0.77);
  context.bezierCurveTo(x + size * 0.6, y + size * 0.77, x + size * 0.68, y + size * 0.84, x + size * 0.73, y + size * 0.74);
  context.bezierCurveTo(x + size * 0.8, y + size * 0.61, x + size * 0.69, y + size * 0.41, x + size * 0.5, y + size * 0.4);
  context.fill();
  context.restore();
}

function drawPoster(context: CanvasRenderingContext2D, width: number, height: number, photo: HTMLImageElement, qr: HTMLImageElement, pet: LostPosterData) {
  const scale = width / 1080;
  const px = (value: number) => value * scale;
  const margin = px(68);
  const headerHeight = height * 0.145;
  const photoTop = height * 0.16;
  const photoHeight = height * 0.22;
  const detailsStart = height * 0.4;
  const footerTop = height * 0.84;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#b6323c';
  context.fillRect(0, 0, width, headerHeight);
  context.fillStyle = '#ffffff';
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.font = `750 ${px(42)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('pawpass', margin, px(75));
  drawPaw(context, margin + px(145), px(30), px(54));
  context.textAlign = 'right';
  context.font = `800 ${px(36)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('SE BUSCA', width - margin, px(76));
  context.textAlign = 'center';
  context.font = `850 ${px(75)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText(pet.name.toLocaleUpperCase('es-MX'), width / 2, height * 0.122, width - margin * 2);

  const photoFrame = { x: margin, y: photoTop, width: width - margin * 2, height: photoHeight };
  context.fillStyle = '#f5fafc';
  context.fillRect(photoFrame.x, photoFrame.y, photoFrame.width, photoFrame.height);
  const fit = Math.min(photoFrame.width / photo.naturalWidth, photoFrame.height / photo.naturalHeight);
  const drawnWidth = photo.naturalWidth * fit;
  const drawnHeight = photo.naturalHeight * fit;
  context.drawImage(photo, photoFrame.x + (photoFrame.width - drawnWidth) / 2, photoFrame.y + (photoFrame.height - drawnHeight) / 2, drawnWidth, drawnHeight);

  const contentWidth = width - margin * 2;
  let y = detailsStart;
  const footerLimit = footerTop - px(28);
  const labelSize = px(21);
  const bodySize = px(27);
  const lineHeight = px(34);
  const sectionGap = px(14);
  function section(label: string, value: string | null, options: { emphasize?: boolean } = {}) {
    if (!value?.trim() || y >= footerLimit) return;
    context.textAlign = 'left';
    context.fillStyle = '#506b77';
    context.font = `750 ${labelSize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    context.fillText(label.toLocaleUpperCase('es-MX'), margin, y);
    y += px(30);
    context.fillStyle = options.emphasize ? '#b6323c' : '#173b4b';
    context.font = `${options.emphasize ? 800 : 650} ${bodySize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    const lines = wrapText(context, value, contentWidth);
    for (const line of lines) {
      if (y + lineHeight > footerLimit) break;
      context.fillText(line, margin, y, contentWidth);
      y += lineHeight;
    }
    y += sectionGap;
  }
  section('Última zona vista', pet.lastSeenLocation, { emphasize: true });
  if (pet.lastSeenAt) section('Visto por última vez', new Date(pet.lastSeenAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }));
  section('Descripción', limitText(pet.description, 200));
  section('Qué llevaba puesto', pet.wearing);
  if (pet.alerts.length) {
    const alertText = pet.alerts.map((alert) => `${alert.severity === 'critical' ? 'Urgente' : alert.severity === 'precaution' ? 'Precaución' : 'Cuidado'}: ${alert.label}`).join(' · ');
    section('Alertas de cuidado autorizadas', alertText);
  }
  section('Recompensa informativa', pet.reward ? pet.reward : null);

  context.fillStyle = '#12536b';
  context.fillRect(0, footerTop, width, height - footerTop);
  const qrSize = Math.min(px(222), height - footerTop - px(48));
  context.fillStyle = '#ffffff';
  context.fillRect(width - margin - qrSize - px(18), footerTop + px(20), qrSize + px(36), qrSize + px(36));
  context.drawImage(qr, width - margin - qrSize, footerTop + px(38), qrSize, qrSize);
  context.textAlign = 'left';
  context.fillStyle = '#ffffff';
  context.font = `800 ${px(27)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('LLAMA SI LA VES', margin, footerTop + px(55));
  context.font = `850 ${px(54)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  const phoneLines = wrapText(context, pet.phone, width - margin * 2 - qrSize - px(66));
  phoneLines.slice(0, 2).forEach((line, index) => context.fillText(line, margin, footerTop + px(120 + index * 62)));
  context.font = `650 ${px(21)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText(`Código ${pet.code}`, margin, height - px(52));
  context.textAlign = 'right';
  context.fillText('Ficha QR vigente', width - margin - qrSize - px(22), height - px(52));
}

function dataUrlFromSvg(svg: SVGSVGElement): string {
  const markup = new XMLSerializer().serializeToString(svg);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo preparar una imagen del cartel.'));
    image.src = src;
  });
}

async function getPhotoImage(photoUrl: string): Promise<HTMLImageElement> {
  const response = await fetch(photoUrl, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) throw new Error('No pudimos cargar la fotografía para el cartel. Actualiza la página e inténtalo otra vez.');
  const objectUrl = URL.createObjectURL(await response.blob());
  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function LostPetPoster({ pet }: { pet: LostPosterData }) {
  const formats = useMemo(() => getPosterFormats(), []);
  const [formatId, setFormatId] = useState<PosterFormatId>('story');
  const [images, setImages] = useState<PosterImage[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  const activeImage = images.find((image) => image.id === formatId);
  const altText = useMemo(() => {
    const care = pet.alerts.map((alert) => `${alert.label}${alert.instructions ? `: ${alert.instructions}` : ''}`).join('; ');
    return `Cartel Se busca: ${pet.name}, ${pet.species}. Código ${pet.code}. Última zona vista: ${pet.lastSeenLocation}.${pet.lastSeenAt ? ` Visto por última vez: ${new Date(pet.lastSeenAt).toLocaleString('es-MX')}.` : ''}${pet.description ? ` ${pet.description}` : ''}${pet.wearing ? ` Llevaba puesto: ${pet.wearing}.` : ''}${care ? ` Alertas de cuidado autorizadas: ${care}.` : ''}${pet.reward ? ` Recompensa informativa: ${pet.reward}.` : ''} Llama al ${pet.phone}. Código QR a ${pet.qrUrl}.`;
  }, [pet]);

  useEffect(() => {
    let cancelled = false;
    async function renderPosters() {
      setBusy(true);
      setMessage('Preparando carteles de alta calidad…');
      try {
        await document.fonts.ready;
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) throw new Error('No pudimos preparar el código QR.');
        const [photo, qr] = await Promise.all([getPhotoImage(pet.photoUrl), loadImage(dataUrlFromSvg(svg))]);
        const rendered: PosterImage[] = [];
        for (const format of formats) {
          const canvas = document.createElement('canvas');
          canvas.width = format.width;
          canvas.height = format.height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Este navegador no permite preparar el cartel.');
          drawPoster(context, format.width, format.height, photo, qr, pet);
          rendered.push({ id: format.id, label: format.label, url: canvas.toDataURL('image/png'), width: format.width, height: format.height });
        }
        if (!cancelled) {
          setImages(rendered);
          setMessage('Los cuatro formatos están listos.');
        }
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'No pudimos preparar los carteles.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void renderPosters();
    return () => { cancelled = true; };
  }, [formats, pet]);

  async function exportPoster(action: 'download' | 'share' | 'print') {
    if (!consent || !activeImage) return;
    setMessage('');
    const filename = `pawpass-se-busca-${pet.code.toLowerCase()}-${activeImage.id}.png`;
    try {
      const response = await fetch(activeImage.url);
      const blob = await response.blob();
      if (action === 'download') {
        downloadBlob(blob, filename);
        setMessage('Descarga iniciada. Puedes compartir el PNG desde tus archivos o galería.');
        return;
      }
      if (action === 'print') {
        const imageUrl = URL.createObjectURL(blob);
        const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cartel de ${pet.name.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title><style>@page{size:${formatId === 'a4' ? 'A4' : 'Letter'} portrait;margin:0}*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0}body{display:grid;place-items:center}img{width:100%;height:100%;object-fit:contain}</style></head><body><img src="${imageUrl}" alt="${altText.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')}"><script>window.onload=()=>{window.focus();window.print();window.onafterprint=()=>window.close()}</script></body></html>`;
        const printUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        const printWindow = window.open(printUrl, '_blank');
        if (!printWindow) {
          URL.revokeObjectURL(imageUrl);
          URL.revokeObjectURL(printUrl);
          setMessage('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para PawPass e inténtalo otra vez.');
          return;
        }
        window.setTimeout(() => { URL.revokeObjectURL(imageUrl); URL.revokeObjectURL(printUrl); }, 60_000);
        return;
      }
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Se busca ${pet.name}`, text: `Ayuda a encontrar a ${pet.name}. Código ${pet.code}.` });
        return;
      }
      downloadBlob(blob, filename);
      setMessage('Este dispositivo no puede adjuntar el PNG directamente. La imagen se descargó: ábrela desde tus archivos o galería y elige Compartir.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage(error instanceof Error ? error.message : 'No pudimos compartir el cartel. Descarga el PNG e inténtalo desde tus archivos.');
    }
  }

  return (
    <section id="cartel-se-busca" className="poster-studio" aria-labelledby="poster-heading">
      <header className="poster-studio__header"><div><h2 id="poster-heading">Cartel de búsqueda</h2><p>Prepara una imagen clara para compartir o imprimir. El QR abre la ficha vigente de {pet.name}.</p></div></header>
      <div className="poster-studio__privacy" role="note">
        <strong>El teléfono aparecerá escrito en el cartel.</strong>
        <p>Al descargar, compartir o imprimir, ese número quedará visible para cualquiera que reciba la imagen o vea el papel en la calle.</p>
        <label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Acepto hacer público el teléfono <bdi>{pet.phone}</bdi> en este cartel.</span></label>
      </div>
      <div className="poster-studio__controls">
        <label className="field" htmlFor="poster-format"><span>Formato del cartel</span><select id="poster-format" value={formatId} onChange={(event) => setFormatId(event.target.value as PosterFormatId)}>{formats.map((format) => <option key={format.id} value={format.id}>{format.label} · {format.ratio}</option>)}</select></label>
        <div className="poster-studio__actions" aria-label="Acciones del cartel">
          <button className="button button--primary" type="button" onClick={() => void exportPoster('download')} disabled={!consent || !activeImage || busy}>Descargar PNG</button>
          <button className="button button--outline" type="button" onClick={() => void exportPoster('share')} disabled={!consent || !activeImage || busy}>Compartir</button>
          {formatId === 'a4' || formatId === 'letter' ? <button className="button button--outline" type="button" onClick={() => void exportPoster('print')} disabled={!consent || !activeImage || busy}>Imprimir {formatId === 'a4' ? 'A4' : 'carta'}</button> : null}
        </div>
      </div>
      <p className="poster-studio__status" role="status" aria-live="polite">{message}</p>
      <figure className="poster-studio__preview">
        {activeImage ? <NextImage src={activeImage.url} alt={altText} width={activeImage.width} height={activeImage.height} unoptimized /> : <div className="poster-studio__loading" aria-hidden="true">{busy ? 'Preparando vista previa…' : 'La vista previa no está disponible.'}</div>}
        <figcaption>Descripción del cartel: {altText}</figcaption>
      </figure>
      <p className="poster-studio__share-help">Si tu dispositivo no permite adjuntar la imagen, descarga el PNG. Después ábrelo en Fotos o Archivos y elige Compartir.</p>
      <div className="poster-studio__qr-source" ref={qrRef} aria-hidden="true"><QRCodeSVG value={pet.qrUrl} size={320} level="H" marginSize={4} /></div>
    </section>
  );
}
