import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../../../core/auth/auth';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { MentionService } from '../../../core/services/mentions/mention';
import { RecognitionService } from '../../../core/services/recognitions/recognition';
import { StudentService } from '../../../core/services/students/student';
import { AttitudeService } from '../../../core/services/attitudes/attitude';

import {
  LucideAward,
  LucideBadgeCheck,
  LucideSearch,
  LucidePencil,
  LucideTrash,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideUserCircle,
  LucideDynamicIcon,
} from '@lucide/angular';

interface Buttons {
  label: string;
  icon: any;
  roles: UserRole[];
}

export interface Mention {
  fecha: string;
  id: number;
  id_reconocimiento: number;
  detalle_reconocimiento: string;
  id_actitud: number;
  descripcion_actitud: string;
  fecha_actitud: string;
  tipo_actitud: string;
  nombre_completo_alumno?: string; 
}

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [
    LucideDynamicIcon, 
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    TableModule
  ],
  templateUrl: './mentions.html',
  styleUrl: './mentions.css',
})
export class Mentions {
  authService = inject(AuthService);
  mentionService = inject(MentionService);  
  recognitionService = inject(RecognitionService);
  studentService = inject(StudentService);
  attitudeService = inject(AttitudeService);
  fb = inject(FormBuilder);
  
  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash
  };

  private butonItems: Buttons[] = [
    { label: 'Crear mención', icon: LucideAward, roles: ['admin', 'directivo'] },
    { label: 'Ver menciones', icon: LucideBadgeCheck, roles: ['admin', 'directivo', 'profesor'] },
    { label: 'Ver menciones por reconocimiento', icon: LucideSearch, roles: ['admin', 'directivo'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarPorReconocimiento = signal(false);
  mostrarDetalle = signal(false);

  mentions = signal<Mention[]>([]);
  mentionsWithStudents = signal<any[]>([]);
  reconocimientos = signal<any[]>([]);
  selectedMention = signal<Mention | null>(null);

  mentionForm: FormGroup;
  searchByRecForm: FormGroup;

  constructor() {
    this.mentionForm = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      id_reconocimiento: [null, Validators.required]
    });

    this.searchByRecForm = this.fb.group({
      id_mencion_estudiante: [null, Validators.required]
    });
  }

  private loadCrossedData() {
    return forkJoin({
      menciones: this.mentionService.getMentions(),
      reconocimientos: this.recognitionService.getRecognitions(),
      actitudes: this.attitudeService.getAttitudes(),
      alumnos: this.studentService.getStudents()
    });
  }

  toggleCrearMencion() {
    this.mostrarFormulario.set(true);
    this.mostrarTabla.set(false);
    this.mostrarPorReconocimiento.set(false);
    this.mentionForm.reset({
      //fecha actual
      fecha: new Date().toISOString().split('T')[0],
      id_reconocimiento: null
    });

    this.loadCrossedData().subscribe({
      next: (data: any) => {
        //mapeamos reconocmimientos para cruzar datos
        const reconocimientosCompletos = data.reconocimientos.map((rec: any) => {
          const actitudVinculada = data.actitudes.find((act: any) => act.id == rec.id_actitud); 
          //busca por actitud id asociada

          let alumnoVinculado = null;
          if (actitudVinculada) {
            const idAlumno = actitudVinculada.id_usuario; 
            alumnoVinculado = data.alumnos.find((a: any) => a.id == idAlumno);
          } //busca por el id alumno si hay actitud
          return {
            ...rec,
            nombre_completo_alumno: alumnoVinculado 
              ? `${alumnoVinculado.nombre} ${alumnoVinculado.apellidos}` 
              : 'Alumno no encontrado'
          };//lo devuelve con los datos vinculados
        });

        this.reconocimientos.set(reconocimientosCompletos); //save
      },
      error: (err: any) => console.error('Error cruzando datos', err)
    });
  }

  loadMentions() {
    this.mostrarTabla.set(true);
    this.mostrarFormulario.set(false);
    this.mostrarPorReconocimiento.set(false);
    
    // Cruzamos los datos
    this.loadCrossedData().subscribe({
      next: (data: any) => {
        
        const mencionesCompletas = data.menciones.map((mention: any) => {
          let nombre_completo_alumno = 'Alumno no encontrado';

          //reconocimiento de la mención
          const rec = data.reconocimientos.find((r: any) => r.id == mention.id_reconocimiento);
          if (rec) {
            //actitud del reconocimiento
            const act = data.actitudes.find((a: any) => a.id == rec.id_actitud);
            if (act) {
              //alumno de la actitud
              const idAlumno = act.id_usuario; 
              const alumno = data.alumnos.find((al: any) => al.id == idAlumno);
              if (alumno) {
                nombre_completo_alumno = `${alumno.nombre} ${alumno.apellidos}`;
              }
            }
          }
          return {
            ...mention,
            nombre_completo_alumno
          };//datos cruzados
        });
        this.mentions.set(mencionesCompletas);
      },
      error: (err: any) => console.error('Error cargando menciones completas', err)
    });
  }

  toggleVerPorReconocimiento() {
    this.mostrarPorReconocimiento.set(true);
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);

    this.loadCrossedData().subscribe({
      next: (data: any) => {
        //lo mismo
        const mencionesCruzadas = data.menciones.map((mention: any) => {
          let nombre_completo_alumno = 'Alumno no encontrado';
          let id_alumno = 'Desconocido';

          const rec = data.reconocimientos.find((r: any) => r.id == mention.id_reconocimiento);
          if (rec) {
            const act = data.actitudes.find((a: any) => a.id == rec.id_actitud);
            if (act) {
              const idAlumno = act.id_usuario; 
              const alumno = data.alumnos.find((al: any) => al.id == idAlumno);
              if (alumno) {
                nombre_completo_alumno = `${alumno.nombre} ${alumno.apellidos}`;
                id_alumno = alumno.id;
              }
            }
          }
          return {
            ...mention,
            nombre_completo_alumno,
            id_alumno
          };
        });
        //guardamos los cruces hechos
        this.mentionsWithStudents.set(mencionesCruzadas);
      },
      error: (err: any) => console.error('Error cruzando datos para el desplegable', err)
    });
  }

  createMention() {
    if (this.mentionForm.valid) {
      const formValue = this.mentionForm.value;
      const idReconocimiento = formValue.id_reconocimiento;

      this.mentionService.createMention(idReconocimiento, formValue).subscribe({
        next: (res: any) => {
          alert('¡Mención creada correctamente!');
          this.mentionForm.reset({
            fecha: new Date().toISOString().split('T')[0],
            id_reconocimiento: null
          });
        },
        error: (err: any) => {
          console.error('Error al crear mención', err);
          alert('Error al crear la mención. Revisa los datos o la consola para más detalles.');
        }
      });
    } else {
      alert('Por favor, rellena todos los campos obligatorios.');
    }
  }

  searchMentionByReconocimiento() {
    if (this.searchByRecForm.valid) {
      const idSeleccionado = this.searchByRecForm.value.id_mencion_estudiante;
      const mencionEncontrada = this.mentionsWithStudents().find((m: any) => m.id == idSeleccionado);

      if (mencionEncontrada) {
        this.mentions.set([mencionEncontrada]);
        this.mostrarTabla.set(true);
      } else {
        this.mentions.set([]);
        this.mostrarTabla.set(true);
      }
    }
  }

  viewMention(mention: Mention) {
    this.selectedMention.set({ ...mention });
    this.mostrarDetalle.set(true);
  }

  deleteMention(mention: Mention) {
    if(confirm(`¿Estás seguro de que deseas borrar la mención #${mention.id}?`)) {
      this.mentionService.deleteMention(mention.id).subscribe({
        next: () => {
          this.mentions.update(m => m.filter(item => item.id !== mention.id));
        },
        error: (err: any) => console.error('Error al borrar la mención', err)
      });
    }
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedMention.set(null);
  }

  saveMention() {
    const mentionToUpdate = this.selectedMention();
    if (mentionToUpdate) {
      this.mentionService.updateMention(
        mentionToUpdate.id, 
        mentionToUpdate.id_reconocimiento, 
        mentionToUpdate
      ).subscribe({
        next: (res: any) => {
          this.mentions.update(m => m.map(item => item.id === mentionToUpdate.id ? mentionToUpdate : item));
          this.closeModal();
        },
        error: (err: any) => console.error('Error al actualizar la mención', err)
      });
    }
  }

  hasErrorForm(form: FormGroup, controlName: string) {
    const control = form.get(controlName);
    return control?.invalid && (control.dirty || control.touched);
  }
}