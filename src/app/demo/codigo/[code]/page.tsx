import { notFound } from 'next/navigation';
import { DemoCodePage } from '@/features/demo/views';
import { demoPets, findDemoPetByCode } from '@/features/demo/domain';

export const dynamicParams = false;

export function generateStaticParams() {
  return demoPets.map(({ code }) => ({ code }));
}

export default async function DemoCodeRoute({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const pet = findDemoPetByCode(code);
  if (!pet) notFound();
  return <DemoCodePage pet={pet} />;
}
