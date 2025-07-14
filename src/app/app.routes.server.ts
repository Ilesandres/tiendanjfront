import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [

  { path: '', renderMode: RenderMode.Prerender },
  { path: 'products', renderMode: RenderMode.Prerender },
  { path: 'orders', renderMode: RenderMode.Prerender },



  { path: 'products/edit/:id', renderMode: RenderMode.Server },
  { path: 'products/variations/edit/:id', renderMode: RenderMode.Server },
  { path: 'orders/edit/:id', renderMode: RenderMode.Server },


  { path: '**', renderMode: RenderMode.Server }
];
