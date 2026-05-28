import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideSchool,
  LucideUsers,
  LucideSearch,
  LucidePencil,
  LucideTrash2,
  LucideUserPlus,
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
  selector: 'app-aula-convivencia',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './aula-convivencia.html',
  styleUrl: './aula-convivencia.css',
})
export class AulaConvivencia {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear aula', icon: LucideSchool, roles: ['admin', 'directivo'] },
    { label: 'Ver aulas', icon: LucideUsers, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver aula por ID', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Actualizar aula', icon: LucidePencil, roles: ['admin', 'directivo'] },
    { label: 'Borrar aula', icon: LucideTrash2, roles: ['admin'] },
    { label: 'Asignar alumnos', icon: LucideUserPlus, roles: ['admin', 'directivo', 'profesor'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
