import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideStar,
  LucideSparkles,
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
  selector: 'app-probi',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './probi.html',
  styleUrl: './probi.css',
})
export class Probi {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear probi', icon: LucideStar, roles: ['admin', 'directivo'] },
    { label: 'Ver probis', icon: LucideSparkles, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver probi por ID', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Actualizar probi', icon: LucidePencil, roles: ['admin', 'directivo'] },
    { label: 'Borrar probi', icon: LucideTrash2, roles: ['admin'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
