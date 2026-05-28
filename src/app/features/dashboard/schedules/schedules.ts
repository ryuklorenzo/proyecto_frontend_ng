import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideCalendar,
  LucideClock3,
  LucideSearch,
  LucidePencil,
  LucideTrash2,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
} from '@lucide/angular';

import { CommonModule } from '@angular/common';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-schedule',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css',
})
export class Schedules {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear horario', icon: LucideCalendar, roles: ['admin'] },
    { label: 'Ver horarios', icon: LucideClock3, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Actualizar horario', icon: LucidePencil, roles: ['admin'] },
    { label: 'Borrar horario', icon: LucideTrash2, roles: ['admin'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
