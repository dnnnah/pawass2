import Link from 'next/link';
import Image from 'next/image';
import { getBrandHomePath } from '@/lib/supabase/auth-routing';

export function BrandMark({ href = getBrandHomePath() }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="PawPass, inicio">
      <span>pawpass</span>
      <Image src="/paw-mark.svg" width={32} height={32} alt="" aria-hidden="true" className="brand__paw" />
    </Link>
  );
}
