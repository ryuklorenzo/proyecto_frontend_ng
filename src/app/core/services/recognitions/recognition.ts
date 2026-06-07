import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class RecognitionService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    

    createRecognition(idAlumno: number, idProfesor: number, payload: any) {
        return this.http.post(
            `/api/recognitions/?id_alumno=${idAlumno}&id_profesor=${idProfesor}`,
            payload,
            { 
                headers: {
                    Authorization: `Bearer ${this.authService.token()}` 
                } 
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
            `/api/recognitions/attitudes/${idActitud}/`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    updateRecognition(id: number, idActitud: number, payload: any) {
        return this.http.put(
            `/api/recognitions/${id}?id_actitud=${idActitud}`,
            payload,
            { headers: { Authorization: `Bearer ${this.authService.token()}` } }
        );
    }
    deleteRecognition(id: number) {
        return this.http.delete(
            `/api/recognitions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}