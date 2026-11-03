import { BrandMark } from '@/features/auth/brand-mark';
import Link from 'next/link';
import { PetTrail } from './pet-note';

export function SiteFooter() {
  return <footer className="site-footer"><PetTrail /><div className="site-footer__content"><BrandMark /><p>Para las huellas que hacen de tu vida un hogar.</p><span>Cuidado que acompaña.</span><nav aria-label="Información legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></nav></div></footer>;
}
