import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class RecordSercive {

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    createRecord(idDirectivo: number, idAlumno: number, estado: string) {

        const token = this.authService.token();

        return this.http.post(
            `/api/records/?id_directivo=${idDirectivo}&id_alumno=${idAlumno}`,
            {
                estado
            },
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getRecords() {
        return this.http.get('/api/records/', {
            headers: {
                Authorization: `Bearer ${this.authService.token()}`
            }
        });
    }

    getRecordsByExecutive(idDirectivo: number) {
        return this.http.get(
            `/api/records/executives/${idDirectivo}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    getRecordsByStudent(idAlumno: number) {
        return this.http.get(
            `/api/records/students/${idAlumno}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}