import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class MentionService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    createMention(idReconocimiento: number, mention: any) {

        const token = this.authService.token();

        return this.http.post(
            `/api/mentions/recognitions/${idReconocimiento}`,
            mention,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.token()}`
                })
            }
        );
    }

    getMentions() {
        return this.http.get('/api/mentions/', {
            headers: {
                Authorization: `Bearer ${this.authService.token()}`
            }
        });
    }

    getMentionById(id: number) {
        return this.http.get(
            `/api/mentions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    getMentionsByRecognition(idReconocimiento: number) {
        return this.http.get(
            `/api/mentions/recognitions/${idReconocimiento}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    updateMention(id: number, mention: any) {
        return this.http.put(
            `/api/mentions/${id}`,
            mention,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }

    deleteMention(id: number) {
        return this.http.delete(
            `/api/mentions/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authService.token()}`
                }
            }
        );
    }
}