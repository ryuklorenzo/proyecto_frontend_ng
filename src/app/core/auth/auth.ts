import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export type UserRole = 'admin' | 'directivo' | 'profesor' | 'alumno';

export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  activo: boolean;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Estado global gestionado con Signals
  user = signal<User | null>(null);
  token = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  // Signal computada para saber si está autenticado
  isAuthenticated = computed(() => !!this.token());

  private readonly API_URL = 'http://localhost:8081';

  constructor() {
    this.checkSession();
  }

  private checkSession(): void {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      this.token.set(storedToken);
      this.user.set(JSON.parse(storedUser));
    }
    this.isLoading.set(false);
  }

  private detectUserRole(username: string): UserRole {
    const lowerName = username.toLowerCase();
    if (lowerName.includes('alumno') || lowerName.includes('estudiante')) {
      return 'alumno';
    }
    if (lowerName.includes('profesor') || lowerName.includes('teacher')) {
      return 'profesor';
    }
    if (lowerName.includes('directivo') || lowerName.includes('director')) {
      return 'directivo';
    }
    return 'admin';
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const body = new URLSearchParams();
      body.set('username', username);
      body.set('password', password);

      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/users/login/`, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      const userRole = this.detectUserRole(username);
      const userData: User = {
        id: 1,
        nombre: username,
        apellidos: '',
        activo: true,
        role: userRole,
      };

      this.token.set(response.access_token);
      this.user.set(userData);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout(): void {
    this.user.set(null);
    this.token.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}