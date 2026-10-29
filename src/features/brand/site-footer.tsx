import { BrandMark } from '@/features/auth/brand-mark';
import { PetTrail } from './pet-note';

export function SiteFooter() {
  return <footer className="site-footer"><PetTrail /><div className="site-footer__content"><BrandMark /><p>Para las huellas que hacen de tu vida un hogar.</p><span>Cuidado que acompaña.</span></div></footer>;
}
