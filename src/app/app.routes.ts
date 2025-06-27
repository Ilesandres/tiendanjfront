import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'admin/categories',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'admin/spices',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/spices/spices.component').then(m => m.SpicesComponent)
  },
  {
    path: 'admin/measures',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/measures/measures.component').then(m => m.MeasuresComponent)
  },
  {
    path: 'admin/colors',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/colors/colors.component').then(m => m.ColorsComponent)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./products/list/list.component').then(m => m.ListComponent)
  },
  {
    path: 'products/create',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./products/create/create.component').then(m => m.CreateComponent)
  },
  {
    path: 'products/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./products/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./orders/list/list.component').then(m => m.ListComponent)
  },
  {
    path: 'orders/create',
    loadComponent: () => import('./orders/create/create.component').then(m => m.CreateComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] }
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./orders/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  }
];
