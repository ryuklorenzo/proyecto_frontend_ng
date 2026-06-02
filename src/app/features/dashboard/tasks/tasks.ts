import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideClipboardList,
  LucideUsers,
  LucideUser,
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
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear tarea', icon: LucideClipboardList, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver tareas alumno', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { label: 'Ver tareas profesor', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor'] },
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

  toggleCrearTarea() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);
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
      next: (response) => {
        console.log(response);

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

  loadStudentTasks(idAlumno: number = 1) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);

    this.taskService.getTasksByStudent(idAlumno).subscribe({
      next: (data: any) => {
        this.tasks.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando tareas');
      }
    });
  }

  loadTeachersTasks(idProfesor: number = 1) {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(true);

    this.taskService.getTasksByTeacher(idProfesor).subscribe({
      next: (data: any) => {
        this.tasks.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando tareas');
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
    this.mostrarBusquedaAlumno.set(true);

    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        this.alumnos.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando alumnos');
      }
    });
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
    this.mostrarBusquedaProfesor.set(true);

    this.teacherService.getTeachers().subscribe({
      next: (data: any) => {
        this.profesores.set(data);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando profesores');
      }
    });
  }

  buscarTareasProfesor() {

    const idProfesor = this.profesorSeleccionado();

    if (!idProfesor) {
      alert('Selecciona un profesor');
      return;
    }

    this.loadStudentTasks(idProfesor);
    this.mostrarBusquedaAlumno.set(false);
  }

}
