import { Routes } from '@angular/router';
import { authGuard, adminGuard, livreurGuard } from './shared/guards/auth';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./client/menu/menu').then(m => m.MenuComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent) },
  { path: 'panier', canActivate: [authGuard], loadComponent: () => import('./client/panier/panier').then(m => m.PanierComponent) },
  { path: 'mes-commandes', canActivate: [authGuard], loadComponent: () => import('./client/commandes/commandes').then(m => m.MesCommandesComponent) },

  // Admin
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'admin/plats', canActivate: [adminGuard], loadComponent: () => import('./admin/plats/plats').then(m => m.GestionPlatsComponent) },
  { path: 'admin/commandes', canActivate: [adminGuard], loadComponent: () => import('./admin/commandes/commandes').then(m => m.GestionCommandesComponent) },

  // Livreur
{
  path: 'livreur',
  canActivate: [livreurGuard],
  loadComponent: () =>
    import('./livreur/livreur')
      .then(m => m.DashboardLivreurComponent)
},
  { path: '**', redirectTo: '' }
];