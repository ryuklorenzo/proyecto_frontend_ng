import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../core/auth/auth';
import { LucideLoader2, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, LucideDynamicIcon],
  template: `
    @if (authService.isLoading()) {
      <div class="min-h-screen flex items-center justify-center bg-background">
        <svg [lucideIcon]="loaderIcon" class="w-8 h-8 animate-spin text-primary"></svg>
      </div>
    } @else if (authService.isAuthenticated()) {
      <div class="min-h-screen bg-background">
        
        @if(authService.user()?.role !== 'alumno') {
          <app-sidebar
            [collapsed]="sidebarCollapsed"
            (toggle)="sidebarCollapsed = !sidebarCollapsed">
          </app-sidebar>
        }
        
        <main class="transition-all duration-300" [ngClass]="authService.user()?.role === 'alumno' ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')">
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </main>

      </div>
    }
  `
}) //el template de arriba, comprueba que haya loggeado !muestra algo
export class DashboardLayout {
  authService = inject(AuthService);
  sidebarCollapsed = false;

  loaderIcon = LucideLoader2;
}