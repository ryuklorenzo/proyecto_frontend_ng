import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideBookOpen,
  LucideBook,
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
  selector: 'app-courses',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear cursor', icon: LucideBookOpen, roles: ['admin'] },
    { label: 'Ver cursos', icon: LucideBook, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver curso por ID', icon: LucideSearch, roles: ['admin', 'directivo'] },
    { label: 'Actualizar curso', icon: LucidePencil, roles: ['admin'] },
    { label: 'Borrar curso', icon: LucideTrash2, roles: ['admin'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
