import { notFound } from 'next/navigation';
import { DemoPetPage } from '@/features/demo/views';
import { demoPets, findDemoPetBySlug } from '@/features/demo/domain';

export const dynamicParams = false;

export function generateStaticParams() {
  return demoPets.map(({ slug }) => ({ slug }));
}

export default async function DemoPetRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pet = findDemoPetBySlug(slug);
  if (!pet) notFound();
  return <DemoPetPage pet={pet} />;
}
