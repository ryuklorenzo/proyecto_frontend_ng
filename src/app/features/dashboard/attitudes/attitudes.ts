import { Component, computed, inject, signal, effect } from '@angular/core';
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
export class Attitudes {
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

  // cruzar actitudes con el nombre del alumno
  filteredActitudes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allAttitudes = this.actitudes();
    const allStudents = this.alumnos();

    const enrichedAttitudes = allAttitudes.map(act => {
      const idEstudiante = act.id_alumno || act.id_usuario; //busca por id_alumno o por id_usuario
      const student = allStudents.find(s => Number(s.id) === Number(idEstudiante));
      
      return {
        ...act,
        nombre_alumno_completo: student ? `${student.nombre} ${student.apellidos}` : 'Desconocido'
      };
      // si lo encuentra devuelve nombre y apellidos
    });

    if (!term) return enrichedAttitudes; 
    //si no hay busqueda, devuelve solo las enriquecidas
    return enrichedAttitudes.filter((act: any) =>
      act.tipo?.toLowerCase().includes(term) || //tipo actitud
      act.descripcion?.toLowerCase().includes(term) || //descripcion de actitud
      act.fecha?.includes(term) || //fecha actitud
      act.nombre_alumno_completo?.toLowerCase().includes(term) //nombre estudiante completo
    );
  });

  //form
  attitudeForm: FormGroup = this.fb.group({
    tipo: ['', Validators.required],
    descripcion: ['', Validators.required],
    fecha: [new Date().toISOString().split('T')[0], Validators.required],
    id_alumno: [null, Validators.required]
  });

  constructor() {
    //sin esto da CC y no se ejecuta antes
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.cargarAlumnos();
      }
    });
  }

  cargarAlumnos() {
    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        // Aseguramos que data es un array por si acaso
        const lista = Array.isArray(data) ? data : [];
        this.alumnos.set(lista);
      },
      error: (err) => console.error('Error cargando alumnos', err)
    });
  }

  ocultarTodo() {
    //no tiene misterio
    this.mostrarFormulario.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarTabla.set(false);
  }

  toggleCrearActitud() {
    this.ocultarTodo();
    this.mostrarFormulario.set(true);
    this.cargarAlumnos();
    this.attitudeForm.reset({
      fecha: new Date().toISOString().split('T')[0],
      id_alumno: null
    });
  }

  showStudentSelector() {
    this.ocultarTodo();
    this.actitudes.set([]);
    this.isShowingAll.set(false);

    const currentUser = this.user();

    // Comprobamos si el usuario logueado es un alumno
    if (currentUser?.role === 'alumno') {
      this.mostrarBusquedaAlumno.set(false);
      
      if (currentUser.id) {
        this.alumnoSeleccionado.set(currentUser.id);
        
        this.attitudeService.getAttituddesByStudent(currentUser.id).subscribe({
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
              alert('Error cargando tus actitudes');
            }
          }
        });
        
      } else {
        alert('Error: No se pudo identificar tu ID de alumno.');
      }
    } else {
      this.mostrarBusquedaAlumno.set(true);
      this.cargarAlumnos();
    }
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
      //simplemente recordarle que tiene que rellenarlo entero
      return;
    }

    const formValue = this.attitudeForm.value;
    //datos a enviar
    const dataToSave = {
      tipo: formValue.tipo,
      descripcion: formValue.descripcion,
      fecha: formValue.fecha
    };

    //llamada api
    this.attitudeService.createAttitude(formValue.id_alumno, dataToSave).subscribe({
      next: (response) => {
        this.attitudeForm.reset({ 
          fecha: new Date().toISOString().split('T')[0],
          id_alumno: null 
        });
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