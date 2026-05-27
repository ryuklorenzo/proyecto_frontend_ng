// src/app/features/home/home.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth'; 
// CORRECCIÓN: Importamos LucideDynamicIcon y los iconos con el prefijo "Lucide"
import { LucideGraduationCap, LucideLoader2, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  // CORRECCIÓN: Quitamos LucideAngularModule y dejamos LucideDynamicIcon igual que en el sidebar
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon], 
  templateUrl: './home.html' 
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // CORRECCIÓN: Mapeamos los nombres para usarlos en el HTML igual que en tu sidebar
  icons = { 
    GraduationCap: LucideGraduationCap, 
    Loader2: LucideLoader2 
  };

  // Estados locales del componente gestionados con Signals
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Definición del formulario con validaciones básicas
  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  async onSubmit() {
    // Si el formulario es inválido, no hacemos nada
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { username, password } = this.loginForm.getRawValue();

    // Llamamos a la función login del servicio
    const success = await this.authService.login(username, password);

    this.isLoading.set(false);

    if (success) {
      // Si el login es correcto, navegamos al dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Si falla, mostramos un error en la vista
      this.error.set('Usuario o contraseña incorrectos');
    }
  }
}