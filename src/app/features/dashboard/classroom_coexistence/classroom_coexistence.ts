import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideSchool,
  LucideUsers,
  LucidePencil,
  LucideTrash2,
  LucideUserPlus,
  LucideUser,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideLogOut,
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
import { ClassroomService } from '../../../core/services/classroom_coexistence/classroom_coexistence';
import { ScheduleService } from '../../../core/services/schedules/schedule';
import { StudentService } from '../../../core/services/students/student';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-classroom_coexistence',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './classroom_coexistence.html',
  styleUrl: './classroom_coexistence.css',
})
export class Classroom_coexistence implements OnInit {

  authService = inject(AuthService);
  private classroomService = inject(ClassroomService);
  private scheduleService = inject(ScheduleService);
  private studentService = inject(StudentService);
  private fb = inject(FormBuilder);
  
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash2
  }

  private butonItems: Buttons[] = [
    { label: 'Crear aula', icon: LucideSchool, roles: ['admin', 'directivo'] },
    { label: 'Ver aulas', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Asignar alumnos', icon: LucideUserPlus, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver alumnos en el aula de convivencia', icon: LucideUser, roles: ['admin', 'directivo', 'profesor'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarAsignar = signal(false);
  mostrarVerAlumnos = signal(false);
  mostrarDetalle = signal(false);

  aulas = signal<any[]>([]);
  horarios = signal<any[]>([]);
  alumnos = signal<any[]>([]);
  
  selectedClassroom = signal<any>(null);
  alumnosEnAula = signal<any[]>([]); 
  aulaSeleccionadaId = signal<number | null>(null);

  searchTerm = signal('');

  alumnosOcupadosIds = signal<number[]>([]);
  alumnosLibres = computed(() => {
    const todosLosAlumnos = this.alumnos();
    const ocupados = this.alumnosOcupadosIds();
    return todosLosAlumnos.filter(alumno => !ocupados.includes(alumno.id));
  });

  filteredAulas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allAulas = this.aulas();
    const allHorarios = this.horarios();
    
    // Cruzamos los datos de cada aula con su horario correspondiente
    const aulasDetalladas = allAulas.map((aula: any) => {
      const horarioAsignado = allHorarios.find(h => h.id === aula.id_horario); //busca por por el id_horario
      
      return {
        ...aula,
        horario_completo: horarioAsignado 
          ? `Horario #${horarioAsignado.id} - ${horarioAsignado.formato} (${horarioAsignado.hora_inicio} - ${horarioAsignado.hora_fin})` 
          : `Horario ID: #${aula.id_horario}`
      };
    });
    //devuelve con los datos del horario

    if (!term) return aulasDetalladas;
    
    return aulasDetalladas.filter((aula: any) =>
      aula.fecha?.includes(term) ||
      aula.id?.toString().includes(term) ||
      aula.nombre?.toLowerCase().includes(term)
    );
  });

  // Computado para cruzar los datos de alumnos en el aula con sus nombres reales
  alumnosEnAulaDetallados = computed(() => {
    const rawStudents = this.alumnosEnAula();
    const allStudents = this.alumnos();

    return rawStudents.map(rs => {
      const studentId = rs.id_alumno || rs.id; 
      const realStudent = allStudents.find(s => s.id === studentId);
      
      return {
        ...rs,
        id_alumno_real: studentId,
        nombre_completo: realStudent ? `${realStudent.nombre} ${realStudent.apellidos}` : 'Desconocido'
      };
    });// devuelve nombre y apellidos + ID
  });

  //form
  classroomForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    fecha: [new Date().toISOString().split('T')[0], Validators.required],
    id_horario: [null, Validators.required]
  });
  assignForm: FormGroup = this.fb.group({
    id_aula_convivencia: [null, Validators.required],
    alumnos_ids: [[], Validators.required] 
  });

  ngOnInit() {
    this.cargarDatosBase();
  }

  //cargamos los datos
  cargarDatosBase() {
    this.scheduleService.getSchedules().subscribe({ next: (data: any) => this.horarios.set(data) });
    this.studentService.getStudents().subscribe({ next: (data: any) => this.alumnos.set(data) });
    this.classroomService.getClassrooms().subscribe({ next: (data: any) => this.aulas.set(data) });
  }

  ocultarTodo() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarAsignar.set(false);
    this.mostrarVerAlumnos.set(false);
  }

  toggleCrearAula() {
    this.ocultarTodo();
    this.mostrarFormulario.set(true);
    this.cargarDatosBase();
    this.classroomForm.reset({//datos vacios, + fecha actual
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      id_horario: null
    });
  }

  loadClassrooms() {
    this.ocultarTodo();
    this.cargarDatosBase();
    this.mostrarTabla.set(true);
  }

  toggleAsignarAlumnos() {
    this.ocultarTodo();
    this.mostrarAsignar.set(true);
    this.cargarDatosBase();
    this.assignForm.reset({ id_aula_convivencia: null, alumnos_ids: [] });

    // Cargar alumnos ocupados en aulas para filtrarlos del select
    this.classroomService.getClassrooms().subscribe({
      //obetener las aulas
      next: (aulas: any) => { 
        let ocupadosTemp: number[] = [];
        let peticionesCompletadas = 0;

        if (aulas.length === 0) {
          this.alumnosOcupadosIds.set([]);
          return;
        }

        aulas.forEach((aula: any) => {
          this.classroomService.getStudentsByClassroom(aula.id).subscribe({
            //pide los alumnos en aulas
            next: (estudiantesDelAula: any) => { 
              const ids = estudiantesDelAula.map((e: any) => e.id_alumno || e.id);
              ocupadosTemp = [...ocupadosTemp, ...ids];//añade los id de alumno que encuentra
              peticionesCompletadas++;
              
              if (peticionesCompletadas === aulas.length) {
                this.alumnosOcupadosIds.set([...new Set(ocupadosTemp)]); 
              }
            },
            error: () => {
              peticionesCompletadas++;
              if (peticionesCompletadas === aulas.length) {
                this.alumnosOcupadosIds.set([...new Set(ocupadosTemp)]); 
              }
            }
          });
        });
      }
    });
  }

  toggleVerAlumnos() {
    this.ocultarTodo();
    this.mostrarVerAlumnos.set(true);
    this.cargarDatosBase();
    this.alumnosEnAula.set([]);
    this.aulaSeleccionadaId.set(null);
  }

  createClassroom() {
    if (this.classroomForm.invalid) {
      this.classroomForm.markAllAsTouched();
      return;
    }

    const formValue = this.classroomForm.value;
    const classroomData = {
      nombre: formValue.nombre,
      fecha: formValue.fecha
    };

    this.classroomService.createClassroom(formValue.id_horario, classroomData).subscribe({
      next: () => {
        this.classroomForm.reset({ 
          nombre: '',
          fecha: new Date().toISOString().split('T')[0],
          id_horario: null 
        });
        alert('Aula de convivencia creada correctamente');
        this.cargarDatosBase();
      },
      error: (error) => {
        console.error(error);
        alert('Error creando el aula');
      }
    });
  }

  viewClassroom(classroom: any) {
    this.selectedClassroom.set(JSON.parse(JSON.stringify(classroom))); 
    this.mostrarDetalle.set(true);
  }

  saveClassroom() {
    const idHorarioSeleccionado = this.selectedClassroom().id_horario;

    const dataToSave = {
      nombre: this.selectedClassroom().nombre,
      fecha: this.selectedClassroom().fecha
    };

    this.classroomService.updateClassroom(
      this.selectedClassroom().id, 
      idHorarioSeleccionado, 
      dataToSave
    ).subscribe({
      next: () => {
        alert('Aula actualizada correctamente');
        this.closeModal();
        this.loadClassrooms();
      },
      error: (err) => {
        console.error(err);
        alert('Error actualizando el aula');
      }
    });
  }

  deleteClassroom(classroom: any) {
    const confirmar = confirm(`¿Estás seguro de eliminar el aula de convivencia "${classroom.nombre}"?`);
    if (!confirmar) return;
    
    this.classroomService.deleteClassroom(classroom.id).subscribe({
      next: () => {
        alert('Aula eliminada correctamente');
        this.loadClassrooms();
      },
      error: (error) => {
        console.error(error);
        alert('Error eliminando el aula');
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedClassroom.set(null);
  }

  assignStudentsToAula() {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    const payload = this.assignForm.value; 
    payload.alumnos_ids = payload.alumnos_ids.map((id: string | number) => Number(id));
    //para que llegue como lo espera el back

    this.classroomService.assignStudents(payload).subscribe({
      next: () => {
        alert('Alumnos asignados correctamente al aula');
        this.assignForm.reset({ id_aula_convivencia: null, alumnos_ids: [] });
        this.toggleAsignarAlumnos(); 
      },
      error: (err) => {
        console.error(err);
        alert('Error al asignar alumnos');
      }
    });
  }

  buscarAlumnosEnAula() {
    const idAula = this.aulaSeleccionadaId();
    if (!idAula) {
      alert('Selecciona un aula primero');
      return;
    }

    this.classroomService.getStudentsByClassroom(idAula).subscribe({
      next: (data: any) => {
        this.alumnosEnAula.set(data);
      },
      error: (err) => {
        console.error(err);
        alert('Error obteniendo los alumnos del aula');
      }
    });
  }

  removeStudentFromAula(alumnoDetallado: any) {
    const confirmar = confirm(`¿Estás seguro de sacar a ${alumnoDetallado.nombre_completo} de este aula?`);
    if (!confirmar) return;

    const idAula = this.aulaSeleccionadaId()!;
    const idAlumno = alumnoDetallado.id_alumno_real;

    this.classroomService.removeStudent(idAula, idAlumno).subscribe({
      next: () => {
        alert('Alumno retirado del aula correctamente');
        this.buscarAlumnosEnAula(); 
      },
      error: (err) => {
        console.error(err);
        alert('Error al sacar al alumno del aula');
      }
    });
  }

  hasErrorForm(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}