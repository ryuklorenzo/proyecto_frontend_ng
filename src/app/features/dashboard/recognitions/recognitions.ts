import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideAward,
  LucideBadgeCheck,
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
  selector: 'app-recognitions',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './recognitions.html',
  styleUrl: './recognitions.css',
})
export class Recognitions {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear mención', icon: LucideAward, roles: ['admin', 'directivo'] },
    { label: 'Ver menciones', icon: LucideBadgeCheck, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver mencion por ID', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Actualizar mención', icon: LucidePencil, roles: ['admin', 'directivo'] },
    { label: 'Borrar mención', icon: LucideTrash2, roles: ['admin'] },
    { label: 'Ver menciones por reconocimiento', icon: LucideSearch, roles: ['admin', 'directivo'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
