import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideFolderOpen,
  LucideFolders,
  LucideSearch,
  LucideScale,
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
  selector: 'app-records',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './records.html',
  styleUrl: './records.css',
})
export class Records {
  authService = inject(AuthService);
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  }

  private butonItems: Buttons[] = [
    { label: 'Crear expediente', icon: LucideFolderOpen, roles: ['admin', 'directivo'] },
    { label: 'Ver expedientes', icon: LucideFolders, roles: ['admin', 'directivo'] },
    { label: 'Ver expedintes por directivo', icon: LucideSearch, roles: ['admin', 'directivo'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}
