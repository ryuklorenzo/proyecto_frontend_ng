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
import { Students } from '../students/students';
import { TaskService } from '../../../core/services/tasks/task';
import { ReprimandService } from '../../../core/services/reprimands/reprimand';
import { RecognitionService } from '../../../core/services/recognitions/recognition';

@Component({
  selector: 'app-home',
  standalone: true,
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
  private taskService = inject(TaskService);
  private reprimandService = inject(ReprimandService);
  private recognitionService = inject(RecognitionService);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private courseService = inject(CourseService);
  private scheduleService = inject(ScheduleService);
  private router = inject(Router);
  totalAlumnos = signal(0);
  totalProfesores = signal(0);
  totalCursos = signal(0);
  totalHorarios = signal(0);
  misAlumnos = signal(0);
  totalTareas = signal(0);
  tareasPendientes = signal(0);
  totalAmonestaciones = signal(0);
  totalReconocimientos = signal(0);
  ultimasTareas = signal<any[]>([]);
  ultimasAmonestaciones = signal<any[]>([]);
  ultimosReconocimientos = signal<any[]>([]);
  misTareas = signal<any[]>([]);
  misAmonestaciones = signal<any[]>([]);

  constructor() {
    if (this.isAdmin()) {
      this.loadStats();
      this.loadLastStudents();
    }
    if (this.isProfesor()) {
      this.loadProfesorDashboard();
    }
    if (this.isAlumno()) {
      this.loadAlumnoDashboard();
    }
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

  loadProfesorDashboard() {
    const profesorId = this.user()?.id;
    if (!profesorId) return;
    this.taskService.getTasksByTeacher(profesorId).subscribe({
      next: (tasks: any) => {
        this.totalTareas.set(tasks.length);
        this.tareasPendientes.set(
          tasks.filter((t: any) =>
            t.estado?.toUpperCase() !== 'COMPLETADA'
          ).length
        );
        this.ultimasTareas.set(
          [...tasks].reverse().slice(0, 5)
        );
      }
    });
    this.reprimandService.getReprimands().subscribe({
      next: (reprimands: any) => {
        this.totalAmonestaciones.set(reprimands.length);
        this.ultimasAmonestaciones.set(
          [...reprimands]
            .reverse()
            .slice(0, 5)
        );
      }
    });
    this.recognitionService.getRecognitions().subscribe({
      next: (recognitions: any) => {
        this.totalReconocimientos.set(recognitions.length);
      }
    });
  }

  loadAlumnoDashboard() {
    const alumnoId = this.user()?.id;
    if (!alumnoId) return;
    this.taskService.getTasksByStudent(alumnoId).subscribe({
      next: (tasks: any) => {
        this.misTareas.set(tasks);
        this.ultimasTareas.set(
          [...tasks]
            .reverse()
            .slice(0, 5)
        );
      }
    });
    this.reprimandService.getReprimandByStudent(alumnoId).subscribe({
      next: (reprimands: any) => {
        this.misAmonestaciones.set(reprimands);
        this.ultimasAmonestaciones.set(
          [...reprimands]
            .reverse()
            .slice(0, 5)
        );
      },
      error: () => {
        this.ultimasAmonestaciones.set([]);
      }
    });
  }
}