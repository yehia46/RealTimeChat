import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Team } from '../model/team'
import { catchError, map, tap } from 'rxjs/operators'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { Router } from '@angular/router'
import { Player } from '../model/player'

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  
  apiURL: string = 'http://localhost:8000/teams'
  headers = {'content-type':'application/json'}
  teams: Team[] = []
  currentUser: BehaviorSubject<Team | null> = new BehaviorSubject<Team | null>(null)
  
  constructor(private router: Router, private http:HttpClient) { 
    this.checkUserInLocalStorage()
  }

  getCurrentUser(): Observable<Team | null> {
    return this.currentUser.asObservable()
  }

  private checkUserInLocalStorage(): void {
    const user_team = localStorage.getItem('user_team')
    if(user_team) {
      this.currentUser.next(JSON.parse(user_team))
    }
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiURL}/get-teams`).pipe(
      catchError(this.handleError)
    )
  }

  getTeamByEmail(userEmail: string): Observable<any> {
    const url = `${this.apiURL}/get-team-by-email/${userEmail}`
    return this.http.get(url)
  }
  
  getSuggestedPlayers(email: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiURL}/get-suggested-players/${email}`).pipe(
      catchError(this.handleError)
    )
  }

  updatePreferredPositions(email: string, preferredPosition: string[]): Observable<any> {
    const updateData = { preferredPosition }
    console.log(preferredPosition)
    
    return this.http.patch<any>(`${this.apiURL}/update-preferred-positions/${email}`, updateData).pipe(
      catchError(this.handleError)
    )
  }

  getTeamPreferredPositions(email: string): Observable<any> {
    const url = `${this.apiURL}/get-team-by-email/${email}`
    return this.http.get(url)
  }
  
  addTeam(user: Team): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/register`, user).pipe(
      catchError((error: any) => {
        let errorMessage = 'An error occurred while creating the team. Please try again later.'
        if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
        return throwError(errorMessage)
      })
    )
  }

  isExists(email: string): boolean {
    return this.teams.some(team => team.email === email)
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiURL}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.message === 'Logged in successfully.') {
            const team: Team = response.team
            this.currentUser.next(team)
            localStorage.setItem('user_team', JSON.stringify(team))
          } else {
            throw new Error(response.message)
          }
        }),
        map(() => true),
        catchError(error => {
          if (error.error && error.error.message) {
            throw new Error(error.error.message)
          } else {
            throw new Error('Something went wrong')
          }
        })
      )
  }

  logout(): void {
    localStorage.removeItem('user_team')
    this.currentUser.next(null)
    this.router.navigate(['/profile'])
  }
  
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message)
    } else {
      console.error(
        `Backend returned code ${error.status}, body was:`, error.error)
    }
    return throwError('Something went wrong. Please try again later.')
  }
  
  updateProfilePicture(teamId: string, file: File): Observable<any> {
    const formData: FormData = new FormData()
    formData.append('profileImg', file, file.name)
  
    console.log('profile image: ', formData)
  
    return this.http.put<any>(`${this.apiURL}/updateProfilePicture/${teamId}`, formData).pipe(
      catchError((error: any) => {
        let errorMessage = 'An error occurred while updating the profile picture. Please try again later.'
        if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
        return throwError(errorMessage)
      })
    )
  }

  getTeamPlayers(teamEmail: string): Observable<Player[]> {
    const apiUrl = `${this.apiURL}/getTeamPlayers/${teamEmail}`
    return this.http.get<Player[]>(apiUrl)
  }

  removePlayerFromTeam(playerEmail: string): Observable<any> {
    const apiUrl = `${this.apiURL}/removePlayerFromTeam/${playerEmail}`
    return this.http.delete(apiUrl)
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value
  }

  addTeamDescription(teamEmail: string, description: string): Observable<any> {
    const url = `${this.apiURL}/addDescription/${teamEmail}`;
    return this.http.post(url, { description });
  }  

  getTeamDescription(teamEmail: string): Observable<any> {
    const url = `${this.apiURL}/getDescription/${teamEmail}`
    return this.http.get(url)
  }
  
  getSelectedPositionsFromStorage(): string[] {
    const storedPositions = localStorage.getItem('selectedPositions')
    return storedPositions ? JSON.parse(storedPositions) : []
  }
  
  setSelectedPositionsToStorage(selectedPositions: string[]): void {
    localStorage.setItem('selectedPositions', JSON.stringify(selectedPositions))
  }
}