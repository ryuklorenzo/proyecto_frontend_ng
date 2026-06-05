import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class ClassroomService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createClassroom(idHorario: number, classroom: any) {
        return this.http.post(
            `/api/aula_convivencia/?id_horario=${idHorario}`,
            classroom,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getClassrooms() {
        return this.http.get('/api/aula_convivencia/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getClassroomById(id: number) {
        return this.http.get(
            `/api/aula_convivencia/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    updateClassroom(id: number, idHorario: number, classroom: any) { 
        return this.http.put(
            `/api/aula_convivencia/${id}?id_horario=${idHorario}`, 
            classroom,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    deleteClassroom(id: number) {
        return this.http.delete(
            `/api/aula_convivencia/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    assignStudents(data: any) {
        return this.http.post(
            '/api/aula_convivencia/assign-students',
            data,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getStudentsByClassroom(idAula: number) {
        return this.http.get(
            `/api/aula_convivencia/${idAula}/students`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    removeStudent(idAula: number, idAlumno: number) {
        return this.http.delete(
            `/api/aula_convivencia/${idAula}/students/${idAlumno}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}