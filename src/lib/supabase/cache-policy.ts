const noStoreRouteRoots = ['/auth', '/cuenta', '/mascotas', '/p', '/perdidas'];

export function shouldDisableResponseCaching(pathname: string): boolean {
  return noStoreRouteRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
