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
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = false;
  mostrarTabla = false;

  students: any[] = [];
  selectedStudent: any = null;
  mostrarDetalle = false;

  searchTerm = '';

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
    this.mostrarFormulario = false;
    this.mostrarTabla = true;

    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        this.students = [...data];
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando alumnos');
      }
    });
  }

  get filteredStudents() {
    return this.students.filter(student =>
      student.nombre.toLowerCase().includes(this.searchTerm.toLocaleLowerCase()) ||
      student.apellidos.toLowerCase().includes(this.searchTerm.toLocaleLowerCase()) ||
      student.id.toString().includes(this.searchTerm)
    );
  }

  createStudent() {
    if (
      !this.student.nombre.trim() ||
      !this.student.apellidos.trim() ||
      !this.student.password.trim()
    ) {
      alert('Todos los campos son obligatorios');
      return;
    }
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

  viewStudent(student: any) {
    this.studentService.getStudentById(student.id).subscribe({
      next: (data) => {
        this.selectedStudent = data;
        this.mostrarDetalle = true;
      },
      error: (error) => {
        console.error(error);
        alert('Error obteniendo alumno');
      }
    });
  }

  deleteStudent(student: any) {
    const confirmar = confirm(
      `¿Dar de baja a ${student.nombre} ${student.apellidos}?`
    );
    if (!confirmar) return;
    this.studentService.deleteStudent(student.id).subscribe({
      next: () => {
        alert('Alumno dado de baja correctamente');
        this.loadStudents();
      },
      error: (error) => {
        console.error(error);
        alert('Error dando de baja al alumno');
      }
    });
  }

  closeModal() {
    this.mostrarDetalle = false;
    this.selectedStudent = null;
  }
}
