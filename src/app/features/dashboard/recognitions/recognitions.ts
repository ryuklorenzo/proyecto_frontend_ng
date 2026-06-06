import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TableModule } from 'primeng/table';

import { AuthService, UserRole } from '../../../core/auth/auth';
import { AttitudeService } from '../../../core/services/attitudes/attitude';
import { StudentService } from '../../../core/services/students/student';
import { RecognitionService } from '../../../core/services/recognitions/recognition';
import { TeacherService } from '../../../core/services/teachers/teacher';

import {
  LucideAward,
  LucideBadgeCheck,
  LucideSearch,
  LucidePencil,
  LucideTrash2,
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

@Component({
  selector: 'app-recognitions',
  standalone: true,
  imports: [LucideDynamicIcon, CommonModule, ReactiveFormsModule, FormsModule, TableModule],
  templateUrl: './recognitions.html',
  styleUrl: './recognitions.css',
})
export class Recognitions implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  private recognitionService = inject(RecognitionService);
  private attitudeService = inject(AttitudeService);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);

  user = this.authService.user;

  icons = {
    ChevronLeft: LucideChevronLeft,
    ChevronRight: LucideChevronRight,
    UserCircle: LucideUserCircle,
    LogOut: LucideLogOut,
    Pencil: LucidePencil,
    Trash: LucideTrash2,
    Search: LucideSearch,
    Award: LucideAward,
    BadgeCheck: LucideBadgeCheck,
  };

  private butonItems: Buttons[] = [
    { label: 'Crear reconocimiento', icon: LucideAward, roles: ['admin', 'directivo', 'profesor'] },
    {
      label: 'Ver reconocimientos',
      icon: LucideBadgeCheck,
      roles: ['admin', 'directivo', 'profesor'],
    },
    { label: 'Ver por actitud', icon: LucideSearch, roles: ['admin', 'directivo', 'profesor', 'alumno'] },
  ];

  filteredButtons = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    return this.butonItems.filter((btn) => btn.roles.includes(currentUser.role));
  });

  mostrarFormulario = signal(false);
  mostrarTabla = signal(false);
  mostrarBusquedaActitud = signal(false);
  mostrarBusquedaId = signal(false);
  mostrarDetalle = signal(false);
  editMode = signal(false);

  reconocimientos = signal<any[]>([]);
  actitudes = signal<any[]>([]);
  alumnos = signal<any[]>([]);
  profesores = signal<any[]>([]);

  selectedRecognition = signal<any>(null);
  actitudSeleccionadaId = signal<number | null>(null);
  idBuscado = signal<number | null>(null);
  searchTerm = signal('');


  actitudesDetalladas = computed(() => {
    const allAttitudes = this.actitudes();
    const allStudents = this.alumnos();

    return allAttitudes.map((act) => {
      const idEstudiante = act.id_usuario || act.id_alumno;
      // to number para evitar errores que daban
      const student = allStudents.find((s) => Number(s.id) === Number(idEstudiante));
      return {
        ...act,
        nombre_alumno_completo: student ? `${student.nombre} ${student.apellidos}` : 'Desconocido',
        id_alumno_real: student ? student.id : null,
      };
    });
  });

  filteredRecognitions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allRecs = this.reconocimientos();
    const allAtts = this.actitudesDetalladas();
    const allProfs = this.profesores();

    const enriched = allRecs.map((rec) => {
      //cruzamos la actitud para obtener el alumno
      const act = allAtts.find((a) => Number(a.id) === Number(rec.id_actitud));

      //cruzamos el profesor usando el id_profesor del reconocimiento
      //buscamos en la lista de profesores comparando con p.id o p.id_usuario
      const prof = allProfs.find(
        (p) =>
          Number(p.id) === Number(rec.id_profesor) ||
          Number(p.id_usuario) === Number(rec.id_profesor),
      );

      return {
        ...rec,
        //nombre del alumno obtenido a través de la actitud
        nombre_alumno_completo:
          act && act.nombre_alumno_completo !== 'Desconocido'
            ? act.nombre_alumno_completo
            : 'Desconocido',
        id_alumno_real: act ? act.id_alumno_real : null,

        //nombre del profesor obtenido del cruce
        nombre_profesor_completo: prof ? `${prof.nombre} ${prof.apellidos}` : 'Desconocido',
      };
    });

    if (!term) return enriched;

    return enriched.filter(
      (rec: any) =>
        rec.detalle?.toLowerCase().includes(term) ||
        rec.nombre_alumno_completo?.toLowerCase().includes(term) ||
        rec.nombre_profesor_completo?.toLowerCase().includes(term) ||
        rec.actitud_tipo?.toLowerCase().includes(term) ||
        rec.id?.toString().includes(term),
    );
  });

  recognitionForm: FormGroup = this.fb.group({
    id_alumno: [null, Validators.required],
    id_profesor: [null, Validators.required],
    detalle: ['', Validators.required],
    actitud_tipo: ['', Validators.required],
    actitud_descripcion: ['', Validators.required],
    actitud_fecha: ['', Validators.required],
  });

  ngOnInit() {
    this.cargarDatosBase();
  }

  cargarDatosBase() {
    this.studentService.getStudents().subscribe({ next: (data: any) => this.alumnos.set(data) });
    this.teacherService.getTeachers().subscribe({ next: (data: any) => this.profesores.set(data) });
    this.attitudeService
      .getAttitudes()
      .subscribe({ next: (data: any) => this.actitudes.set(data) });
  }

  // --- NAVEGACIÓN ---
  ocultarTodo() {
    this.mostrarFormulario.set(false);
    this.mostrarTabla.set(false);
    this.mostrarBusquedaActitud.set(false);
    this.mostrarBusquedaId.set(false);
  }

  toggleCrearReconocimiento() {
    this.ocultarTodo();
    this.mostrarFormulario.set(true);
    this.cargarDatosBase();
    this.recognitionForm.reset();
  }

  showAttitudeSelector() {
    this.ocultarTodo();
    this.mostrarBusquedaActitud.set(true);
    this.cargarDatosBase();
  }

  showIdSelector() {
    this.ocultarTodo();
    this.mostrarBusquedaId.set(true);
  }

  loadRecognitions() {
    this.ocultarTodo();
    this.cargarDatosBase();
    this.recognitionService.getRecognitions().subscribe({
      next: (data: any) => {
        this.reconocimientos.set(data);
        this.mostrarTabla.set(true);
      },
      error: (err) => {
        if (err.status === 404) {
          this.reconocimientos.set([]);
          this.mostrarTabla.set(true);
        } else {
          console.error(err);
          alert('Error cargando los reconocimientos');
        }
      },
    });
  }

  buscarPorActitud() {
    const id = this.actitudSeleccionadaId();
    if (!id) return alert('Selecciona una actitud primero');
    this.recognitionService.getRecognitionsByAttitude(id).subscribe({
      next: (data: any) => {
        const dataArray = Array.isArray(data) ? data : [data];
        this.reconocimientos.set(dataArray);
        this.mostrarTabla.set(true);
      },
      error: (err) => {
        if (err.status === 404) {
          this.reconocimientos.set([]);
          this.mostrarTabla.set(true);
        }
      },
    });
  }

  buscarPorId() {
    const id = this.idBuscado();
    if (!id) return alert('Introduce un ID válido');
    this.recognitionService.getRecognitionById(id).subscribe({
      next: (data: any) => {
        this.reconocimientos.set([data]);
        this.mostrarTabla.set(true);
      },
      error: (err) => {
        if (err.status === 404) {
          this.reconocimientos.set([]);
          this.mostrarTabla.set(true);
        }
      },
    });
  }

  createRecognition() {
    if (this.recognitionForm.invalid) {
      this.recognitionForm.markAllAsTouched();
      return;
    }

    const formValue = this.recognitionForm.value;

    //asi lo espera el back, sino no tira
    const payload = {
      reconocimiento: {
        detalle: formValue.detalle,
      },
      actitud: {
        descripcion: formValue.actitud_descripcion,
        fecha: formValue.actitud_fecha,
        tipo: formValue.actitud_tipo,
      },
    };

    this.recognitionService
      .createRecognition(formValue.id_alumno, formValue.id_profesor, payload)
      .subscribe({
        next: () => {
          alert('Reconocimiento y Actitud creados correctamente');
          this.recognitionForm.reset();
        },
        error: (err) => {
          console.error(err);
          alert('Error creando el reconocimiento');
        },
      });
  }

  viewRecognition(recognition: any) {
    this.selectedRecognition.set(JSON.parse(JSON.stringify(recognition)));
    this.mostrarDetalle.set(true);
    this.editMode.set(false);
  }

  saveRecognition() {
    const payload = {
      detalle: this.selectedRecognition().detalle,
    };

    this.recognitionService
      .updateRecognition(
        this.selectedRecognition().id,
        this.selectedRecognition().id_actitud,
        payload,
      )
      .subscribe({
        next: () => {
          alert('Reconocimiento actualizado correctamente');
          this.editMode.set(false);
          this.closeModal();
          this.loadRecognitions();
        },
        error: (err) => {
          console.error(err);
          alert('Error actualizando el reconocimiento');
        },
      });
  }

  deleteRecognition(recognition: any) {
    const confirmar = confirm(`¿Seguro que deseas eliminar el reconocimiento #${recognition.id}?`);
    if (!confirmar) return;

    this.recognitionService.deleteRecognition(recognition.id).subscribe({
      next: () => {
        alert('Reconocimiento eliminado correctamente');
        this.reconocimientos.set(this.reconocimientos().filter((r) => r.id !== recognition.id));
      },
      error: (err) => {
        if (err.status === 404) alert('El reconocimiento no fue encontrado.');
        else alert('Error al eliminar el reconocimiento');
      },
    });
  }

  closeModal() {
    this.mostrarDetalle.set(false);
    this.selectedRecognition.set(null);
    this.editMode.set(false);
  }

  enableEdit() {
    this.editMode.set(true);
  }
  cancelEdit() {
    this.closeModal();
  }

  hasErrorForm(field: string): boolean {
    const control = this.recognitionForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
