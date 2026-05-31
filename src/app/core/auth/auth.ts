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
  role: string;
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

  private readonly API_URL = '/api';

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

  private detectUserRole(role: string): UserRole {
    //TODO cambiar esto de alguna manera saber que es, pero asi no
    const role_lowercase = role.toLowerCase();
    if (role_lowercase.includes('admin')){
      return 'admin';
    }
    if (role_lowercase.includes('directivo')) {
      return 'directivo';
    }
    if (role_lowercase.includes('profesor')) {
      return 'profesor';
    }
    return 'alumno';
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
      // console.log(response)

      if (!response.access_token) {
        console.error('La respuesta no contiene access_token');
        return false;
      }

      const userRole = this.detectUserRole(response.role);

      // const alumno = this.detectUserRole("alumno");
      // const profe = this.detectUserRole("profesor");
      // const directivo = this.detectUserRole("directivo");
      // const admin = this.detectUserRole("admin");

      const userData: User = {
        id: 1,
        nombre: username,
        apellidos: '',
        activo: true,
        role: userRole, //asi tendrá que ser

        //TESTEO
        // role: alumno,
        // role: profe,
        // role: directivo,
        // role: admin,
      };

      this.token.set(response.access_token);
      this.user.set(userData);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('Login exitoso');
      console.log(response.access_token);
      console.log(response.role);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
      }
      if (typeof error === 'object' && error !== null) {
        console.error('   Error details:', JSON.stringify(error, null, 2));
      }
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