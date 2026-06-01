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
  filteredStudents: any[] = [];

  searchTerm = '';
  nombreError = false;
  apellidosError = false;
  passwordError = false;
  nombreTouched = false;
  apellidosTouched = false;
  passwordTouched = false;

  student = {
    nombre: '',
    apellidos: '',
    password: '',
    activo: true
  };

  idCurso = 1;
  ngOnInit() {
    this.filteredStudents = [];
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
        this.students = data;
        this.filterStudents();
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando alumnos');
      }
    });
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(student =>
      student.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      student.id.toString().includes(this.searchTerm)
    );
  }

  createStudent() {
    this.validateForm();
    if (
      this.nombreError ||
      this.apellidosError ||
      this.passwordError
    ) {
      return;
    }
    this.studentService.createStudent(this.student, this.idCurso).subscribe({
      next: (response) => {
        console.log(response);

        this.student = {
          nombre: '',
          apellidos: '',
          password: '',
          activo: true
        };

        this.idCurso = 1;
        this.nombreError = false;
        this.apellidosError = false;
        this.passwordError = false;
        alert('Alumno creado correctamente');
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

  validateForm() {
    this.nombreError = !this.student.nombre.trim();
    this.apellidosError = !this.student.apellidos.trim();
    this.passwordError = !this.student.password.trim();
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