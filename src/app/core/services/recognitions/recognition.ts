import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class RecognitionService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    createRecognition(idActitud: number, idAlumno: number, idProfesor: number, recognition: any) {

        const token = this.authService.token();

        return this.http.post(
            `/api/recognitions/attitudes/${idActitud}?id_alumno=${idAlumno}&id_profesor=${idProfesor}`,
            recognition,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getRecognitions() {
        return this.http.get('/api/recognitions/', {
            headers: {
                Authorization: `Bearer ${this.authService.token()}`
            }
        });
    }

    getRecognitionById(id: number) {
        return this.http.get(
            `/api/recognitions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    getRecognitionsByAttitude(idActitud: number) {
        return this.http.get(
            `/api/recognitions/attitudes/${idActitud}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    updateRecognition(id: number, recognition: any) {
        return this.http.put(
            `/api/recognitions/${id}`,
            recognition,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    deleteRecognition(id: number) {
        return this.http.delete(
            `/api/recognitions /${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}