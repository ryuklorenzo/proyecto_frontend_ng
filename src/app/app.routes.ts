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
import { Classroom_coexistence } from './features/dashboard/classroom_coexistence/classroom_coexistence';
import { Mentions } from './features/dashboard/mentions/mentions';
import { Attitudes } from './features/dashboard/attitudes/attitudes';

export const routes: Routes = [
  {
    path: '',
    component: Login
  },

  {
    path: 'dashboard',
    component: DashboardLayout, //layout actúa de padre
    children: [
      {
        path: '',
        component: Home,
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
      {path: 'classroom_coexistence',component: Classroom_coexistence,},
      {path: 'mentions',component: Mentions,},
      {path: 'attitudes',component: Attitudes,},
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
