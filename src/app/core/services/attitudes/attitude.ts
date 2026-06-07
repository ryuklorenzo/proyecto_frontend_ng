import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class AttitudeService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
     

    createAttitude(idAlumno: number, attitude: any) {

        return this.http.post(
            `/api/attitudes/?id_alumno=${idAlumno}`,
            attitude,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getAttitudes(){
        return this.http.get(
            `/api/attitudes/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        )
    }

    getAttituddesByStudent(idAlumno: number) {
        return this.http.get(
            `/api/attitudes/users/${idAlumno}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    deleteAttitude(id: number) {
        return this.http.delete(
            `/api/attitudes/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}