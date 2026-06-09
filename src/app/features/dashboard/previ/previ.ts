import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideShieldAlert,
  LucideShield,
  LucideSearch,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucidePencil,
  LucideTrash,
  LucideDynamicIcon,
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PreviService } from '../../../core/services/previ/previ';
import { RecordService } from '../../../core/services/records/record';
import { ExecutiveService } from '../../../core/services/executives/executive';
import { StudentService } from '../../../core/services/students/student';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-previ',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './previ.html',
  styleUrl: './previ.css',
})
export class Previ implements OnInit {

  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  private previService = inject(PreviService);
  private recordService = inject(RecordService);
  private executiveService = inject(ExecutiveService);
  private studentService = inject(StudentService);

  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash
  }

  private butonItems: Buttons[] = [
    { label: 'Crear previ', icon: LucideShieldAlert, roles: ['admin', 'directivo'] },
    { label: 'Ver previs', icon: LucideShield, roles: ['admin', 'directivo'] },
    { label: 'Ver por expediente', icon: LucideSearch, roles: ['admin', 'directivo'] },
    { label: 'Ver por directivo', icon: LucideSearch, roles: ['admin', 'directivo'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  mostrarBusquedaExpediente = signal(false);
  mostrarBusquedaDirectivo = signal(false);
  editMode = signal(false);

  previs = signal<any[]>([]);
  selectedPrevi = signal<any>(null);
  searchTerm = signal('');

  expedientes = signal<any[]>([]);
  expedienteSeleccionado = signal<number | null>(null);

  directivos = signal<any[]>([]);
  directivoSeleccionado = signal<number | null>(null);

  alumnos = signal<any[]>([]);
  ngOnInit() {
    this.cargarDatosBase();
  }

  //cargamos los datos de cada uno
  cargarDatosBase() {
    this.studentService.getStudents().subscribe({ next: (data: any) => this.alumnos.set(data) });
    this.executiveService.getExecutives().subscribe({ next: (data: any) => this.directivos.set(data) });
    this.recordService.getRecords().subscribe({ next: (data: any) => this.expedientes.set(data) });
  }

  //mappear el expediente con el id del alumno
  expedientesDetallados = computed(() => {
    const records = this.expedientes();
    const students = this.alumnos();

    return records.map(record => {
      const student = students.find((s: any) => s.id === record.id_alumno);
      return {
        ...record,
        nombre_alumno: student ? student.nombre : 'Desconocido',
        apellidos_alumno: student ? student.apellidos : ''
      };
    });
  });

  // Cruzar el previ con directivos y expedientesDetallados para la Tabla
  filteredPrevis = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const records = this.expedientesDetallados();
    const execs = this.directivos();

    const enrichedPrevis = this.previs().map(previ => {
      const exec = execs.find(e => e.id === previ.id_directivo);
      const rec = records.find(r => r.id === previ.id_expediente);

      return {
        ...previ,
        nombre_directivo_completo: exec ? `${exec.nombre} ${exec.apellidos}` : 'Desconocido',
        cargo_directivo: exec ? exec.cargo : 'Sin cargo',
        nombre_alumno_completo: rec ? `${rec.nombre_alumno} ${rec.apellidos_alumno}` : 'Desconocido',
        id_alumno_real: rec ? rec.id_alumno : ''
      };
    });

    if (!term) return enrichedPrevis;

    return enrichedPrevis.filter((previ: any) =>
      previ.detalle?.toLowerCase().includes(term) ||
      previ.nombre_directivo_completo?.toLowerCase().includes(term) ||
      previ.nombre_alumno_completo?.toLowerCase().includes(term) ||
      previ.id_expediente?.toString().includes(term)
    );
  });

  previForm: FormGroup = this.fb.group({
    detalle: ['', Validators.required],
    fecha: [new Date().toISOString().split('T')[0], Validators.required],
    idDirectivo: [null, Validators.required],
    idExpediente: [null, Validators.required]
  });

  toggleCrearPrevi() {
    this.mostrarTabla.set(false);
    this.mostrarBusquedaExpediente.set(false);
    this.mostrarBusquedaDirectivo.set(false);
    this.mostrarFormulario.set(true);
    this.cargarDatosBase();
    const currentUser = this.user();
    
    this.previForm.reset({
      detalle: '',
      fecha: new Date().toISOString().split('T')[0],
      idDirectivo: currentUser?.role === 'directivo' && currentUser.id ? currentUser.id : null,
      idExpediente: null
    });
  }

  createPrevi() {
    if (this.previForm.invalid) {
      this.previForm.markAllAsTouched();
      return;
    }

    const formValue = this.previForm.value;
    const previData = {
      detalle: formValue.detalle,
      fecha: formValue.fecha
    };

    this.previService.createPrevi(formValue.idDirectivo, formValue.idExpediente, previData).subscribe({
      next: () => {
        const currentUser = this.user();
        this.previForm.reset({ 
          detalle: '',
          fecha: new Date().toISOString().split('T')[0],
          idDirectivo: currentUser?.role === 'directivo' && currentUser.id ? currentUser.id : null,
          idExpediente: null 
        });
        alert('Previ creado correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando el previ');
      }
    });
  }

  loadAllPrevis() {
    this.mostrarFormulario.set(false);
    this.mostrarBusquedaExpediente.set(false);
    this.mostrarBusquedaDirectivo.set(false);
    this.cargarDatosBase();

    this.previService.getPrevis().subscribe({
      next: (data: any) => {
        this.previs.set(data);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando previs');
      }
    });
  }

  showExpedienteSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaDirectivo.set(false);
    this.mostrarBusquedaExpediente.set(true);
    this.cargarDatosBase();
  }

  buscarPrevisExpediente() {
    const idExpediente = this.expedienteSeleccionado();
    if (!idExpediente) {
      alert('Selecciona un expediente');
      return;
    }

    this.previService.getPrevisByExpediente(idExpediente).subscribe({
      next: (data: any) => {
        this.previs.set(data);
        this.mostrarBusquedaExpediente.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => alert('Error cargando previs del expediente')
    });
  }

  showExecutiveSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaExpediente.set(false);
    const currentUser = this.user();
    if (currentUser?.role === 'directivo') {
      this.mostrarBusquedaDirectivo.set(false);
      if (currentUser.id) {
        this.directivoSeleccionado.set(currentUser.id);
        this.loadDirectivoPrevis(currentUser.id);
      }
    } else {
      this.mostrarBusquedaDirectivo.set(true);
      this.cargarDatosBase();
    }
  }

  buscarPrevisDirectivo() {
    const idDirectivo = this.directivoSeleccionado();
    if (!idDirectivo) {
      alert('Selecciona un directivo');
      return;
    }

    this.previService.getPrevisByDirectivo(idDirectivo).subscribe({
      next: (data: any) => {
        this.previs.set(data);
        this.mostrarBusquedaDirectivo.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => alert('Error cargando previs del directivo')
    });
  }

  viewPrevi(previ: any) {
    this.selectedPrevi.set(JSON.parse(JSON.stringify(previ)));
    this.mostrarDetalle.set(true);
    this.editMode.set(false);
  }

  deletePrevi(previ: any) {
    const confirmar = confirm(`¿Estás seguro de eliminar el previ #${previ.id}?`);
    if (!confirmar) return;

    this.previService.deletePrevi(previ.id).subscribe({
      next: () => {
        alert('Previ eliminado correctamente');
        this.previs.set(this.previs().filter(p => p.id !== previ.id));
      },
      error: (error) => {
        console.error(error);
        alert('Error eliminando el previ');
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedPrevi.set(null);
    this.editMode.set(false);
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelEdit() {
    this.closeModal();
  }

  savePrevi() {
    const previData = {
      detalle: this.selectedPrevi().detalle,
      fecha: this.selectedPrevi().fecha
    };

    this.previService.updatePrevi(this.selectedPrevi().id, previData).subscribe({
      next: () => {
        alert('Previ actualizado correctamente');
        this.editMode.set(false);
        this.closeModal();
        this.loadAllPrevis();
      },
      error: (error) => {
        console.error(error);
        alert('Error actualizando el previ');
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.previForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  loadDirectivoPrevis(idDirectivo: number) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);
    this.previService.getPrevisByDirectivo(idDirectivo).subscribe({
      next: (data: any) => {
        this.previs.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando previs del directivo');
      }
    });
  }

}