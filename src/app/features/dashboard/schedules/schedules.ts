import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideCalendar,
  LucideClock3,
  LucidePencil,
  LucideTrash2,
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
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ScheduleService } from '../../../core/services/schedules/schedule';
import { ActivatedRoute } from '@angular/router';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-schedules',
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css',
})
export class Schedules {

  authService = inject(AuthService);
  private scheduleService = inject(ScheduleService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash2
  };

  private butonItems: Buttons[] = [
    { label: 'Crear horario', icon: LucideCalendar, roles: ['admin'] },
    { label: 'Ver horarios', icon: LucideClock3, roles: ['admin', 'directivo', 'profesor'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  editMode = signal(false);
  schedules = signal<any[]>([]);
  selectedSchedule = signal<any>(null);
  searchTerm = signal('');

  filteredSchedules = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allSchedules = this.schedules();

    if (!term) return allSchedules;

    return allSchedules.filter(schedule =>
      schedule.formato?.toLowerCase().includes(term) ||
      schedule.hora_inicio?.toLowerCase().includes(term) ||
      schedule.hora_fin?.toLowerCase().includes(term) ||
      schedule.id?.toString().includes(term)
    );
  });

  scheduleForm: FormGroup = this.fb.group({
    formato: ['Presencial', Validators.required],
    hora_inicio: ['', Validators.required],
    hora_fin: ['', Validators.required]
  });

  toggleCrearHorario() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);
  }

  createSchedule() {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }
    const formValue = this.scheduleForm.value;
    const scheduleData = {
      formato: formValue.formato,
      hora_inicio: formValue.hora_inicio,
      hora_fin: formValue.hora_fin
    };

    this.scheduleService.createSchedule(scheduleData).subscribe({
      next: () => {
        alert('Horario creado correctamente');
        this.scheduleForm.reset({
          formato: 'Presencial',
          hora_inicio: '',
          hora_fin: ''
        });
      }
    });
  }

  loadSchedules() {
    this.scheduleService.getSchedules().subscribe({
      next: (data: any) => {
        this.schedules.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando horarios');
      }
    });
  }

  viewSchedule(schedule: any) {
    this.selectedSchedule.set({ ...schedule });
    this.editMode.set(false);
    this.mostrarDetalle.set(true);
  }

  enableEdit() {
    this.editMode.set(true);
  }

  saveSchedule() {
    const schedule = this.selectedSchedule();

    if (!schedule) return;

    const body = {
      formato: schedule.formato,
      hora_inicio: schedule.hora_inicio,
      hora_fin: schedule.hora_fin
    };

    this.scheduleService.updateSchedule(
      schedule.id,
      body
    ).subscribe({
      next: () => {
        alert('Horario actualizado');
        this.editMode.set(false);
        this.loadSchedules();
      },
      error: (error) => {
        console.error(error);
        alert('Error actualizando horario');
      }
    });
  }

  cancelEdit() {
    this.editMode.set(false);
  }

  deleteSchedule(schedule: any) {
    if (!confirm(`¿Eliminar horario ${schedule.formato}?`)) {
      return;
    }

    this.scheduleService.deleteSchedule(schedule.id).subscribe({
      next: () => {
        this.loadSchedules();
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedSchedule.set(null);
    this.editMode.set(false);
  }

  updateSearchTerm(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'list') {
        this.loadSchedules();
      }
    });
  }

}
