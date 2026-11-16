import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/commandes', renderMode: RenderMode.Client },
  { path: 'admin/plats', renderMode: RenderMode.Client },
  { path: 'livreur', renderMode: RenderMode.Client },
  { path: 'mes-commandes', renderMode: RenderMode.Client },
  { path: 'panier', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
