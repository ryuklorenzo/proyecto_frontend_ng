import { Component, inject, computed } from '@angular/core';
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

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}
@Component({
  selector: 'app-tasks',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {

  authService = inject(AuthService);
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
}
