import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class PreviService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    createPrevi(idDirectivo: number, idExpediente: number, previ: any) {

        const token = this.authService.token();

        return this.http.post(
            `/api/previ/?id_directivo=${idDirectivo}&id_expediente=${idExpediente}`,
            previ,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getPrevis() {
        return this.http.get('/api/previ/', {
            headers: {
                Authorization: `Bearer ${this.authService.token()}`
            }
        });
    }

    getPrevisByExpediente(idExpediente: number) {
        return this.http.get(
            `/api/previ/expediente/${idExpediente}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    getPrevisByDirectivo(idDirectivo: number) {
        return this.http.get(
            `/api/previ/directivo/${idDirectivo}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
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
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    deletePrevi(id: number) {
        return this.http.delete(
            `/api/previ/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}