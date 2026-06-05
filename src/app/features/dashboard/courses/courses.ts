import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideBookOpen,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideLogOut,
  LucideDynamicIcon,
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TableModule } from 'primeng/table';

// Importamos los servicios de cursos y horarios
import { CourseService } from '../../../core/services/courses/course';
import { ScheduleService } from '../../../core/services/schedules/schedule';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {

  authService = inject(AuthService);
  private courseService = inject(CourseService);
  private scheduleService = inject(ScheduleService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear curso', icon: LucideBookOpen, roles: ['admin', 'directivo'] },
    { label: 'Ver todos', icon: LucideBookOpen, roles: ['admin', 'directivo', 'profesor', 'alumno'] }
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);

  courses = signal<any[]>([]);
  selectedCourse = signal<any>(null);
  searchTerm = signal('');

  horarios = signal<any[]>([]);

  filteredCourses = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.courses();
    return this.courses().filter((course: any) =>
      course.curso?.toLowerCase().includes(term) ||
      course.nivel?.toLowerCase().includes(term) ||
      course.modulo?.toLowerCase().includes(term)
    );
  });

  courseForm: FormGroup = this.fb.group({
    nivel: ['', Validators.required],
    curso: ['', Validators.required],
    modulo: ['', Validators.required],
    id_horario: [null, Validators.required]
  });

  toggleCrearCurso() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);

    // Cargamos la lista de horarios para el desplegable
    this.scheduleService.getSchedules().subscribe({
      next: (data: any) => this.horarios.set(data),
      error: (err) => console.error('Error cargando horarios', err)
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data: any) => {
        this.courses.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando los cursos');
      }
    });
  }

  createCourse() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const formValue = this.courseForm.value;
    const courseData = {
      nivel: formValue.nivel,
      curso: formValue.curso,
      modulo: formValue.modulo
    };

    this.courseService.createCourse(formValue.id_horario, courseData).subscribe({
      next: (response) => {
        console.log(response);
        this.courseForm.reset({ id_horario: null });
        alert('Curso creado correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando el curso');
      }
    });
  }

  viewCourse(course: any) {
    this.selectedCourse.set(course);
    this.mostrarDetalle.set(true);
  }

  deleteCourse(course: any) {
    const confirmar = confirm(`¿Eliminar definitivamente el curso ${course.curso}?`);
    if (!confirmar) return;

    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        alert('Curso eliminado correctamente');
        this.loadCourses();
      },
      error: (error) => {
        console.error(error);
        alert('Error eliminando el curso');
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedCourse.set(null);
  }

  hasError(field: string): boolean {
    const control = this.courseForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'list') {
        this.loadCourses();
      }
    });
  }
}