import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class ReprimandService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createReprimand(idAlumno: number, idProfesor: number, reprimand: any) {
        return this.http.post(
            `/api/records/?id_alumno=${idAlumno}&id_profesor=${idProfesor}`,
            reprimand,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getReprimands() {
        return this.http.get('/api/reprimands/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getReprimandById(id: number) {
        return this.http.get(
            `/api/reprimands/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getReprimandByStudent(idAlumno: number) {
        return this.http.get(
            `/api/reprimands/students/${idAlumno}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}