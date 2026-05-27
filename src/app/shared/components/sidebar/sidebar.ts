import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideHome, LucideUsers, LucideGraduationCap, LucideBookOpen, LucideCalendar,
  LucideClipboardList, LucideTriangleAlert, LucideFileText, LucideBuilding,
  LucideLogOut, LucideChevronLeft, LucideChevronRight, LucideUserCircle, 
  LucideDynamicIcon,  
} from '@lucide/angular';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideDynamicIcon],  
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  authService = inject(AuthService);
  user = this.authService.user; 

  // Registro de iconos estáticos para usarlos en el template HTML
  icons = { 
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  };

  private navItems: NavItem[] = [
    { href: '/dashboard', label: 'Inicio', icon: LucideHome, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: LucideUsers, roles: ['admin'] },
    { href: '/dashboard/alumnos', label: 'Alumnos', icon: LucideGraduationCap, roles: ['admin', 'directivo'] },
    { href: '/dashboard/cursos', label: 'Cursos', icon: LucideBookOpen, roles: ['admin', 'directivo'] },
    { href: '/dashboard/horarios', label: 'Horarios', icon: LucideCalendar, roles: ['admin', 'directivo'] },
    { href: '/dashboard/expedientes', label: 'Expedientes', icon: LucideFileText, roles: ['admin', 'directivo'] },
    { href: '/dashboard/tareas', label: 'Tareas', icon: LucideClipboardList, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { href: '/dashboard/amonestaciones', label: 'Amonestaciones', icon: LucideTriangleAlert, roles: ['admin', 'directivo', 'profesor'] },
    { href: '/dashboard/mencion', label: 'Menciones', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
    { href: '/dashboard/probi', label: 'Probi', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
    { href: '/dashboard/previ', label: 'Previ', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
    { href: '/dashboard/aula_convivencia', label: 'Aula_convivencia', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
  ];

  filteredNavItems = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.navItems.filter((item) => item.roles.includes(currentUser.role));
  });

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      directivo: 'Directivo',
      profesor: 'Profesor',
      alumno: 'Alumno'
    };
    return labels[role] || role;
  }

  onLogout() {
    this.authService.logout();
  }
}