import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth'; 
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

  icons = { 
    GraduationCap: LucideGraduationCap, 
    Loader2: LucideLoader2 
  };

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { username, password } = this.loginForm.getRawValue();
    const success = await this.authService.login(username, password);
    this.isLoading.set(false);

    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Usuario o contraseña incorrectos');
    }
  }
}
