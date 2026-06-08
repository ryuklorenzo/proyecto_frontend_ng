import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class ClassroomService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    createClassroom(idHorario: number, classroom: any) {
        return this.http.post(
            `/api/classroom_coexistence/?id_horario=${idHorario}`,
            classroom,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getClassrooms() {
        return this.http.get('/api/classroom_coexistence/', {
            headers: {
                Authorization: `Bearer ${this.authService.token()}`
            }
        });
    }

    getClassroomById(id: number) {
        return this.http.get(
            `/api/classroom_coexistence/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    updateClassroom(id: number, idHorario: number, classroom: any) { 
        return this.http.put(
            `/api/classroom_coexistence/${id}/?id_horario=${idHorario}`, 
            classroom,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    deleteClassroom(id: number) {
        return this.http.delete(
            `/api/classroom_coexistence/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    assignStudents(data: any) {
        return this.http.post(
            '/api/classroom_coexistence/assign-students/',
            data,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    getStudentsByClassroom(idAula: number) {
        return this.http.get(
            `/api/classroom_coexistence/${idAula}/students/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    removeStudent(idAula: number, idAlumno: number) {
        return this.http.delete(
            `/api/classroom_coexistence/${idAula}/students/${idAlumno}/ `,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}