import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const DOCUMENT_BUCKET = 'pet-health-documents';
const CONTENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

type Props = { params: Promise<{ id: string; documentId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id, documentId } = await params;
  if (!isUuid(id) || !isUuid(documentId)) notFound();
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: pet } = await supabase.from('pets').select('id').eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!pet) notFound();
  const { data: document } = await supabase.from('pet_health_documents')
    .select('storage_path,original_filename,mime_type')
    .eq('id', documentId).eq('pet_id', id).maybeSingle();
  if (!document || !CONTENT_TYPES.has(document.mime_type)) notFound();

  const { data: file, error } = await supabase.storage.from(DOCUMENT_BUCKET).download(document.storage_path);
  if (error || !file) notFound();

  const fallbackName = document.original_filename.replace(/[^a-zA-Z0-9._-]/g, '_') || 'documento';
  const encodedName = encodeURIComponent(document.original_filename).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return new Response(file, {
    headers: {
      'Content-Type': document.mime_type,
      'Content-Disposition': `inline; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`,
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Security-Policy': 'sandbox',
    },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
