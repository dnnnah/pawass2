export function getAuthRedirectPath(pathname: string, isAuthenticated: boolean): string | null {
  if (pathname === '/' && isAuthenticated) return '/mascotas';
  if (!isAuthenticated && (pathname === '/cuenta' || pathname.startsWith('/cuenta/') || pathname === '/mascotas' || pathname.startsWith('/mascotas/'))) {
    return '/';
  }
  return null;
}
