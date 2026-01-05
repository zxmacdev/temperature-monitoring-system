import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_BASE = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  fetch<T>(path: string) {
    return this.http.get<T>(`${this.API_BASE}/${path}`);
  }
}