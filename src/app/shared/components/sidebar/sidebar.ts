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
export class Sidebar {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  authService = inject(AuthService);
  user = this.authService.user; 
  mostrarLogoutModal = false;

  // Registro de iconos estáticos para usarlos en el template HTML
  icons = { 
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut
  };

  //TODO verificar permisos de cada campo
  private navItems: NavItem[] = [
    { href: '/dashboard', label: 'Inicio', icon: LucideHome, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { href: '/dashboard/courses', label: 'Cursos', icon: LucideBookOpen, roles: ['admin'] },
    { href: '/dashboard/schedules', label: 'Horarios', icon: LucideCalendar, roles: ['admin'] },
    { href: '/dashboard/students', label: 'Alumnos', icon: LucideGraduationCap, roles: ['admin', 'directivo'] },
    { href: '/dashboard/teachers', label: 'Profesores', icon: LucideGraduationCap, roles: ['admin', 'directivo'] },
    { href: '/dashboard/executives', label: 'Directivos', icon: LucideGraduationCap, roles: ['admin'] },
    { href: '/dashboard/tasks', label: 'Tareas', icon: LucideClipboardList, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { href: '/dashboard/records', label: 'Expedientes', icon: LucideFileText, roles: ['admin', 'directivo'] },
    { href: '/dashboard/previ', label: 'Previ', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
    { href: '/dashboard/attitudes', label: 'Actitudes', icon: LucideTriangleAlert, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { href: '/dashboard/reprimands', label: 'Amonestaciones', icon: LucideTriangleAlert, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
    { href: '/dashboard/recognitions', label: 'Reconocimientos', icon: LucideClipboardList, roles: ['admin', 'directivo', 'profesor' ,'alumno'] },
    { href: '/dashboard/mentions', label: 'Menciones', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
    { href: '/dashboard/probi', label: 'Probi', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
    { href: '/dashboard/aula-convivencia', label: 'Aula_convivencia', icon: LucideClipboardList, roles: ['admin', 'directivo'] },
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

  openLogoutModal() {
    this.mostrarLogoutModal = true;
  }

  confirmLogout() {
    this.authService.logout();
  }

  closeLogoutModal() {
    this.mostrarLogoutModal = false;
  }
}