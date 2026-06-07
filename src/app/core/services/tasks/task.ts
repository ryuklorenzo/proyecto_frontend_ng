import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class TaskService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
     

    createTask(idProfesor: number, idAlumno: number, task: any) {
        return this.http.post(
            `/api/tasks/?id_profesor=${idProfesor}&id_alumno=${idAlumno}`,
            task,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getTasksByStudent(idAlumno: number) {
        return this.http.get(
            `/api/tasks/students/${idAlumno}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    getTasksByTeacher(idProfesor: number) {
        return this.http.get(
            `/api/tasks/teachers/${idProfesor}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}