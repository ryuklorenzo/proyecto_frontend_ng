import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class PreviService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createPrevi(idDirectivo: number, idExpediente: number, previ: any) {
        return this.http.post(
            `/api/previ/?id_directivo=${idDirectivo}&id_expediente=${idExpediente}`,
            previ,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getPrevis() {
        return this.http.get('/api/previ/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getPrevisByExpediente(idExpediente: number) {
        return this.http.get(
            `/api/previ/expediente/${idExpediente}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getPrevisByDirectivo(idDirectivo: number) {
        return this.http.get(
            `/api/previ/directivo/${idDirectivo}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    updatePrevi(id: number, previ: any) {
        return this.http.put(
            `/api/previ/${id}`,
            previ,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    deletePrevi(id: number) {
        return this.http.delete(
            `/api/previ/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}