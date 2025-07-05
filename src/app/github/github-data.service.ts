import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GithubDataService {
  private baseUrl = 'http://localhost:3000/api/github';

  constructor(private http: HttpClient) {}

  getCollections(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/collections`);
  }

  getCollectionData(collection: string, page: number, limit: number = 50, sortBy: string = '_id', sortOrder: string = 'desc', filter: any = {}): Observable<{ data: any[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('filter', JSON.stringify(filter));
    return this.http.get<{ data: any[], total: number }>(`${this.baseUrl}/data/${collection}`, { params });
  }

  globalSearch(keyword: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search/${keyword}`);
  }
}
