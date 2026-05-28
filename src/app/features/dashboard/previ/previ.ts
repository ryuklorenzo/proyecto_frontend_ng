import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideFileWarning,
  LucideFiles,
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
  selector: 'app-previ',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './previ.html',
  styleUrl: './previ.css',
})
export class Previ {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear previ', icon: LucideFileWarning, roles: ['admin', 'directivo'] },
    { label: 'Ver previs', icon: LucideFiles, roles: ['admin', 'directivo'] },
    { label: 'Ver previ por ID', icon: LucideSearch, roles: ['admin', 'directivo'] },
    { label: 'Actualizar previ', icon: LucidePencil, roles: ['admin', 'directivo'] },
    { label: 'Borrar previ', icon: LucideTrash2, roles: ['admin'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
