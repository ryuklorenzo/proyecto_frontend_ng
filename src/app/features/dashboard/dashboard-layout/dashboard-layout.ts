// src/app/features/dashboard/dashboard-layout/dashboard-layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../core/auth/auth';
import { LucideLoader2, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, LucideDynamicIcon],
  template: `
    @if (authService.isLoading()) {
      <div class="min-h-screen flex items-center justify-center bg-background">
        <svg [lucideIcon]="loaderIcon" class="w-8 h-8 animate-spin text-primary"></svg>
      </div>
    } @else if (authService.isAuthenticated()) {
      <div class="min-h-screen bg-background">
        
        <app-sidebar 
          [collapsed]="sidebarCollapsed" 
          (toggle)="sidebarCollapsed = !sidebarCollapsed">
        </app-sidebar>
        
        <main class="transition-all duration-300" [ngClass]="sidebarCollapsed ? 'ml-16' : 'ml-64'">
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </main>

      </div>
    }
  `
})
export class DashboardLayoutComponent {
  authService = inject(AuthService);
  sidebarCollapsed = false;
  
  loaderIcon = LucideLoader2;
}