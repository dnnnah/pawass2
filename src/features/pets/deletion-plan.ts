type ReadResult<T> = { data: T | null; error: unknown };
type PetRead = { name: string; primary_photo_path: string | null };
type CodeRead = { code: string };
type ReportRead = { recent_photo_path: string | null }[];
type HealthDocumentRead = { storage_path: string }[];

export function getPetDeletionPlan(reads: {
  pet: ReadResult<PetRead>;
  code: ReadResult<CodeRead>;
  reports: ReadResult<ReportRead>;
  healthDocuments: ReadResult<HealthDocumentRead>;
}) {
  if (reads.pet.error || reads.code.error || reads.reports.error || reads.healthDocuments.error) {
    return { status: 'unavailable' as const };
  }
  if (!reads.pet.data || !reads.code.data) return { status: 'not-found' as const };

  return {
    status: 'ready' as const,
    name: reads.pet.data.name,
    publicCode: reads.code.data.code,
    primaryPhotoPath: reads.pet.data.primary_photo_path,
    lostPhotoPaths: (reads.reports.data || []).map((report) => report.recent_photo_path).filter((path): path is string => Boolean(path)),
    healthDocumentPaths: (reads.healthDocuments.data || []).map((document) => document.storage_path),
  };
}
