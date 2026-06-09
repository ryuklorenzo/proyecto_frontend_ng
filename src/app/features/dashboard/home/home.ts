/** 
 * Este es el componente principal del Dashboard, muestra la información según el rol:
 * - Administrador: Estadísticas generales del sistema
 * - Profesor: Tareas, amonestaciones y reconocimientos
 * - Alumno: Tareas y amonestaciones personales
 * - Directivo: Expedientes, previs y estadísticas disciplinarias
 */


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
import { RouterLink } from '@angular/router';
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
  /** 
   * Iconos
   */
  icons = {
    GraduationCap: LucideGraduationCap,
    Users: LucideUsers,
    BookOpen: LucideBookOpen,
    Calendar: LucideCalendar,
    LogOut: LucideLogOut
  };
  /**
   * Servicio de autentificación
   */
  authService = inject(AuthService);
  /**
   * Usuario actualmente autentificado
   */
  user = this.authService.user;
  /**
   * Controla si es visible el perfil
   */
  mostrarPerfil = signal(false);
  /**
   * Determina el rol del usuario
   */
  isAdmin = computed(() => this.user()?.role === 'admin');
  isDirectivo = computed(() => this.user()?.role === 'directivo');
  isProfesor = computed(() => this.user()?.role === 'profesor');
  isAlumno = computed(() => this.user()?.role === 'alumno');
  /**
   * Últimos alumnos registrados 
   */
  ultimosAlumnos = signal<any[]>([]);
  
  /**
   * Servicios utilizados
   */
  private taskService = inject(TaskService);
  private reprimandService = inject(ReprimandService);
  private recognitionService = inject(RecognitionService);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private courseService = inject(CourseService);
  private scheduleService = inject(ScheduleService);
  private recordService = inject(RecordService);
  private previService = inject(PreviService);
  
  /**
   * Estadisticas generales del sistema
   */
  totalAlumnos = signal(0);
  totalProfesores = signal(0);
  totalCursos = signal(0);
  totalHorarios = signal(0);
  /**
   * Estadisticas para profesor
   */
  misAlumnos = signal(0);
  totalTareas = signal(0);
  tareasPendientes = signal(0);
  totalAmonestaciones = signal(0);
  totalReconocimientos = signal(0);
  /**
   * Últimos elementos mostrados en los paneles
   */
  ultimasTareas = signal<any[]>([]);
  ultimasAmonestaciones = signal<any[]>([]);
  ultimosReconocimientos = signal<any[]>([]);
  /**
   * Info personal del alumno
   */
  misTareas = signal<any[]>([]);
  misAmonestaciones = signal<any[]>([]);
  /**
   * Control del modal de detalles
   */
  mostrarDetalle = signal(false);
  /**
   * Objeto actualmente seleccionado
   */
  detalleSeleccionado = signal<any>(null);
  /**
   * Tipo de detalle mostrandose
   */
  tipoDetalle = signal<'tarea' | 'amonestacion' | 'alumno' | null>(null);
  /**
   * Estadísticas para directivos
   */
  totalExpedientes = signal(0);
  totalPrevis = signal(0);
  /**
   * Últimos expedientes y previ
   */
  ultimosExpedientes = signal<any[]>([]);
  ultimasPrevis = signal<any[]>([]);
  /**
   * Control del modal específico para directivos
   */
  mostrarDetalleDirectivo = signal(false);
  /**
   * Tipo de modal mostrandose de directivo
   */
  tipoDetalleDirectivo = signal<'expediente' | 'previ' | null>(null);
  /**
   * Expediente o previ seleccionado
   */
  detalleDirectivo = signal<any>(null);

  /**
   * Constructor. Detecta el rol del user y carga auto los datos correspondientes
   */
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

  /**
   * Muestra el modal de perfil
   */
  openProfile() {
    this.mostrarPerfil.set(true);
  }

  /**
   * Oculta el modal de perfil
   */
  closeProfile() {
    this.mostrarPerfil.set(false);
  }

  /**
   * Carga estadísticas globales para admin
   */
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
  
  /**
   * Obtiene los 5 alumnos más recientes
   */
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

  /**
   * Carga el dashboard del profesor
   */
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

  /**
   * Carga el dashboard de alumno
   */
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

  /**
   * Muestra el detalle de una tarea
   */
  viewTask(task: any) {
    this.detalleSeleccionado.set(task);
    this.tipoDetalle.set('tarea');
    this.mostrarDetalle.set(true);
  }

  /**
   * Muestra el detalle de una amonestación
   */
  viewReprimand(reprimand: any) {
    this.detalleSeleccionado.set(reprimand);
    this.tipoDetalle.set('amonestacion');
    this.mostrarDetalle.set(true);
  }

  /**
   * Muestra el detalle de un alumno
   */
  viewAlumno(alumno: any) {
    this.detalleSeleccionado.set(alumno);
    this.tipoDetalle.set('alumno');
    this.mostrarDetalle.set(true);
  }

  /**
   * Cierra el modal de detalles
   */
  closeModal() {
    this.mostrarDetalle.set(false);
    this.detalleSeleccionado.set(null);
    this.tipoDetalle.set(null);
  }

  /**
   * Control del modal de cierre de sesión
   */
  mostrarLogoutModal = signal(false);

  /**
   * Muestra el modal de confirmación de cierre de sesión
   */
  openLogoutModal() {
    this.mostrarLogoutModal.set(true);
  }

  /**
   * Oculta el modal de confirmación de cierre de sesión
   */
  closeLogoutModal() {
    this.mostrarLogoutModal.set(false);
  }

  /**
   * Finaliza la sesión del usuario actual
   */
  confirmLogout() {
    this.authService.logout();
  }

  /**
   * Carga el dashboard de directivos
   */
  loadDirectivoDashboard() {
    const directivoId = this.user()?.id;
    if (!directivoId) return;
    this.recordService.getRecordsByExecutive(directivoId).subscribe({
      next: (data: any) => {
        const records = Array.isArray(data) ? data : [];
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

  /**
   * Muestra el detalle de un expediente
   */
  viewExpediente(expediente: any) {
    this.detalleDirectivo.set(expediente);
    this.tipoDetalleDirectivo.set('expediente');
    this.mostrarDetalleDirectivo.set(true);
  }

  /**
   * Muestra el detalle de un previ
   */
  viewPrevi(previ: any) {
    this.detalleDirectivo.set(previ);
    this.tipoDetalleDirectivo.set('previ');
    this.mostrarDetalleDirectivo.set(true);
  }

  /**
   * Cierra el modal de detalles para directivos
   */
  closeDirectivoModal() {
    this.mostrarDetalleDirectivo.set(false);
    this.tipoDetalleDirectivo.set(null);
    this.detalleDirectivo.set(null);
  }
}