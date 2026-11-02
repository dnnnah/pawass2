export function getAuthRedirectPath(pathname: string, isAuthenticated: boolean): string | null {
  if (pathname === '/acceso' && isAuthenticated) return '/mascotas';
  if (!isAuthenticated && (pathname === '/cuenta' || pathname.startsWith('/cuenta/') || pathname === '/mascotas' || pathname.startsWith('/mascotas/'))) {
    return '/acceso';
  }
  return null;
}

export function getBrandHomePath(): string {
  return '/';
}
