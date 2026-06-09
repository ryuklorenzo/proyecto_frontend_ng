import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/auth.guard'; 

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
import { Classroom_coexistence } from './features/dashboard/classroom_coexistence/classroom_coexistence';
import { Mentions } from './features/dashboard/mentions/mentions';
import { Attitudes } from './features/dashboard/attitudes/attitudes';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [roleGuard],
    data: { expectedRoles: ['admin', 'directivo', 'profesor', 'alumno'] },
    children: [
      { path: '', component: Home },
      { path: 'students', component: Students, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'teachers', component: Teachers, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'executives', component: Executives, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'courses', component: Courses, canActivate: [roleGuard], data: { expectedRoles: ['admin'] } },
      { path: 'schedules', component: Schedules, canActivate: [roleGuard], data: { expectedRoles: ['admin'] } },
      { path: 'records', component: Records, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'tasks', component: Tasks, canActivate: [roleGuard], data: { expectedRoles: ['profesor', 'directivo', 'admin'] } },
      { path: 'reprimands', component: Reprimands, canActivate: [roleGuard], data: { expectedRoles: ['profesor', 'directivo', 'admin'] } },
      { path: 'recognitions', component: Recognitions, canActivate: [roleGuard], data: { expectedRoles: ['profesor', 'directivo', 'admin'] } },
      { path: 'probi', component: Probi, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'previ', component: Previ, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'classroom_coexistence', component: Classroom_coexistence, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'mentions', component: Mentions, canActivate: [roleGuard], data: { expectedRoles: ['directivo', 'admin'] } },
      { path: 'attitudes', component: Attitudes, canActivate: [roleGuard], data: { expectedRoles: ['profesor', 'directivo', 'admin'] } },
    ],
  },
  { path: '**', redirectTo: '' },
];