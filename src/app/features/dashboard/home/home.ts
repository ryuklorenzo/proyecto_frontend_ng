import { Component, computed, inject, signal, effect } from '@angular/core';
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
  LucideCalendar,
  LucideLogOut
} from '@lucide/angular';
import { RouterLink } from '@angular/router'; // <-- Importamos RouterLink
import { TaskService } from '../../../core/services/tasks/task';
import { ReprimandService } from '../../../core/services/reprimands/reprimand';
import { RecognitionService } from '../../../core/services/recognitions/recognition';
import { RecordService } from '../../../core/services/records/record';
import { PreviService } from '../../../core/services/previ/previ';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LucideDynamicIcon, RouterLink], 
  templateUrl: './home.html'
})

export class Home {
  icons = {
    GraduationCap: LucideGraduationCap,
    Users: LucideUsers,
    BookOpen: LucideBookOpen,
    Calendar: LucideCalendar,
    LogOut: LucideLogOut
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
  private recordService = inject(RecordService);
  private previService = inject(PreviService);
  
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
  mostrarDetalle = signal(false);
  detalleSeleccionado = signal<any>(null);
  tipoDetalle = signal<'tarea' | 'amonestacion' | 'alumno' | null>(null);
  totalExpedientes = signal(0);
  totalPrevis = signal(0);
  ultimosExpedientes = signal<any[]>([]);
  ultimasPrevis = signal<any[]>([]);
  mostrarDetalleDirectivo = signal(false);
  tipoDetalleDirectivo = signal<'expediente' | 'previ' | null>(null);
  detalleDirectivo = signal<any>(null);

  constructor() {
    effect(() => {
      const admin = this.isAdmin();
      const directivo = this.isDirectivo();
      const profe = this.isProfesor();
      const alumno = this.isAlumno();

      if (admin) {
        this.loadStats();
        this.loadLastStudents();
      } else if (profe) {
        this.loadProfesorDashboard();
      } else if (alumno) {
        this.loadAlumnoDashboard();
      } else if (directivo) {
        this.loadDirectivoDashboard();
      }
    });
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

  viewTask(task: any) {
    this.detalleSeleccionado.set(task);
    this.tipoDetalle.set('tarea');
    this.mostrarDetalle.set(true);
  }

  viewReprimand(reprimand: any) {
    this.detalleSeleccionado.set(reprimand);
    this.tipoDetalle.set('amonestacion');
    this.mostrarDetalle.set(true);
  }

  viewAlumno(alumno: any) {
    this.detalleSeleccionado.set(alumno);
    this.tipoDetalle.set('alumno');
    this.mostrarDetalle.set(true);
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.detalleSeleccionado.set(null);
    this.tipoDetalle.set(null);
  }

  mostrarLogoutModal = signal(false);

  openLogoutModal() {
    this.mostrarLogoutModal.set(true);
  }

  closeLogoutModal() {
    this.mostrarLogoutModal.set(false);
  }

  confirmLogout() {
    this.authService.logout();
  }

  loadDirectivoDashboard() {
    const directivoId = this.user()?.id;
    if (!directivoId) return;
    this.recordService.getRecordsByExecutive(directivoId).subscribe({
      next: (data: any) => {
        const records = Array.isArray(data) ? data : [];
        console.log('EXPEDIENTES', records);
        this.totalExpedientes.set(records.length);
        this.ultimosExpedientes.set(
          [...records]
            .reverse()
            .slice(0, 5)
        );
      }
    });
    this.previService.getPrevisByDirectivo(directivoId).subscribe({
      next: (data: any) => {
        const previs = Array.isArray(data) ? data : [];
        this.totalPrevis.set(previs.length);
        this.ultimasPrevis.set(
          [...previs]
            .reverse()
            .slice(0, 5)
        );
      }
    });

    this.reprimandService.getReprimands().subscribe({
      next: (reprimands: any) => {
        this.totalAmonestaciones.set(reprimands.length);
      }
    });

    this.recognitionService.getRecognitions().subscribe({
      next: (recognitions: any) => {
        this.totalReconocimientos.set(recognitions.length);
      }
    });
  }

  viewExpediente(expediente: any) {
    this.detalleDirectivo.set(expediente);
    this.tipoDetalleDirectivo.set('expediente');
    this.mostrarDetalleDirectivo.set(true);
  }

  viewPrevi(previ: any) {
    this.detalleDirectivo.set(previ);
    this.tipoDetalleDirectivo.set('previ');
    this.mostrarDetalleDirectivo.set(true);
  }

  closeDirectivoModal() {
    this.mostrarDetalleDirectivo.set(false);
    this.tipoDetalleDirectivo.set(null);
    this.detalleDirectivo.set(null);
  }
}