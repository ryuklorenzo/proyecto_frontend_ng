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
import { StudentService } from '../../../core/services/students/student';
import { OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-students',
  imports: [
    LucideDynamicIcon,
    CommonModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {
  authService = inject(AuthService);
  private studentService = inject(StudentService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  };

  private butonItems: Buttons[] = [
    { label: 'Crear alumno', icon: LucideGraduationCap, roles: ['admin'] },
    { label: 'Ver alumnos', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver alumno por ID', icon: LucideUserSearch, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Dar baja alumno', icon: LucideUserX, roles: ['admin', 'directivo'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = false;
  mostrarTabla = false;

  students: any[] = [];

  student = {
    nombre: '',
    apellidos: '',
    password: '',
    activo: true
  };

  idCurso = 1;
  ngOnInit() {
  }

  toggleCrearAlumno() {
    this.mostrarTabla = false;
    this.mostrarFormulario = true;
  }

  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        this.students = data;
        this.mostrarFormulario = false;
        this.mostrarTabla = true;
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando alumnos');
      }
    });
  }

  createStudent() {
    this.studentService.createStudent(this.student, this.idCurso).subscribe({
      next: (response) => {
        console.log(response);
        alert('Alumno creado correctamente');

        this.student = {
          nombre: '',
          apellidos: '',
          password: '',
          activo: true
        };

        this.idCurso = 1;
      },
      error: (error) => {
        console.error(error);
        alert('Error creando alumno');
      }
    });
  }
}
