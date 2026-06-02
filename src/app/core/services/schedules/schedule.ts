import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth';

@Injectable({
    providedIn: 'root',
})
export class ScheduleService {

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    token = this.authService.token();

    createSchedule(schedule: any) {
        return this.http.post(
            `/api/schedules/`,
            schedule,
            {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`
                })
            }
        );
    }

    getSchedules() {
        return this.http.get('/api/schedules/', {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

    updateSchedule(id: number, schedule: any) {
        return this.http.put(
            `/api/schedules/${id}`,
            schedule,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }

    deleteSchedule(id: number) {
        return this.http.delete(
            `/api/schedules /${id}`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        );
    }
}