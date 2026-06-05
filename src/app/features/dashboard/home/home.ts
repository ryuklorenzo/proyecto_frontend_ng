import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth';
import { StudentService } from '../../../core/services/students/student';
import { TeacherService } from '../../../core/services/teachers/teacher';
import { CourseService } from '../../../core/services/courses/course';
import { ScheduleService } from '../../../core/services/schedules/schedule';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideUsers,
  LucideBookOpen,
  LucideCalendar
} from '@lucide/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  // CORRECCIÓN: Quitamos LucideAngularModule y dejamos LucideDynamicIcon igual que en el sidebar
  imports: [LucideDynamicIcon],
  templateUrl: './home.html'
})

export class Home {
  icons = {
    GraduationCap: LucideGraduationCap,
    Users: LucideUsers,
    BookOpen: LucideBookOpen,
    Calendar: LucideCalendar
  };
  authService = inject(AuthService);
  user = this.authService.user;
  mostrarPerfil = signal(false);
  isAdmin = computed(() => this.user()?.role === 'admin');
  isDirectivo = computed(() => this.user()?.role === 'directivo');
  isProfesor = computed(() => this.user()?.role === 'profesor');
  isAlumno = computed(() => this.user()?.role === 'alumno');
  ultimosAlumnos = signal<any[]>([]);

  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private courseService = inject(CourseService);
  private scheduleService = inject(ScheduleService);
  private router = inject(Router);
  totalAlumnos = signal(0);
  totalProfesores = signal(0);
  totalCursos = signal(0);
  totalHorarios = signal(0);

  constructor() {
    this.loadStats();
    this.loadLastStudents();
  }

  openProfile() {
    this.mostrarPerfil.set(true);
  }

  closeProfile() {
    this.mostrarPerfil.set(false);
  }

  loadStats() {
    this.studentService.getStudents().subscribe({
      next: (data: any) => this.totalAlumnos.set(data.length)
    });

    this.teacherService.getTeachers().subscribe({
      next: (data: any) => this.totalProfesores.set(data.length)
    });

    this.courseService.getCourses().subscribe({
      next: (data: any) => this.totalCursos.set(data.length)
    });

    this.scheduleService.getSchedules().subscribe({
      next: (data: any) => this.totalHorarios.set(data.length)
    });

  }

  goToStudents() {
    this.router.navigate(['/dashboard/students'], {
      queryParams: {
        view: 'list'
      }
    });
  }
  goToTeachers() {
    this.router.navigate(['/dashboard/teachers'], {
      queryParams: {
        view: 'list'
      }
    });
  }
  goToCourses() {
    this.router.navigate(['/dashboard/courses'], {
      queryParams: {
        view: 'list'
      }
    });
  }
  goToSchedules() {
    this.router.navigate(['/dashboard/schedules'], {
      queryParams: {
        view: 'list'
      }
    });
  }

  loadLastStudents() {
    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        const ultimos = [...data]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        this.ultimosAlumnos.set(ultimos);
      }
    });
  }
}