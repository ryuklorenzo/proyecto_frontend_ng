import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideGraduationCap,
  LucideUsers,
  LucideUserSearch,
  LucideUserX,
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
  selector: 'app-students',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear alumno', icon: LucideGraduationCap, roles: ['admin'] },
    { label: 'Ver alumnos', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver alumno por ID', icon: LucideUserSearch, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Dar baja alumno', icon: LucideUserX, roles: ['admin', 'directivo'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
