import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideHome, LucideUsers, LucideGraduationCap, LucideBookOpen, LucideCalendar,
  LucideClipboardList, LucideTriangleAlert, LucideFileText, LucideBuilding,
  LucideLogOut, LucideChevronLeft, LucideChevronRight, LucideUserCircle, 
  LucideDynamicIcon,  
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-executives',
  imports: [LucideDynamicIcon, CommonModule, ReactiveFormsModule],
  templateUrl: './executives.html',
  styleUrl: './executives.css',
})
export class Executives {
  authService = inject(AuthService);
  private executiveService = inject(ExecutiveService)
  private fb = inject(FormBuilder);
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

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);

  executives = signal<any[]>([]);
  selectedExecutives = signal<any>(null);
  searchTerm = signal('');

  //se actualiza con la barra de busqueda automaticamente.
  filteredExecutives = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allExecutives = this.executives();
    
    if (!term) return allExecutives;
    
    return allExecutives.filter(executive =>
      executive.nombre.toLowerCase().includes(term) ||
      executive.apellidos.toLowerCase().includes(term) ||
      executive.id.toString().includes(term)
    );
  });
  
  executiveForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    password: ['', Validators.required],
    idCurso: [1, [Validators.required, Validators.min(1)]]
  });

  toggleCrearExecutive() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);
  }

  loadExecutive() {
    this.executiveService.getExecutive().subscribe({
      next: (data: any) => {
        this.executives.set(data);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (error) => {
        console.error(error);
        alert('Error cargando profesores');
      }
    });
  }

  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  createExecutive() {
    if (this.executiveForm.invalid) {
      this.executiveForm.markAllAsTouched();
      return;
    }

    const formValue = this.executiveForm.value;
    const executiveData = {
      nombre: formValue.nombre,
      apellidos: formValue.apellidos,
      password: formValue.password,
      activo: true
    };

    this.executiveService.createExecutive(executiveData, formValue.idCurso).subscribe({
      next: (response) => {
        console.log(response);
        this.executiveForm.reset({ idCurso: 1 });
        alert('Profesor creado correctamente');
      },
      error: (error) => {
        console.error(error);
        alert('Error creando profesor');
      }
    });
  }

  viewExecutive(executive: any) {
    this.executiveService.getExecutiveById(executive.id).subscribe({
      next: (data) => {
        this.selectedExecutive.set(data);
        this.mostrarDetalle.set(true);
      }
    });
  }

  deleteExecutive(executive: any) {
    const confirmar = confirm(`¿Dar de baja a ${executive.nombre} ${executive.apellidos}?`);
    if (!confirmar) return;
    
    this.executiveService.deleteExecutive(executive.id).subscribe({
      next: () => {
        alert('Profesor dado de baja correctamente');
        this.loadExecutives();
      },
      error: (error) => {
        console.error(error);
        alert('Error dando de baja al profesor');
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedExecutive.set(null);
  }

  hasError(controlName: string, errorName: string = 'required') {
    const control = this.executiveForm.get(controlName);
    return control?.hasError(errorName) && control?.touched;
  }

}