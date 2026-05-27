import { Routes } from '@angular/router';
import { DashboardLayout } from './features/dashboard/dashboard-layout/dashboard-layout';
import { Home } from './features/dashboard/home/home';
import { Students } from './features/dashboard/students/students';
import { Teachers } from './features/dashboard/teachers/teachers';
import { Executives } from './features/dashboard/executives/executives';
import { Admin } from './features/dashboard/admin/admin';
//import { authGuard } from './core/auth/auth.guard'; // Importante para proteger el dashboard

export const routes: Routes = [
  {
    path: '',
    //TODO mover a otro archivo.
    //aqui esta el login, deberiamos de moverlo a otro archivo si
    component: Home
  },

  // 2. RUTAS PROTEGIDAS: Todo lo que cuelga del Dashboard
  {
    path: 'dashboard',
    component: DashboardLayout, //layout actúa de padre
    //canActivate: [authGuard], // para proteger rutas, si da tiempo a futuro, esta guapo
    children: [
      {
        path: '',
        // Esta es la vista principal que carga DENTRO del dashboard (el resumen/inicio del panel)
        component: Home,
      },
      {
        path: 'students',
        component: Students,
      },
      {
        path: 'teachers',
        component: Teachers,
      },
      {
        path: 'executives',
        component: Executives,
      },
      {
        path: 'admin',
        component: Admin,
      },
      // mas paginas futuro
    ],
  },

  //si la URL no existe, lo manda al Login
  {
    path: '**',
    redirectTo: '',
  },
];
