import { Component, inject, computed, signal } from '@angular/core';
import { AuthService, UserRole } from '../../../core/auth/auth';
import {
  LucideStar,
  LucideSparkles,
  LucidePencil,
  LucideTrash2,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
} from '@lucide/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { ProbiService } from '../../../core/services/probi/probi';
import { MentionService } from '../../../core/services/mentions/mention';
import { RecognitionService } from '../../../core/services/recognitions/recognition';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

@Component({
  selector: 'app-probi',
  standalone: true,
  imports: [
    LucideDynamicIcon,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule
  ],
  templateUrl: './probi.html',
  styleUrl: './probi.css',
})

export class Probi {
  authService = inject(AuthService);
  private probiService = inject(ProbiService);
  private mentionService = inject(MentionService);
  private recognitionService = inject(RecognitionService);
  private fb = inject(FormBuilder);
  user = this.authService.user;
  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash2
  };

  private butonItems: Buttons[] = [
    { label: 'Crear probi', icon: LucideStar, roles: ['admin', 'directivo'] },
    { label: 'Ver probis', icon: LucideSparkles, roles: ['admin', 'directivo', 'profesor'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarDetalle = signal(false);
  editMode = signal(false);
  probis = signal<any[]>([]);
  menciones = signal<any[]>([]);
  selectedProbi = signal<any>(null);
  searchTerm = signal('');
  probiForm: FormGroup = this.fb.group({
    id_mencion: [null, Validators.required],
    fecha: [new Date().toISOString().split('T')[0], Validators.required]
  });

  filteredProbis = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allProbis = this.probis();

    if (!term) return allProbis;

    return allProbis.filter(probi =>
      probi.fecha?.toLowerCase().includes(term) ||
      probi.id_mencion?.toString().includes(term) ||
      probi.id?.toString().includes(term) ||
      probi.detalle_reconocimiento?.toLowerCase().includes(term)
    );
  });

  toggleCrearProbi() {
    this.mostrarTabla.set(false);
    this.mostrarFormulario.set(true);
    this.probiForm.reset({
      fecha: new Date().toISOString().split('T')[0],
      id_mencion: null
    });
    
    forkJoin({
      menciones: this.mentionService.getMentions(),
      reconocimientos: this.recognitionService.getRecognitions()
    }).subscribe({
      next: (data: any) => {
        const mencionesConDetalle = data.menciones.map((m: any) => {
          const rec = data.reconocimientos.find((r: any) => r.id == m.id_reconocimiento);
          //reconocimiento asociado a la mencion
          return {
            ...m,
            detalle_reconocimiento: rec ? rec.detalle : 'Sin detalle asociado'
          };//datos cruzados
        });
        this.menciones.set(mencionesConDetalle);
      },
      error: (err) => console.error('Error cruzando datos', err)
    });
  }

  createProbi() {
    if (this.probiForm.invalid) {
      this.probiForm.markAllAsTouched();
      return;
    }
    const value = this.probiForm.value;
    const body = {
      fecha: value.fecha
    };
    this.probiService.createProbi(
      value.id_mencion,
      body
    ).subscribe({
      next: () => {
        alert('Probi creado correctamente');
        this.probiForm.reset({
          fecha: new Date().toISOString().split('T')[0],
          id_mencion: null
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadProbis() {
    forkJoin({
      probis: this.probiService.getProbis(),
      menciones: this.mentionService.getMentions(),
      reconocimientos: this.recognitionService.getRecognitions()
    }).subscribe({
      next: (data: any) => {
        const probisCruzados = data.probis.map((probi: any) => {
          const mencion = data.menciones.find((m: any) => m.id == probi.id_mencion);
          //mencion asociada
          let detalle_reconocimiento = 'Mención sin reconocimiento';
          
          if (mencion) {
            //reconocimiento asociado
            const rec = data.reconocimientos.find((r: any) => r.id == mencion.id_reconocimiento);
            if (rec) {
              //cogemos el detalle
              detalle_reconocimiento = rec.detalle;
            }
          }

          return {
            ...probi,
            detalle_reconocimiento
          };//datos cruzados
        });

        this.probis.set(probisCruzados);
        this.mostrarFormulario.set(false);
        this.mostrarTabla.set(true);
      },
      error: (err) => console.error('Error cargando probis cruzados', err)
    });
  }

  viewProbi(probi: any) {
    this.selectedProbi.set({ ...probi });
    this.editMode.set(false);
    this.mostrarDetalle.set(true);
  }

  enableEdit() {
    this.editMode.set(true);
  }

  saveProbi() {
    const probi = this.selectedProbi();
    this.probiService.updateProbi(
      probi.id,
      probi.id_mencion,
      {
        fecha: probi.fecha
      }
    ).subscribe({
      next: () => {
        alert('Probi actualizado');
        this.loadProbis();
        this.editMode.set(false);
      },
      error: (error) => {
        console.error(error);
        alert('Error actualizando probi');
      }
    });
  }

  cancelEdit() {
    this.editMode.set(false);
  }

  deleteProbi(probi: any) {
    if (!confirm(`¿Eliminar probi ${probi.id}?`)) {
      return;
    }
    this.probiService.deleteProbi(probi.id).subscribe({
      next: () => {
        alert('Se ha borrado correctamente la probi');
        this.loadProbis();
      }
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedProbi.set(null);
    this.editMode.set(false);
  }

  updateSearchTerm(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  hasError(field: string): boolean {
    const control = this.probiForm.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }
}