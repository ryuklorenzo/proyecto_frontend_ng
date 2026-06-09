import { Component, inject, computed, signal, effect } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideClipboardList,
  LucideUsers,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
  LucideEye,
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TaskService } from '../../../core/services/tasks/task';
import { StudentService } from '../../../core/services/students/student';
import { TeacherService } from '../../../core/services/teachers/teacher';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {

  authService = inject(AuthService);
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Eye: LucideEye,
  }

  private butonItems: Buttons[] = [
    { label: 'Crear tarea', icon: LucideClipboardList, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver tareas alumno', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { label: 'Ver tareas profesor', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  tasks = signal<any[]>([]);
  selectedTask = signal<any>(null);
  searchTerm = signal('');

  alumnos = signal<any[]>([]);
  alumnoSeleccionado = signal<number | null>(null);
  mostrarBusquedaAlumno = signal(false);

  profesores = signal<any[]>([]);
  profesorSeleccionado = signal<number | null>(null);
  mostrarBusquedaProfesor = signal(false);

  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.tasks();
    return this.tasks().filter((task: any) =>
      task.descripcion?.toLowerCase().includes(term) ||
      task.estado?.toLowerCase().includes(term)
    );
  });

  taskForm: FormGroup = this.fb.group({
    descripcion: ['', Validators.required],
    estado: ['PENDIENTE', Validators.required],
    idProfesor: [null, Validators.required],
    idAlumno: [null, Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.cargarDatosBase();
      }
    });
  }

  cargarDatosBase() {
    this.studentService.getStudents().subscribe({
      //desplegable alumno
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : [];
        this.alumnos.set(lista);
      },
      error: (err) => console.error('Error cargando alumnos:', err)
    });

    this.teacherService.getTeachers().subscribe({
      //desplegable profesor
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : [];
        this.profesores.set(lista);
      },
      error: (err) => console.error('Error cargando profesores:', err)
    });
  }

  toggleCrearTarea() {
    this.mostrarTabla.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarBusquedaProfesor.set(false);
    this.mostrarFormulario.set(true);

    this.cargarDatosBase();
    const currentUser = this.user();
    //ponemos el id directamente al form
    if (currentUser?.role === 'profesor' && currentUser.id) {
      this.taskForm.patchValue({
        idProfesor: currentUser.id
      });
    } else {
      // Si no es profesor, dejamos campo limpio
      this.taskForm.patchValue({
        idProfesor: null
      });
    }
  }

  createTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    const taskData = {
      descripcion: formValue.descripcion,
      estado: formValue.estado
    };
    
    this.taskService.createTask(
      formValue.idProfesor,
      formValue.idAlumno,
      taskData
    ).subscribe({
      next: () => {
        this.taskForm.reset({
          estado: 'PENDIENTE',
          idProfesor: null,
          idAlumno: null
        });

        alert('Tarea creada correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando tarea');
      }
    });
  }

  loadStudentTasks(idAlumno: number) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);
    this.taskService.getTasksByStudent(idAlumno).subscribe({
      next: (data: any) => {
        this.tasks.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando tareas del alumno');
      }
    });
  }

  loadTeachersTasks(idProfesor: number) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);

    this.taskService.getTasksByTeacher(idProfesor).subscribe({
      next: (data: any) => {
        this.tasks.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando tareas del profesor');
      }
    });
  }

  viewTask(task: any) {
    this.selectedTask.set(task);
    this.mostrarDetalle.set(true);
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedTask.set(null);
  }

  hasError(field: string): boolean {
    const control = this.taskForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  showStudentSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaProfesor.set(false);

    const currentUser = this.user();
    // Comprobamos si es un alumno
    if (currentUser?.role === 'alumno') {
      this.mostrarBusquedaAlumno.set(false);
      
      if (currentUser.id) {
        this.alumnoSeleccionado.set(currentUser.id);
        this.loadStudentTasks(currentUser.id); // Cargamos sus tareas directamente
      } else {
        alert('Error: No se pudo identificar tu ID de alumno.');
      }
    } else {
      this.mostrarBusquedaAlumno.set(true);
      this.cargarDatosBase();
    }
  }

  buscarTareasAlumno() {
    const idAlumno = this.alumnoSeleccionado();
    if (!idAlumno) {
      alert('Selecciona un alumno');
      return;
    }
    this.loadStudentTasks(idAlumno);
    this.mostrarBusquedaAlumno.set(false);
  }

  showTeacherSelector() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaAlumno.set(false);
    this.mostrarBusquedaProfesor.set(false);

    const currentUser = this.user();

    //comprobamos si el usuario logueado es un profesor
    if (currentUser?.role === 'profesor') {
      this.mostrarBusquedaAlumno.set(false); //ocultamos el buscador de profesor
      if (currentUser.id) {
        this.profesorSeleccionado.set(currentUser.id);
        this.loadTeachersTasks(currentUser.id); //cargamos sus tareas directamente
      } else {
        alert('Error: No se pudo identificar tu ID de alumno.');
      }
    } else {
      this.mostrarBusquedaProfesor.set(true);
      this.cargarDatosBase();
    }

  }

  buscarTareasProfesor() {
    const idProfesor = this.profesorSeleccionado();
    if (!idProfesor) {
      alert('Selecciona un profesor');
      return;
    }
    this.loadTeachersTasks(idProfesor);
    this.mostrarBusquedaProfesor.set(false);
  }
}