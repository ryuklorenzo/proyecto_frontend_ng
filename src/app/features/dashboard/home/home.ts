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

  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private courseService = inject(CourseService);
  private scheduleService = inject(ScheduleService);
  totalAlumnos = signal(0);
  totalProfesores = signal(0);
  totalCursos = signal(0);
  totalHorarios = signal(0);

  constructor() {
    this.loadStats();
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
}