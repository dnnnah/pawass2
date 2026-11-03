const noStoreRouteRoots = ['/acceso', '/auth', '/cuenta', '/mascotas', '/p', '/perdidas', '/pawgram'];

export function shouldDisableResponseCaching(pathname: string): boolean {
  return pathname === '/' || noStoreRouteRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
