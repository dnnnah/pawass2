'use client';

import { QRCodeSVG } from 'qrcode.react';
import NextImage from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { canExportPoster, getPosterContactInfo, getPosterFormats, type PosterFormatId } from './poster-domain';
import './lost-pet-poster.css';

export type PosterAlert = { label: string; severity: 'critical' | 'precaution' | 'informative'; instructions: string };

function getPriorityCareAlerts(alerts: PosterAlert[]): PosterAlert[] {
  const priority: Record<PosterAlert['severity'], number> = { critical: 0, precaution: 1, informative: 2 };
  return alerts
    .map((alert, index) => ({ alert, index }))
    .sort((first, second) => priority[first.alert.severity] - priority[second.alert.severity] || first.index - second.index)
    .slice(0, 2)
    .map(({ alert }) => alert);
}

export type LostPosterData = {
  name: string;
  species: 'perro' | 'gato';
  code: string;
  photoUrl: string;
  phone: string;
  whatsappPhone: string;
  qrUrl: string;
  lastSeenLocation: string;
  lastSeenAt: string | null;
  wearing: string | null;
  message: string | null;
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

function drawAlertMark(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + size / 2, y);
  context.lineTo(x + size, y + size * 0.9);
  context.lineTo(x, y + size * 0.9);
  context.closePath();
  context.fill();
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.font = `850 ${size * 0.58}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('!', x + size / 2, y + size * 0.72);
  context.restore();
}

function fitEllipsis(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let fitted = text.trimEnd();
  while (fitted && context.measureText(`${fitted}…`).width > maxWidth) fitted = fitted.slice(0, -1).trimEnd();
  return fitted ? `${fitted}…` : '…';
}

function drawPoster(context: CanvasRenderingContext2D, width: number, height: number, photo: HTMLImageElement, qr: HTMLImageElement, pet: LostPosterData) {
  const scale = Math.min(width / 768, height / 1365);
  const px = (value: number) => value * scale;
  const margin = width * 0.064;
  const headerHeight = height * 0.176;
  const rewardTop = height * 0.725;
  const footerTop = height * 0.825;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#b6323c';
  context.fillRect(0, 0, width, headerHeight);
  context.fillStyle = '#ffffff';
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.font = `750 ${px(30)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('pawpass', margin, px(58));
  drawPaw(context, margin + context.measureText('pawpass').width + px(10), px(22), px(38));

  const badgeWidth = width * 0.214;
  const badgeHeight = px(36);
  const badgeX = width - margin - badgeWidth;
  const badgeY = px(24);
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  context.fill();
  drawAlertMark(context, badgeX + px(10), badgeY + px(8), px(21), '#b6323c');
  context.textAlign = 'right';
  context.fillStyle = '#70232a';
  context.font = `850 ${px(15)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('ALERTA ACTIVA', width - margin - px(11), badgeY + px(24));
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';
  context.font = `900 ${px(68)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('SE BUSCA', width / 2, height * 0.102, width - margin * 2);
  context.font = `800 ${px(68)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText(pet.name.toLocaleUpperCase('es-MX'), width / 2, height * 0.155, width - margin * 2);

  const photoFrame = { x: width * 0.064, y: height * 0.21, width: width * 0.464, height: height * 0.48 };
  const detailsX = width * 0.57;
  const detailsWidth = width * 0.37;
  const fit = Math.max(photoFrame.width / photo.naturalWidth, photoFrame.height / photo.naturalHeight);
  const drawnWidth = photo.naturalWidth * fit;
  const drawnHeight = photo.naturalHeight * fit;
  context.save();
  context.beginPath();
  context.roundRect(photoFrame.x, photoFrame.y, photoFrame.width, photoFrame.height, px(18));
  context.clip();
  context.drawImage(photo, photoFrame.x + (photoFrame.width - drawnWidth) / 2, photoFrame.y + (photoFrame.height - drawnHeight) / 2, drawnWidth, drawnHeight);
  context.restore();
  const labelSize = px(18);
  const bodySize = px(30);
  const lineHeight = px(30);
  const labelGap = px(31);
  function detail(label: string, value: string, y: number, nextSectionY: number, emphasize = false) {
    if (!value.trim()) return;
    context.textAlign = 'left';
    context.fillStyle = '#173b4b';
    context.font = `800 ${labelSize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    context.fillText(label.toLocaleUpperCase('es-MX'), detailsX, y, detailsWidth);
    context.fillStyle = emphasize ? '#173b4b' : '#101b24';
    context.font = `${emphasize ? 800 : 650} ${bodySize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    const lines = wrapText(context, value, detailsWidth);
    const maxLines = Math.max(1, Math.floor((nextSectionY - y - labelGap) / lineHeight));
    const shownLines = lines.slice(0, maxLines);
    if (shownLines.length < lines.length) shownLines[shownLines.length - 1] = fitEllipsis(context, shownLines[shownLines.length - 1], detailsWidth);
    shownLines.forEach((line, index) => context.fillText(line, detailsX, y + labelGap + index * lineHeight, detailsWidth));
  }

  const locationY = height * 0.216;
  const dateY = height * 0.3;
  const wearingY = height * 0.385;
  const careY = height * 0.49;
  detail('Última zona vista', pet.lastSeenLocation, locationY, dateY - px(5), true);
  if (pet.lastSeenAt) detail('Visto por última vez', new Date(pet.lastSeenAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }), dateY, wearingY - px(5));
  detail('Qué llevaba puesto', pet.wearing || '', wearingY, careY - px(10));

  const posterMessage = limitText(pet.message, 120);
  const noteFontSize = px(20);
  const noteLineHeight = px(23);
  const noteTextX = detailsX + px(17);
  const noteTextWidth = detailsWidth - px(29);
  context.font = `650 ${noteFontSize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  const noteLines = posterMessage ? wrapText(context, posterMessage, noteTextWidth) : [];
  const noteCardHeight = noteLines.length ? px(52) + noteLines.length * noteLineHeight : 0;

  const priorityAlerts = getPriorityCareAlerts(pet.alerts);
  let careCardHeight = 0;
  if (priorityAlerts.length) {
    const alertRows = priorityAlerts.map((alert) => {
      const level = alert.severity === 'critical' ? 'Urgente' : alert.severity === 'precaution' ? 'Precaución' : 'Cuidado';
      return `${level}: ${alert.label}${alert.instructions ? ` · ${alert.instructions}` : ''}`;
    });
    const cardX = detailsX;
    const cardY = careY;
    const cardWidth = detailsWidth;
    const textX = cardX + px(34);
    const textWidth = cardWidth - px(46);
    const rowGap = px(4);
    const noteGap = noteCardHeight ? px(8) : 0;
    const cardBottomLimit = rewardTop - px(14) - noteCardHeight - noteGap;
    function layoutCareRows(fontSize: number) {
      context.font = `700 ${fontSize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
      const rows = alertRows.map((row) => wrapText(context, row, textWidth));
      const bodyLineHeight = fontSize * 1.08;
      const bodyHeight = rows.reduce((total, lines) => total + lines.length * bodyLineHeight, 0) + Math.max(0, rows.length - 1) * rowGap;
      return { rows, bodyLineHeight, cardHeight: px(54) + bodyHeight };
    }
    let alertBodySize = px(23);
    let careLayout = layoutCareRows(alertBodySize);
    while (alertBodySize > px(14) && cardY + careLayout.cardHeight > cardBottomLimit) {
      alertBodySize = Math.max(px(14), alertBodySize - px(1));
      careLayout = layoutCareRows(alertBodySize);
    }
    const { rows, bodyLineHeight, cardHeight } = careLayout;
    careCardHeight = cardHeight;
    context.fillStyle = '#fcebed';
    context.beginPath();
    context.roundRect(cardX, cardY, cardWidth, cardHeight, px(14));
    context.fill();
    drawAlertMark(context, cardX + px(11), cardY + px(39), px(20), '#b6323c');
    context.textAlign = 'center';
    context.fillStyle = '#173b4b';
    context.font = `800 ${px(16)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    context.fillText('ALERTAS DE CUIDADO', cardX + cardWidth / 2, cardY + px(25), cardWidth - px(22));
    context.textAlign = 'left';
    context.fillStyle = '#101b24';
    context.font = `700 ${alertBodySize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    let lineY = cardY + px(51);
    rows.forEach((lines) => {
      lines.forEach((line) => {
        context.fillText(line, textX, lineY, textWidth);
        lineY += bodyLineHeight;
      });
      lineY += rowGap;
    });
  }

  if (noteLines.length) {
    const noteX = detailsX;
    const noteY = careY + (careCardHeight ? careCardHeight + px(8) : 0);
    context.fillStyle = '#e2f0f4';
    context.beginPath();
    context.roundRect(noteX, noteY, detailsWidth, noteCardHeight, px(12));
    context.fill();
    context.fillStyle = '#176986';
    context.beginPath();
    context.roundRect(noteX + px(8), noteY + px(10), px(3), noteCardHeight - px(20), px(2));
    context.fill();
    context.textAlign = 'left';
    context.fillStyle = '#12536b';
    context.font = `800 ${px(15)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    context.fillText('NOTA PARA QUIEN LA ENCUENTRE', noteTextX, noteY + px(22), noteTextWidth);
    context.fillStyle = '#173b4b';
    context.font = `650 ${noteFontSize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    noteLines.forEach((line, index) => context.fillText(line, noteTextX, noteY + px(45) + index * noteLineHeight, noteTextWidth));
  }

  if (pet.reward?.trim()) {
    const rewardHeight = height * 0.082;
    const rewardX = margin;
    const rewardWidth = width - margin * 2;
    context.fillStyle = '#176986';
    context.beginPath();
    context.roundRect(rewardX, rewardTop, rewardWidth, rewardHeight, px(14));
    context.fill();
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    const groupedReward = pet.reward.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    context.font = `900 ${px(37)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    context.fillText(`RECOMPENSA: $${groupedReward}`, width / 2, rewardTop + px(55), rewardWidth - px(42));
    context.font = `700 ${px(17)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
    context.fillText('GRACIAS POR AYUDAR A ENCONTRARLA', width / 2, rewardTop + px(80), rewardWidth - px(34));
  }

  context.fillStyle = '#12536b';
  context.fillRect(0, footerTop, width, height - footerTop);
  const qrSize = Math.min(width * 0.138, height - footerTop - px(70));
  const qrCardWidth = qrSize + px(42);
  const qrCardHeight = qrSize + px(60);
  const qrCardX = width - margin - qrCardWidth;
  const qrCardY = footerTop + px(28);
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.roundRect(qrCardX, qrCardY, qrCardWidth, qrCardHeight, px(12));
  context.fill();
  const qrX = qrCardX + px(21);
  const qrY = qrCardY + px(17);
  context.drawImage(qr, qrX, qrY, qrSize, qrSize);
  context.textAlign = 'center';
  context.fillStyle = '#173b4b';
  context.font = `750 ${px(17)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('Ficha QR vigente', qrCardX + qrCardWidth / 2, qrY + qrSize + px(25));

  const contactWidth = qrCardX - margin - px(32);
  const contacts = getPosterContactInfo(pet.phone, pet.whatsappPhone);
  context.textAlign = 'left';
  context.fillStyle = '#ffffff';
  context.font = `800 ${px(20)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText('¡LLAMA SI LA VES!', margin, footerTop + px(54));
  context.font = `850 ${px(30)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  const phoneLines = wrapText(context, contacts.callNumber, contactWidth);
  phoneLines.slice(0, 2).forEach((line, index) => context.fillText(line, margin, footerTop + px(91 + index * 36)));
  context.font = `750 ${px(16)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  const whatsappLabel = contacts.usesSameNumber
    ? 'O MANDA UN WHATSAPP AL MISMO NÚMERO'
    : `O MANDA UN WHATSAPP AL ${contacts.whatsappNumber}`;
  const whatsappLines = wrapText(context, whatsappLabel, contactWidth);
  whatsappLines.slice(0, 2).forEach((line, index) => context.fillText(line, margin, footerTop + px(130 + index * 24)));
  context.font = `700 ${px(14)}px "Nunito Sans Variable", "Nunito Sans", sans-serif`;
  context.fillText(`Código: ${pet.code}`, margin, height - px(14));
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  const activeImage = images.find((image) => image.id === formatId);
  const canExport = canExportPoster({ hasImage: Boolean(activeImage), busy });
  const altText = useMemo(() => {
    const posterMessage = limitText(pet.message, 120);
    const care = getPriorityCareAlerts(pet.alerts).map((alert) => {
      const level = alert.severity === 'critical' ? 'Urgente' : alert.severity === 'precaution' ? 'Precaución' : 'Cuidado';
      return `${level}: ${alert.label}${alert.instructions ? ` · ${alert.instructions}` : ''}`;
    }).join('; ');
    const contacts = getPosterContactInfo(pet.phone, pet.whatsappPhone);
    const whatsappDescription = contacts.usesSameNumber
      ? 'También puedes mandar un WhatsApp al mismo número.'
      : `Manda un WhatsApp al ${contacts.whatsappNumber}.`;
    return `Cartel Se busca: ${pet.name}, ${pet.species}. Código ${pet.code}. Última zona vista: ${pet.lastSeenLocation}.${pet.lastSeenAt ? ` Visto por última vez: ${new Date(pet.lastSeenAt).toLocaleString('es-MX')}.` : ''}${pet.wearing ? ` Llevaba puesto: ${pet.wearing}.` : ''}${posterMessage ? ` Nota para quien la encuentre: ${posterMessage}.` : ''}${care ? ` Alertas de cuidado autorizadas: ${care}.` : ''}${pet.reward ? ` Recompensa informativa: ${pet.reward}.` : ''} Llama al ${contacts.callNumber}. ${whatsappDescription} Código QR a ${pet.qrUrl}.`;
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
    if (!activeImage || busy) return;
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
    <section className="poster-studio" aria-labelledby="poster-heading">
      <header className="poster-studio__header"><div><h2 id="poster-heading">Cartel de búsqueda</h2><p>Prepara una imagen clara para compartir o imprimir. El QR abre la ficha vigente de {pet.name}.</p></div></header>
      <div className="poster-studio__privacy" id="poster-phone-notice" role="note">
        <strong>El teléfono aparecerá escrito en el cartel.</strong>
        <p>Al descargar, compartir o imprimir, ese número quedará visible para cualquiera que reciba la imagen o vea el papel en la calle.</p>
        <p>Cuando la vista previa esté lista, elige <strong>Descargar PNG</strong> para guardar la imagen.</p>
      </div>
      <div className="poster-studio__controls">
        <label className="field" htmlFor="poster-format"><span>Formato del cartel</span><select id="poster-format" value={formatId} onChange={(event) => setFormatId(event.target.value as PosterFormatId)}>{formats.map((format) => <option key={format.id} value={format.id}>{format.label} · {format.ratio}</option>)}</select></label>
        <div className="poster-studio__actions" aria-label="Acciones del cartel">
          <button className="button button--primary" type="button" onClick={() => void exportPoster('download')} disabled={!canExport} aria-describedby="poster-phone-notice poster-studio-status">Descargar PNG</button>
          <button className="button button--outline" type="button" onClick={() => void exportPoster('share')} disabled={!canExport} aria-describedby="poster-phone-notice poster-studio-status">Compartir</button>
          {formatId === 'a4' || formatId === 'letter' ? <button className="button button--outline" type="button" onClick={() => void exportPoster('print')} disabled={!canExport} aria-describedby="poster-phone-notice poster-studio-status">Imprimir {formatId === 'a4' ? 'A4' : 'carta'}</button> : null}
        </div>
      </div>
      <p id="poster-studio-status" className="poster-studio__status" role="status" aria-live="polite">{message}</p>
      <figure className="poster-studio__preview">
        {activeImage ? <NextImage src={activeImage.url} alt={altText} width={activeImage.width} height={activeImage.height} unoptimized /> : <div className="poster-studio__loading" aria-hidden="true">{busy ? 'Preparando vista previa…' : 'La vista previa no está disponible.'}</div>}
      </figure>
      <p className="poster-studio__share-help">Si tu dispositivo no permite adjuntar la imagen, descarga el PNG. Después ábrelo en Fotos o Archivos y elige Compartir.</p>
      <div className="poster-studio__qr-source" ref={qrRef} aria-hidden="true"><QRCodeSVG value={pet.qrUrl} size={320} level="H" marginSize={4} /></div>
    </section>
  );
}
