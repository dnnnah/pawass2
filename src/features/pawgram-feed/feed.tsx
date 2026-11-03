import Image from 'next/image';
import Link from 'next/link';
import { PawButton } from '@/features/pawgram-paws/paw-button';
import { nextCursor, type FeedPost } from './domain';
export function Feed({ posts, more, base, signedIn }: { posts: FeedPost[]; more: boolean; base: string; signedIn: boolean }) {
  return <section aria-label="Publicaciones recientes"><div className="social-grid">{posts.map(post => <article className="social-card" key={post.id}>
    <header className="social-card-body"><h2><Link href={`/pawgram/mascotas/${post.pet_id}`}>{post.name}</Link></h2><Link href={`/pawgram/publicaciones/${post.id}`}><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString('es-MX', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</time></Link></header>
    <Image src={`/pawgram/imagenes/${post.photo_id}`} alt={post.alt} width={800} height={600} unoptimized />
    <div className="social-card-body">{post.body && <p className="social-text">{post.body}</p>}<PawButton post={post} signedIn={signedIn} /></div>
  </article>)}</div>{!posts.length && <p className="social-notice">No hay fotos públicas en esta página. Cada tutor decide cuándo compartirlas.</p>}
    {more && posts.length > 0 && <Link className="button button--outline social-more" href={`${base}?antes=${encodeURIComponent(nextCursor(posts[posts.length - 1]))}`}>Ver fotos anteriores</Link>}
  </section>;
}
