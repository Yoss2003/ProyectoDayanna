/** Resuelve rutas de public/ en localhost y GitHub Pages. */
export function publicUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}
