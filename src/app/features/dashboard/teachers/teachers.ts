import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
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

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../core/services/teachers/teacher';
import { OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-teachers',
  imports: [
    LucideDynamicIcon,
    CommonModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  authService = inject(AuthService);
  private teacherService = inject(TeacherService);
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

  mostrarFormulario = false;
  mostrarTabla = false;

  teachers: any[] = [];
  selectedTeacher: any = null;
  mostrarDetalle = false;
  filteredTeachers: any[] = [];

  searchTerm = '';
  nombreError = false;
  apellidosError = false;
  passwordError = false;
  nombreTouched = false;
  apellidosTouched = false;
  passwordTouched = false;

  teacher = {
    nombre: '',
    apellidos: '',
    password: '',
    activo: true
  };

  idCurso = 1;
  ngOnInit() {
    this.filteredTeachers = [];
  }

  toggleCrearProfesor() {
    this.mostrarTabla = false;
    this.mostrarFormulario = true;
  }

  loadTeachers() {
    this.mostrarFormulario = false;
    this.mostrarTabla = true;

    this.teacherService.getTeachers().subscribe({
      next: (data: any) => {
        this.teachers = data;
        this.filterTeachers();
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando profesores');
      }
    });
  }

  filterTeachers() {
    this.filteredTeachers = this.teachers.filter(teacher =>
      teacher.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      teacher.apellidos.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      teacher.id.toString().includes(this.searchTerm)
    );
  }

  createTeacher() {
    this.validateForm();
    if (
      this.nombreError ||
      this.apellidosError ||
      this.passwordError
    ) {
      return;
    }
    this.teacherService.createTeacher(this.teacher, this.idCurso).subscribe({
      next: (response) => {
        console.log(response);

        this.teacher = {
          nombre: '',
          apellidos: '',
          password: '',
          activo: true
        };

        this.idCurso = 1;
        this.nombreError = false;
        this.apellidosError = false;
        this.passwordError = false;
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
        this.selectedTeacher = data;
        this.mostrarDetalle = true;
      }
    });
  }

  deleteTeacher(teacher: any) {
    const confirmar = confirm(
      `¿Dar de baja a ${teacher.nombre} ${teacher.apellidos}?`
    );
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
    this.mostrarDetalle = false;
    this.selectedTeacher = null;
  }

  validateForm() {
    this.nombreError = !this.teacher.nombre.trim();
    this.apellidosError = !this.teacher.apellidos.trim();
    this.passwordError = !this.teacher.password.trim();
  }

  onNombreBlur() {
    this.nombreTouched = true;
  }

  onApellidosBlur() {
    this.apellidosTouched = true;
  }

  onPasswordBlur() {
    this.passwordTouched = true;
  }
}