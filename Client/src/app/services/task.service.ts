import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiURL = 'http://localhost:8000/task';

  constructor(private http: HttpClient) { }

  runTask(): Observable<any> {
    return this.http.post<any>(this.apiURL, {});
  }
}