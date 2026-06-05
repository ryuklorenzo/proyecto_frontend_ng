import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AuthService, UserRole } from '../../../core/auth/auth';
import { StudentService } from '../../../core/services/students/student';
import { CourseService } from '../../../core/services/courses/course';
import {
  LucideGraduationCap,
  LucideUsers,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideLogOut,
  LucideDynamicIcon,
} from '@lucide/angular';
import { ActivatedRoute } from '@angular/router';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  authService = inject(AuthService);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

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

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);

  cursos = signal<any[]>([]);
  students = signal<any[]>([]);
  selectedStudent = signal<any>(null);
  searchTerm = signal(''); //barra de busqueda.

  //se actualiza con la barra de busqueda automaticamente.
  filteredStudents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allStudents = this.students();

    if (!term) return allStudents;

    return allStudents.filter(student =>
      student.nombre.toLowerCase().includes(term) ||
      student.apellidos.toLowerCase().includes(term) ||
      student.id.toString().includes(term)
    );
  });

  //form
  studentForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    password: ['', Validators.required],
    idCurso: [1, [Validators.required, Validators.min(1)]]
  });

  toggleCrearAlumno() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);

    //desplegable de cursos dispo
    this.courseService.getCourses().subscribe({
      next: (data: any) => this.cursos.set(data),
      error: (error) => console.error('Error cargando cursos', error)
    });
  }

  loadStudents() {
    // Pedimos los datos y, cuando lleguen, mostramos la tabla
    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        this.students.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando alumnos');
      }
    });
  }

  //actualiza el Signal del buscador
  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  createStudent() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.value;
    const studentData = {
      nombre: formValue.nombre,
      apellidos: formValue.apellidos,
      password: formValue.password,
      activo: true
    };

    this.studentService.createStudent(studentData, formValue.idCurso).subscribe({
      next: (response) => {
        console.log(response);
        //reseteamos el estado
        this.studentForm.reset({ idCurso: 1 });
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
        this.selectedStudent.set(data);
        this.mostrarDetalle.set(true);
      }
    });
  }

  bajaStudent(student: any) {
    const confirmar = confirm(`¿Dar de baja a ${student.nombre} ${student.apellidos}?`);
    if (!confirmar) return;

    this.studentService.bajaStudent(student.id).subscribe({
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
    this.mostrarDetalle.set(false);
    this.selectedStudent.set(null);
  }

  // Método auxiliar para la vista HTML para comprobar si un campo tiene error
  hasError(controlName: string, errorName: string = 'required') {
    const control = this.studentForm.get(controlName);
    return control?.hasError(errorName) && control?.touched;
  }

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'list') {
        this.loadStudents();
      }
    });
  }
}