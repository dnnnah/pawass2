import Link from 'next/link';
import Image from 'next/image';

export function BrandMark() {
  return (
    <Link href="/" className="brand" aria-label="PawPass, inicio">
      <Image src="/paw-mark.svg" width={32} height={32} alt="" aria-hidden="true" className="brand__paw" />
      <span>pawpass</span>
    </Link>
  );
}
