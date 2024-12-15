import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Invitation } from '../model/invitation'

@Injectable({
  providedIn: 'root'
})
export class InvitationsService {
  apiURL: string = 'http://localhost:8000/invitations'
  headers = {'content-type':'application/json'}

  constructor(private http: HttpClient) { }

  sendInvitation(teamEmail: string, playerEmail: string): Observable<any> {
    const requestBody = { teamEmail, playerEmail }
    return this.http.post(`${this.apiURL}/sendInvitation`, requestBody)
  }  

  getInvitations(playerEmail: string): Observable<Invitation[]> {
    const apiUrl = `${this.apiURL}/getPlayerInvitations/${playerEmail}`
    return this.http.get<Invitation[]>(apiUrl)
  }

  getTeamInvitationsFeed(email: string): Observable<Invitation[]> {
    const apiUrl = `${this.apiURL}/getInvitationsFeed/${email}`
    return this.http.get<Invitation[]>(apiUrl)
  }
  
  getAllInvitations(): Observable<Invitation[]> {
    const apiUrl = `${this.apiURL}/getAllInvitations`
    return this.http.get<Invitation[]>(apiUrl)
  }

  acceptInvitation(id: string): Observable<any> {
    const apiUrl = `${this.apiURL}/acceptInvitation/${id}`
    return this.http.post(apiUrl, null)
  }  
  
  rejectInvitation(id: string, reason: string): Observable<any> {
    const apiUrl = `${this.apiURL}/rejectInvitation/${id}`;
    return this.http.post(apiUrl, { reason });
  }
}