import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

import { AuthService, UserRole } from '../../../core/auth/auth';
import { AttitudeService } from '../../../core/services/attitudes/attitude';
import { StudentService } from '../../../core/services/students/student';
import { 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideLogOut, 
  LucideSearch, 
  LucideShieldAlert, 
  LucideTrash, 
  LucideUserCircle,
  LucideDynamicIcon, 
  LucideEye
} from '@lucide/angular';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-attitudes',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    LucideDynamicIcon
  ],
  templateUrl: './attitudes.html',
  styleUrl: './attitudes.css',
})
export class Attitudes implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private attitudeService = inject(AttitudeService);
  private studentService = inject(StudentService); 
  
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Eye: LucideEye,
    Trash: LucideTrash,
    Search: LucideSearch
  }

  private butonItems: Buttons[] = [
    { label: 'Crear actitud', icon: LucideShieldAlert, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver actitudes', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver por alumno', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarBusquedaAlumno = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  isShowingAll = signal(false);

  actitudes = signal<any[]>([]);
  alumnos = signal<any[]>([]);
  selectedActitud = signal<any>(null);
  alumnoSeleccionado = signal<number | null>(null);
  searchTerm = signal('');

  //cruzar actitudes con el nombre del alumno
  filteredActitudes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allAttitudes = this.actitudes();
    const allStudents = this.alumnos();

    const enrichedAttitudes = allAttitudes.map(act => {
      //cruzamos usando id_alumno o id_usuario según lo que devuelva tu backend
      const idEstudiante = act.id_alumno || act.id_usuario;
      const student = allStudents.find(s => Number(s.id) === Number(idEstudiante));
      
      return {
        ...act,
        nombre_alumno_completo: student ? `${student.nombre} ${student.apellidos}` : 'Desconocido'
      };
    });

    if (!term) return enrichedAttitudes;
    
    return enrichedAttitudes.filter((act: any) =>
      act.tipo?.toLowerCase().includes(term) ||
      act.descripcion?.toLowerCase().includes(term) ||
      act.fecha?.includes(term) ||
      act.nombre_alumno_completo?.toLowerCase().includes(term)
    );
  });

  attitudeForm: FormGroup = this.fb.group({
    tipo: ['', Validators.required],
    descripcion: ['', Validators.required],
    fecha: ['', Validators.required],
    id_alumno: [null, Validators.required]
  });

  ngOnInit() {
    this.cargarAlumnos();
  }

  cargarAlumnos() {
    this.studentService.getStudents().subscribe({
      next: (data: any) => this.alumnos.set(data),
      error: (err) => console.error('Error cargando alumnos', err)
    });
  }

  ocultarTodo() {
    this.mostrarFormulario.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarTabla.set(false);
  }

  toggleCrearActitud() {
    this.ocultarTodo();
    this.mostrarFormulario.set(true);
    this.cargarAlumnos();
  }

  showStudentSelector() {
    this.ocultarTodo();
    this.mostrarBusquedaAlumno.set(true);
    this.cargarAlumnos();
    this.actitudes.set([]);
    this.isShowingAll.set(false);
  }

  loadAttitudes() {
    this.ocultarTodo();
    this.cargarAlumnos();
    this.isShowingAll.set(true);
    
    this.attitudeService.getAttitudes().subscribe({
      next: (data: any) => {
        this.actitudes.set(data);
        this.mostrarTabla.set(true);
      },
      error: (err) => {
        if (err.status === 404) {
          this.actitudes.set([]);
          this.mostrarTabla.set(true);
        } else {
          console.error(err);
          alert('Error cargando las actitudes');
        }
      }
    });
  }

  createAttitude() {
    if (this.attitudeForm.invalid) {
      this.attitudeForm.markAllAsTouched();
      return;
    }

    const formValue = this.attitudeForm.value;
    const dataToSave = {
      tipo: formValue.tipo,
      descripcion: formValue.descripcion,
      fecha: formValue.fecha
    };

    this.attitudeService.createAttitude(formValue.id_alumno, dataToSave).subscribe({
      next: (response) => {
        console.log(response);
        this.attitudeForm.reset({ id_alumno: null });
        alert('Actitud creada correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando la actitud');
      }
    });
  }

  buscarActitudesAlumno() {
    const idAlumno = this.alumnoSeleccionado();
    if (!idAlumno) {
      alert('Selecciona un alumno');
      return;
    }
    
    this.attitudeService.getAttituddesByStudent(idAlumno).subscribe({
      next: (data: any) => {
        this.actitudes.set(data);
        this.mostrarTabla.set(true);
      },
      error: (err) => {
        if (err.status === 404) {
          this.actitudes.set([]);
          this.mostrarTabla.set(true);
        } else {
          console.error(err);
          alert('Error cargando actitudes del alumno');
        }
      }
    });
  }

  viewAttitude(actitud: any) {
    this.selectedActitud.set(JSON.parse(JSON.stringify(actitud)));
    this.mostrarDetalle.set(true);
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedActitud.set(null);
  }

  deleteAttitude(actitud: any) {
    const confirmar = confirm(`¿Estás seguro de eliminar esta actitud?`);
    if (!confirmar) return;
    
    this.attitudeService.deleteAttitude(actitud.id).subscribe({
      next: () => {
        alert('Actitud eliminada correctamente');
        this.actitudes.set(this.actitudes().filter((a: any) => a.id !== actitud.id));
      },
      error: (err) => {
        if (err.status === 409) {
          alert('No se puede borrar la actitud porque tiene una amonestación o reconocimiento asociado.');
        } 
        else if (err.status === 404) {
          alert('La actitud no fue encontrada (es posible que ya haya sido borrada).');
        } 
        else {
          console.error(err);
          alert('Error desconocido eliminando la actitud.');
        }
      }
    });
  }

  hasErrorForm(field: string): boolean {
    const control = this.attitudeForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}