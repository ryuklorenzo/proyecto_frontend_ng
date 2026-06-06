import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideClipboardList,
  LucideUsers,
  LucideUser,
  LucideSearch,
  LucideShieldAlert,
  LucideTriangleAlert,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ReprimandService } from '../../../core/services/reprimands/reprimand';
import { StudentService } from '../../../core/services/students/student';
import { TeacherService } from '../../../core/services/teachers/teacher';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-reprimands',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './reprimands.html',
  styleUrl: './reprimands.css',
})
export class Reprimands {

  authService = inject(AuthService);
  private reprimandService = inject(ReprimandService);
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Search: LucideSearch
  }

  private butonItems: Buttons[] = [
    { label: 'Crear amonestacion', icon: LucideTriangleAlert, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver amonestaciones', icon: LucideShieldAlert, roles: ['admin', 'directivo'] },
    { label: 'Ver amonestaciones del alumno', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
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
  reprimands = signal<any[]>([]);
  selectedReprimand = signal<any>(null);
  alumnos = signal<any[]>([]);
  profesores = signal<any[]>([]);
  alumnoSeleccionado = signal<number | null>(null);
  mostrarBusquedaAlumno = signal(false);
  searchTerm = signal('');

  reprimandForm: FormGroup = this.fb.group({
    idProfesor: [null, Validators.required],
    idAlumno: [null, Validators.required],
    nivel: ['', Validators.required],
    descripcion: ['', Validators.required],
    fecha: [
      new Date().toISOString().split('T')[0],
      Validators.required
    ],
    tipo: ['', Validators.required]
  });

  toggleCrearAmonestacion() {
    this.mostrarTabla.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarFormulario.set(true);
    this.studentService.getStudents().subscribe({
      next: (data: any) => this.alumnos.set(data)
    });
    this.teacherService.getTeachers().subscribe({
      next: (data: any) => this.profesores.set(data)
    });
  }

  createReprimand() {
    if (this.reprimandForm.invalid) {
      this.reprimandForm.markAllAsTouched();
      return;
    }
    const value = this.reprimandForm.value;
    //console.log('FORM VALUE', value);
    const body = {
      amonestacion: { nivel: value.nivel },
      actitud: {
        descripcion: value.descripcion,
        fecha: value.fecha,
        tipo: value.tipo
      }
    };
    //console.log('BODY', body);
    this.reprimandService.createReprimand(value.idAlumno, value.idProfesor, body).subscribe({
      next: () => {
        alert('Amonestación creada correctamente');
        this.reprimandForm.reset({
          fecha: new Date().toISOString().split('T')[0]
        });

      },
      error: (error) => {
        console.error(error);
        console.log('ERROR BACKEND', error.error);
        alert('Error creando amonestación');
      }
    });
  }

  loadReprimands() {
    this.reprimandService.getReprimands().subscribe({
      next: (data: any) => {
        //console.log(data);
        console.log('AMONESTACIONES ALUMNO', data);
        this.reprimands.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarBusquedaAlumno.set(false);
        this.mostrarTabla.set(true);
      }
    });
  }

  loadStudentReprimands(idAlumno: number) {
    this.mostrarFormulario.set(false);
    
    this.reprimandService.getReprimandByStudent(idAlumno).subscribe({
      next: (data: any) => {
        this.reprimands.set(data);
        this.mostrarTabla.set(true);
      },
      error: (err) => {
        if (err.status === 404) {
          // Vaciamos la lista y mostramos la tabla
          this.reprimands.set([]);
          this.mostrarTabla.set(true);
          // ¡Hemos quitado el alert!
        } else {
          console.error(err);
          alert('Error cargando amonestaciones del alumno');
        }
      }
    });
  }

  showStudentSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaAlumno.set(true);
    this.studentService.getStudents().subscribe({
      next: (data: any) => this.alumnos.set(data)
    });
  }

  buscarAmonestacionesAlumno() {
    const idAlumno = this.alumnoSeleccionado();
    if (!idAlumno) {
      alert('Selecciona un alumno');
      return;
    }
    this.loadStudentReprimands(idAlumno);
    this.mostrarBusquedaAlumno.set(false);
  }

  filteredReprimands = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.reprimands();
    }
    return this.reprimands().filter((reprimand: any) =>
      reprimand.nivel?.toLowerCase().includes(term) ||
      reprimand.descripcion?.toLowerCase().includes(term) ||
      reprimand.tipo?.toLowerCase().includes(term)
    );
  });

  viewReprimand(reprimand: any) {
    this.selectedReprimand.set(reprimand);
    this.mostrarDetalle.set(true);
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedReprimand.set(null);
  }

  hasError(field: string): boolean {
    const control = this.reprimandForm.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  updateSearchTerm(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

}
