type RecoveryCleanupPort = {
  close: () => Promise<boolean>;
  removePhoto: (path: string) => Promise<boolean>;
  clearPhotoReference: () => Promise<boolean>;
};

export async function closeReportAndRetirePhoto(port: RecoveryCleanupPort, photoPath: string | null) {
  try {
    if (!await port.close()) return { status: 'not-closed' as const };
  } catch {
    return { status: 'not-closed' as const };
  }

  if (!photoPath) return { status: 'closed' as const, photoCleanup: 'complete' as const };

  try {
    if (!await port.removePhoto(photoPath)) return { status: 'closed' as const, photoCleanup: 'pending' as const };
    if (!await port.clearPhotoReference()) return { status: 'closed' as const, photoCleanup: 'pending' as const };
    return { status: 'closed' as const, photoCleanup: 'complete' as const };
  } catch {
    return { status: 'closed' as const, photoCleanup: 'pending' as const };
  }
}
