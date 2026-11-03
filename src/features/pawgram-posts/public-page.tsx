import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/features/navigation/app-header';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { Feed } from '@/features/pawgram-feed/feed';
import { readFeed } from '@/features/pawgram-feed/queries';
export default async function SocialPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const result = await readFeed({ postId: id });
  if (!result.posts.length) notFound();
  return <PageFrame><AppHeader active="pawgram" signedIn={result.signedIn} /><PageContent className="social-main social-main--single"><Link href="/pawgram" className="back-link">← Pawgram</Link><PageHeading title="Un momento en Pawgram" /><Feed {...result} more={false} base="/pawgram" /></PageContent></PageFrame>;
}
