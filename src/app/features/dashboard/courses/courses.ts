import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideBookOpen,
  LucideBook,
  LucideSearch,
  LucidePencil,
  LucideTrash2,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
} from '@lucide/angular';
import { CourseService } from '../../../core/services/courses/course';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TableModule } from 'primeng/table';

import { CommonModule } from '@angular/common';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-courses',
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  authService = inject(AuthService);
  private courseService = inject(CourseService);
  private fb = inject(FormBuilder);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash2
  }

  private butonItems: Buttons[] = [
    { label: 'Crear curso', icon: LucideBookOpen, roles: ['admin'] },
    { label: 'Ver cursos', icon: LucideBook, roles: ['admin', 'directivo', 'profesor'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  editMode = signal(false);
  selectedHorario = signal(1);

  courses = signal<any[]>([]);
  selectedCourse = signal<any>(null);

  searchTerm = signal('');

  //se actualiza con la barra de busqueda automaticamente.
  filteredCourses = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allCourses = this.courses();

    if (!term) return allCourses;

    return allCourses.filter(course =>
      course.nivel?.toLowerCase().includes(term) ||
      course.curso?.toLowerCase().includes(term) ||
      course.modulo?.toLowerCase().includes(term) ||
      course.id?.toString().includes(term)
    );
  });

  //form
  courseForm: FormGroup = this.fb.group({
    nivel: ['', Validators.required],
    curso: ['', Validators.required],
    modulo: ['', Validators.required],
    idHorario: [1, [Validators.required, Validators.min(1)]]
  });

  toggleCrearCurso() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedCourse.set(null);
    this.editMode.set(false);
  }

  hasError(controlName: string, errorName: string = 'required') {
    const control = this.courseForm.get(controlName);
    return control?.hasError(errorName) && control?.touched;
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

    this.courseService.createCourse(formValue.idHorario, courseData).subscribe({
      next: () => {
        alert('Curso creado correctamente');
        this.courseForm.reset({
          idHorario: 1
        });
      }
    });
  }

  loadCourses() {
    // Pedimos los datos y, cuando lleguen, mostramos la tabla
    this.courseService.getCourses().subscribe({
      next: (data: any) => {
        this.courses.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando cursos');
      }
    });
  }

  viewCourse(course: any) {
    this.courseService.getCourseById(course.id).subscribe({
      next: (data) => {
        this.selectedCourse.set(data);
        this.editMode.set(false);
        this.mostrarDetalle.set(true);
      }
    });
  }

  enableEdit() {
    this.editMode.set(true);
  }

  saveCourse() {
    const course = this.selectedCourse();

    if (!course) return;

    const body = {
      nivel: course.nivel,
      curso: course.curso,
      modulo: course.modulo
    };

    this.courseService.updateCourse(
      course.id,
      this.selectedHorario(),
      body
    ).subscribe({
      next: () => {
        alert('Curso actualizado');
        this.editMode.set(false);
        this.loadCourses();
      },
      error: (error) => {
        console.error(error);
        alert('Error actualizando curso');
      }
    });
  }

  cancelEdit() {
    this.editMode.set(false);
    this.viewCourse(this.selectedCourse());
  }

  deleteCourse(course: any) {
    if (!confirm(`¿Eliminar curso ${course.curso}?`)) {
      return;
    }

    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        this.loadCourses();
      }
    });
  }

}
