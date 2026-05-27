import { Component, inject, computed } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideHome, LucideUsers, LucideGraduationCap, LucideBookOpen, LucideCalendar,
  LucideClipboardList, LucideTriangleAlert, LucideFileText, LucideBuilding,
  LucideLogOut, LucideChevronLeft, LucideChevronRight, LucideUserCircle, 
  LucideDynamicIcon,  
} from '@lucide/angular';
import { CommonModule } from '@angular/common';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-executives',
  imports: [LucideDynamicIcon, CommonModule],
  templateUrl: './executives.html',
  styleUrl: './executives.css',
})
export class Executives {
  // 1. Inyectamos el servicio para saber quién está logueado
  authService = inject(AuthService);
  user = this.authService.user;

  icons = { 
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  };

  private butonItems: Buttons[] = [
    { label: 'Crear', icon: LucideHome, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { label: 'Ver todos', icon: LucideGraduationCap, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver por Id', icon: LucideUsers, roles: ['admin'] },
    { label: 'Actualizar', icon: LucideGraduationCap, roles: ['admin', 'directivo'] },
    { label: 'Borrar', icon: LucideGraduationCap, roles: ['admin', 'directivo'] },
  ];

  // 2. Filtramos la lista según el rol del usuario (igual que en el sidebar)
  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });
}