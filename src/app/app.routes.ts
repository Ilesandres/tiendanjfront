import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { 
      roles: ['admin', 'vendedor'],
      renderMode: 'ssr'
     },
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
    path: 'admin/typedni',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/typedni/typedni.component').then(m => m.TypeDniComponent)
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'vendedor'] },
    loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent)
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
    path: 'products/edit/:id',
    canActivate: [authGuard, roleGuard],
    data: { 
      roles: ['admin', 'vendedor']
     },
    loadComponent: () => import('./products/edit/edit.component').then(m => m.EditComponent)
  },
  {
    path: 'products/variations',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'vendedor']
     },
    loadComponent: () => import('./products/variations/list/list.component').then(m => m.VariationsListComponent)
  },
  {
    path: 'products/variations/edit/:id',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['admin', 'vendedor']
     },
    loadComponent: () => import('./products/variations/edit/edit.component').then(m => m.EditVariationComponent)
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
    data: { 
      roles: ['admin', 'vendedor'],
      renderMode: 'ssr'
     }
  },
  {
    path: 'orders/edit/:id',
    canActivate: [authGuard, roleGuard],
    data: { 
      roles: ['admin', 'vendedor']
     },
    loadComponent: () => import('./orders/edit/edit.component').then(m => m.EditOrderComponent)
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard, roleGuard],
    data: { 
      roles: ['admin', 'vendedor']
     },
    loadComponent: () => import('./orders/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  }
];
