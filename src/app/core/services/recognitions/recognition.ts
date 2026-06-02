import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class RecognitionService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createRecognition(idAlumno: number, idProfesor: number, reconocimientoData: any, actitudData: any) {
        const payload = {
            reconocimiento: reconocimientoData,
            actitud: actitudData
        };
        return this.http.post(
            `/api/recognitions/?id_alumno=${idAlumno}&id_profesor=${idProfesor}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getRecognitions() {
        return this.http.get('/api/recognitions/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getRecognitionById(id: number) {
        return this.http.get(
            `/api/recognitions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getRecognitionsByAttitude(idActitud: number) {
        return this.http.get(
            `/api/recognitions/attitudes/${idActitud}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    updateRecognition(id: number, id_actitud:number, recognition: any) {
        return this.http.put(
            `/api/recognitions/${id}?id_actitud=${id_actitud}`,
            recognition,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    deleteRecognition(id: number) {
        return this.http.delete(
            `/api/recognitions /${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}