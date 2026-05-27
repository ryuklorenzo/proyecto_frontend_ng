import { Routes } from '@angular/router';
import { DashboardLayout } from './features/dashboard/dashboard-layout/dashboard-layout';
import { Home } from './features/dashboard/home/home';
import { Students } from './features/dashboard/students/students';
import { Teachers } from './features/dashboard/teachers/teachers';
import { Executives } from './features/dashboard/executives/executives';
import { Login } from './features/login/login';
import { Courses } from './features/dashboard/courses/courses';
import { Schedules } from './features/dashboard/schedules/schedules';
import { Records } from './features/dashboard/records/records';
import { Tasks } from './features/dashboard/tasks/tasks';
import { Reprimands } from './features/dashboard/reprimands/reprimands';
import { Recognitions } from './features/dashboard/recognitions/recognitions';
import { Probi } from './features/dashboard/probi/probi';
import { Previ } from './features/dashboard/previ/previ';
import { AulaConvivencia } from './features/dashboard/aula-convivencia/aula-convivencia';
//import { authGuard } from './core/auth/auth.guard'; // Importante para proteger el dashboard

export const routes: Routes = [
  {
    path: '',
    //TODO mover a otro archivo.
    //aqui esta el login, deberiamos de moverlo a otro archivo si
    component: Login
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
        component: Home, //si pongo que navegue de home a home hacemos poco
        },
      {path: 'students',component: Students,},
      {path: 'teachers',component: Teachers,},
      {path: 'executives',component: Executives,},
      {path: 'courses',component: Courses,},
      {path: 'schedules',component: Schedules,},
      {path: 'records',component: Records,},
      {path: 'tasks',component: Tasks,},
      {path: 'reprimands',component: Reprimands,},
      {path: 'recognitions',component: Recognitions,},
      {path: 'probi',component: Probi,},
      {path: 'previ',component: Previ,},
      {path: 'aula-convivencia',component: AulaConvivencia,},
      // mas paginas futuro
    ],
  },

  //si la URL no existe, lo manda al Login
  {
    path: '**',
    redirectTo: '',
  },
];
