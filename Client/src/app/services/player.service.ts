import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Player } from '../model/player'
import { catchError, map, tap } from 'rxjs/operators'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  
  apiURL: string = 'http://localhost:8000/players'
  headers = {'content-type':'application/json'}
  players: Player[] = []
  currentUser: BehaviorSubject<Player | null> = new BehaviorSubject<Player | null>(null)
  
  constructor(private router: Router, private http: HttpClient) { 
    this.checkUserInLocalStorage()
  }

  getCurrentUser(): Observable<Player | null> {
    return this.currentUser.asObservable()
  }

  private checkUserInLocalStorage(): void {
    const user_player = localStorage.getItem('user_player')
    if (user_player) {
      this.currentUser.next(JSON.parse(user_player))
    }
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiURL}/get-players`).pipe(
      catchError(this.handleError)
    )
  }

  getPlayerByEmail(userEmail: string): Observable<any> {
    const url = `${this.apiURL}/get-player-by-email/${userEmail}`
    return this.http.get(url)
  }

  getUserByEmail(userEmail: string): Observable<any> {
    const url = `${this.apiURL}/getUserByEmail/${userEmail}`
    return this.http.get(url)
  }

  getPlayerById(userId: string): Observable<any> {
    const url = `${this.apiURL}/get-player-by-id/${userId}`
    return this.http.get(url)
  }

  addPlayer(user: Player): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/register`, user).pipe(
      catchError((error: any) => {
        let errorMessage = 'An error occurred while creating the player. Please try again later.'
        if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
        return throwError(errorMessage)
      })
    )
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiURL}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.message === 'Logged in successfully.') {
            const player: Player = response.player
            this.currentUser.next(player)
            localStorage.setItem('user_player', JSON.stringify(player))
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
    localStorage.removeItem('user_player')
    this.currentUser.next(null)
    this.router.navigate(['/profile'])
  }  

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message)
    } else {
      console.error(
    `Backend returned code ${error.status}, ` +
    `body was: ${error.error}`
    )
    }
    return throwError('Something bad happened, please try again later.')
  }

  isExists(email: string): boolean {
    return this.players.some(player => player.email === email)
  }

  updatePlayer(playerEmail: string, player: Player): Observable<any> {
    return this.http.put<any>(`${this.apiURL}/update-player/${playerEmail}`, player).pipe(
      catchError((error: any) => {
        let errorMessage = 'An error occurred while updating the player. Please try again later.'
        if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
        return throwError(errorMessage)
      })
    )
  }

  updateProfilePicture(playerId: string, file: File): Observable<any> {
    const formData: FormData = new FormData()
    formData.append('profileImg', file, file.name)
  
    return this.http.put<any>(`${this.apiURL}/updateProfilePicture/${playerId}`, formData).pipe(
      catchError((error: any) => {
        let errorMessage = 'An error occurred while updating the profile picture. Please try again later.'
        if (error.error && error.error.message) {
          errorMessage = error.error.message
        }
        return throwError(errorMessage)
      })
    )
  }
  
  isLoggedIn(): boolean {
    return !!this.currentUser.value
  }
}