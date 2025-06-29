import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Prerender solo rutas estáticas
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'products', renderMode: RenderMode.Prerender },
  { path: 'orders', renderMode: RenderMode.Prerender },
  // ... puedes agregar más rutas estáticas aquí si lo deseas

  // Usa SSR para rutas dinámicas
  { path: 'products/edit/:id', renderMode: RenderMode.Server },
  { path: 'products/variations/edit/:id', renderMode: RenderMode.Server },
  { path: 'orders/edit/:id', renderMode: RenderMode.Server },

  // Fallback para cualquier otra ruta
  { path: '**', renderMode: RenderMode.Server }
];
