export function getPublicPetViewHref(code: string, isLost: boolean): string {
  const encodedCode = encodeURIComponent(code);
  return isLost ? `/perdidas/${encodedCode}` : `/p/${encodedCode}`;
}
