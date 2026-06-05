import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class MentionService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createMention(idReconocimiento: number, mention: any) {
        return this.http.post(
            `/api/mentions/?id_reconocimiento=${idReconocimiento}`,
            mention,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getMentions() {
        return this.http.get('/api/mentions/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    getMentionById(id: number) {
        return this.http.get(
            `/api/mentions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    getMentionsByRecognition(idReconocimiento: number) {
        return this.http.get(
            `/api/mentions/recognitions/${idReconocimiento}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    updateMention(id: number, id_reconocimiento: number, mention: any) {
        return this.http.put(
            `/api/mentions/${id}?id_reconocimiento=${id_reconocimiento}`,
            mention,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    deleteMention(id: number) {
        return this.http.delete(
            `/api/mentions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}