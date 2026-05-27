import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth'; 
// CORRECCIÓN: Importamos LucideDynamicIcon y los iconos con el prefijo "Lucide"
import { LucideGraduationCap, LucideLoader2, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
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
    // console.log("PRimer paso")
    // Llamamos a la función login del servicio
    const success = await this.authService.login(username, password);
    // console.log("Segundo paso")
    // console.log(success)
    this.isLoading.set(false);

    if (success) {
      // Si el login es correcto, navegamos al dashboard
      this.router.navigate(['/dashboard']);
      //console.log("Navega o deberia")
    } else {
      // Si falla, mostramos un error en la vista
      //console.log("Error")
      this.error.set('Usuario o contraseña incorrectos');
    }
  }
}
