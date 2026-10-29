import Link from 'next/link';

export function BrandMark() {
  return (
    <Link href="/" className="brand" aria-label="PawPass, inicio">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="brand__paw">
        <ellipse cx="8" cy="10" rx="3" ry="4" transform="rotate(-24 8 10)" />
        <ellipse cx="16" cy="7" rx="3" ry="4" />
        <ellipse cx="24" cy="10" rx="3" ry="4" transform="rotate(24 24 10)" />
        <path d="M16 14c-3.8 0-9 6.8-7.2 10.3 1.3 2.5 4.7.2 7.2.2s5.9 2.3 7.2-.2C25 20.8 19.8 14 16 14Z" />
      </svg>
      <span>pawpass</span>
    </Link>
  );
}
