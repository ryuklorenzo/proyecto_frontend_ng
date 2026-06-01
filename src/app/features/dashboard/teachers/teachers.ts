import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

import { AuthService, UserRole } from '../../../core/auth/auth';
import { TeacherService } from '../../../core/services/teachers/teacher';
import {
  LucideGraduationCap,
  LucideUsers,
  LucideUserSearch,
  LucideUserX,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
} from '@lucide/angular';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers {
  authService = inject(AuthService);
  private teacherService = inject(TeacherService);
  private fb = inject(FormBuilder);

  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  };

  private butonItems: Buttons[] = [
    { label: 'Crear profesor', icon: LucideGraduationCap, roles: ['admin'] },
    { label: 'Ver profesores', icon: LucideUsers, roles: ['admin', 'directivo'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);

  teachers = signal<any[]>([]);
  selectedTeacher = signal<any>(null);
  searchTerm = signal('');

  //se actualiza con la barra de busqueda automaticamente.
  filteredTeachers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allTeachers = this.teachers();
    
    if (!term) return allTeachers;
    
    return allTeachers.filter(teacher =>
      teacher.nombre.toLowerCase().includes(term) ||
      teacher.apellidos.toLowerCase().includes(term) ||
      teacher.id.toString().includes(term)
    );
  });

  teacherForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    password: ['', Validators.required],
    idCurso: [1, [Validators.required, Validators.min(1)]]
  });

  toggleCrearProfesor() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);
  }

  loadTeachers() {
    this.teacherService.getTeachers().subscribe({
      next: (data: any) => {
        this.teachers.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando profesores');
      }
    });
  }

  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  createTeacher() {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    const formValue = this.teacherForm.value;
    const teacherData = {
      nombre: formValue.nombre,
      apellidos: formValue.apellidos,
      password: formValue.password,
      activo: true
    };

    this.teacherService.createTeacher(teacherData, formValue.idCurso).subscribe({
      next: (response) => {
        console.log(response);
        this.teacherForm.reset({ idCurso: 1 });
        alert('Profesor creado correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando profesor');
      }
    });
  }

  viewTeacher(teacher: any) {
    this.teacherService.getTeacherById(teacher.id).subscribe({
      next: (data) => {
        this.selectedTeacher.set(data);
        this.mostrarDetalle.set(true);
      }
    });
  }

  deleteTeacher(teacher: any) {
    const confirmar = confirm(`¿Dar de baja a ${teacher.nombre} ${teacher.apellidos}?`);
    if (!confirmar) return;
    
    this.teacherService.deleteTeacher(teacher.id).subscribe({
      next: () => {
        alert('Profesor dado de baja correctamente');
        this.loadTeachers();
      },
      error: (error) => {
        console.error(error);
        alert('Error dando de baja al profesor');
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedTeacher.set(null);
  }

  hasError(controlName: string, errorName: string = 'required') {
    const control = this.teacherForm.get(controlName);
    return control?.hasError(errorName) && control?.touched;
  }
}