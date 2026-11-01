export function WhatsAppActions({ name, code, whatsapp, urgent = false, callPhone }: { name: string; code: string; whatsapp: string; urgent?: boolean; callPhone?: string }) {
  const text = encodeURIComponent(`Hola, encontré a ${name} (${code}). ¿Puedes ayudarme a reunirle contigo?`);
  const number = whatsapp.replace(/\D/g, '');
  const href = `https://wa.me/${number}?text=${text}`;

  return (
    <div className="whatsapp-actions">
      <a className="button button--whatsapp" href={href} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
      {callPhone && <a className={`button ${urgent ? 'button--urgent-outline' : 'button--outline'} button--wide`} href={`tel:${callPhone}`}>Llamar a su familia</a>}
    </div>
  );
}
