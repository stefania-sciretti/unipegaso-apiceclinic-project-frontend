import { Routes } from '@angular/router';
import { loginGuard, adminGuard } from './guards/auth.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },

  // ── Pubbliche (visibili a tutti senza login) ──────────────────────────
  {
    path: 'homepage',
    loadComponent: () => import('./pages/homepage/homepage.component').then(m => m.HomepageComponent)
  },
  {
    path: 'specialists',
    loadComponent: () => import('./pages/specialists/specialists.component').then(m => m.SpecialistsComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'specialist/:slug',
    loadComponent: () => import('./pages/specialist/specialist-detail/specialist-detail.component').then(m => m.SpecialistDetailComponent)
  },
  { path: 'staff/:slug', redirectTo: '/specialist/:slug' },

  // ── Richiede login (admin o user) ─────────────────────────────────────
  {
    path: 'recipes',
    loadComponent: () => import('./pages/recipes/recipes.component').then(m => m.RecipesComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/appointments.component').then(m => m.AppointmentsComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [loginGuard]
  },

  // ── Solo admin ────────────────────────────────────────────────────────
  {
    path: 'nutrition',
    loadComponent: () => import('./pages/nutrition/nutrition.component').then(m => m.NutritionComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'training',
    loadComponent: () => import('./pages/training/training.component').then(m => m.TrainingComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
    canActivate: [adminGuard]
  },
  { path: 'clients', redirectTo: '/patients', pathMatch: 'full' },
  {
    path: 'glycemia',
    loadComponent: () => import('./pages/glycemia/glycemia.component').then(m => m.GlycemiaComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'booking-calendar',
    loadComponent: () => import('./pages/booking-calendar/booking-calendar.component').then(m => m.BookingCalendarComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: 'homepage' }
];
