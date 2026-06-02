import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class RecordSercive {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createRecord(idDirectivo: number, idAlumno: number, record: any) {
        return this.http.post(
            `/api/records/?id_directivo=${idDirectivo}&id_alumno=${idAlumno}`,
            record,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getRecords() {
        return this.http.get('/api/records/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getRecordsByExecutive(idDirectivo: number) {
        return this.http.get(
            `/api/records/executives/${idDirectivo}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getRecordsByStudent(idAlumno: number) {
        return this.http.get(
            `/api/records/students/${idAlumno}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}