import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class ProbiService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createProbi(idMencion: number, probi: any) {
        return this.http.post(
            `/api/probis/?id_mencion=${idMencion}`,
            probi,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getProbis() {
        return this.http.get('/api/probis/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getProbiById(id: number) {
        return this.http.get(
            `/api/probis/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    updateProbi(id: number, id_mencion: number, probi: any) {
        return this.http.put(
            `/api/probis/${id}?id_mencion=${id_mencion}`,
            probi,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    deleteProbi(id: number) {
        return this.http.delete(
            `/api/probis/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}