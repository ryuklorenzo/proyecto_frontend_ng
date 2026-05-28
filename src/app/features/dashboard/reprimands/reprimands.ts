import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideTriangleAlert,
  LucideShieldAlert,
  LucideSearch,
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
  selector: 'app-reprimands',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './reprimands.html',
  styleUrl: './reprimands.css',
})
export class Reprimands {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear amonestacion', icon: LucideTriangleAlert, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver amonestaciones', icon: LucideShieldAlert, roles: ['admin', 'directivo'] },
    { label: 'Ver amonestacion por ID', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
