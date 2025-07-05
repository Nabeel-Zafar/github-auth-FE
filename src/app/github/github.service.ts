import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GithubService {
  apiUrl = 'http://localhost:3000/api/github';

  constructor(private http: HttpClient) {}

  getAuthUrl() {
    return this.http.get<{ url: string }>(`${this.apiUrl}/auth-url`);
  }

  getStatus(userId: string) {
    return this.http.get(`${this.apiUrl}/status/${userId}`);
  }

  removeIntegration(userId: string) {
    return this.http.delete(`${this.apiUrl}/remove/${userId}`);
  }

  reSyncData(userId: string) {
    return this.http.post(`${this.apiUrl}/resync/${userId}`, {});
  }
}