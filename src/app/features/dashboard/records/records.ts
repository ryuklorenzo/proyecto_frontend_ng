import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideFolderOpen,
  LucideFolders,
  LucideSearch,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
  LucideEye,
  LucideUserX
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { TableModule } from 'primeng/table';

import { RecordService } from '../../../core/services/records/record';
import { StudentService } from '../../../core/services/students/student';
import { ExecutiveService } from '../../../core/services/executives/executive';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './records.html',
  styleUrl: './records.css',
})
export class Records {

  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private recordService = inject(RecordService);
  private studentService = inject(StudentService);
  private executiveService = inject(ExecutiveService);

  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Eye: LucideEye,
    UserX: LucideUserX
  }

  private butonItems: Buttons[] = [
    { label: 'Crear expediente', icon: LucideFolderOpen, roles: ['admin', 'directivo'] },
    { label: 'Ver expedientes', icon: LucideFolders, roles: ['admin', 'directivo'] },
    { label: 'Ver por alumno', icon: LucideSearch, roles: ['admin', 'directivo', 'alumno'] },
    { label: 'Ver por directivo', icon: LucideSearch, roles: ['admin', 'directivo'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  // Signals de estado visual
  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  mostrarBusquedaAlumno = signal(false);
  mostrarBusquedaDirectivo = signal(false);

  // Signals de datos
  records = signal<any[]>([]);
  selectedRecord = signal<any>(null);
  searchTerm = signal('');

  alumnos = signal<any[]>([]);
  alumnoSeleccionado = signal<number | null>(null);

  directivos = signal<any[]>([]);
  directivoSeleccionado = signal<number | null>(null);

  filteredRecords = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.records();
    return this.records().filter((record: any) =>
      record.estado?.toLowerCase().includes(term) ||
      record.nombre_alumno?.toLowerCase().includes(term) ||
      record.nombre_directivo?.toLowerCase().includes(term)
    );
  });

  recordForm: FormGroup = this.fb.group({
    estado: ['Abierto', Validators.required],
    idDirectivo: [null, Validators.required],
    idAlumno: [null, Validators.required]
  });

  toggleCrearExpediente() {
    this.mostrarTabla.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarBusquedaDirectivo.set(false);
    this.mostrarFormulario.set(true);

    //para no pedir el id directamente.
    this.studentService.getStudents().subscribe({
      next: (data: any) => this.alumnos.set(data)
    });

    this.executiveService.getExecutives().subscribe({
      next: (data: any) => this.directivos.set(data)
    });

    const currentUser = this.user();

    if (currentUser?.role === 'directivo' && currentUser.id) {
      this.recordForm.patchValue({
        idDirectivo: currentUser.id
      });
    } else {
      this.recordForm.patchValue({
        idDirectivo: null
      });
    }
  }

  createRecord() {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    const formValue = this.recordForm.value;

    const record = {
      estado: formValue.estado
    };

    // Suponemos que tu RecordService tiene este método:
    // createRecord(idDirectivo: number, idAlumno: number, record: any)
    this.recordService.createRecord(
      formValue.idDirectivo,
      formValue.idAlumno,
      record
    ).subscribe({
      next: (response) => {
        console.log(response);

        this.recordForm.reset({
          estado: 'Abierto',
          idDirectivo: null,
          idAlumno: null
        });

        alert('Expediente creado correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando el expediente');
      }
    });
  }

  loadAllRecords() {
    this.mostrarFormulario.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarBusquedaDirectivo.set(false);

    this.recordService.getRecords().subscribe({
      next: (data: any) => {
        this.records.set(data);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando expedientes');
      }
    });
  }

  loadStudentRecords(idAlumno: number) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);

    this.recordService.getRecordsByStudent(idAlumno).subscribe({
      next: (data: any) => {
        this.records.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando expedientes del alumno');
      }
    });
  }

  loadExecutiveRecords(idDirectivo: number) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);

    this.recordService.getRecordsByExecutive(idDirectivo).subscribe({
      next: (data: any) => {
        this.records.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando expedientes del directivo');
      }
    });
  }

  viewRecord(record: any) {
    this.selectedRecord.set(record);
    this.mostrarDetalle.set(true);
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedRecord.set(null);
  }

  hasError(field: string): boolean {
    const control = this.recordForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  showStudentSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaDirectivo.set(false);
    this.mostrarBusquedaAlumno.set(true);

    this.studentService.getStudents().subscribe({
      next: (data: any) => this.alumnos.set(data)
    });
  }

  buscarExpedientesAlumno() {
    const idAlumno = this.alumnoSeleccionado();
    if (!idAlumno) {
      alert('Selecciona un alumno');
      return;
    }
    this.loadStudentRecords(idAlumno);
    this.mostrarBusquedaAlumno.set(false);
  }

  showExecutiveSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaAlumno.set(false);
    const currentUser = this.user();
    if (currentUser?.role === 'directivo') {
      this.directivoSeleccionado.set(currentUser.id);
      this.loadExecutiveRecords(currentUser.id);
    } else {
      this.mostrarBusquedaDirectivo.set(true);
      this.executiveService.getExecutives().subscribe({
        next: (data: any) => this.directivos.set(data)
      });
    }
  }

  buscarExpedientesDirectivo() {
    const idDirectivo = this.directivoSeleccionado();
    if (!idDirectivo) {
      alert('Selecciona un directivo');
      return;
    }
    this.loadExecutiveRecords(idDirectivo);
    this.mostrarBusquedaDirectivo.set(false);
  }
}