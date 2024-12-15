import { Component, ElementRef, OnInit, SimpleChange, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PlayerService } from '../services/player.service'
import { TeamService } from '../services/team.service'
import { Observable, catchError, map, of, switchMap } from 'rxjs'
import { PostService } from '../services/post.service'
import { InvitationsService } from '../services/invitations.service'
import { Team } from '../model/team'
import { Invitation } from '../model/invitation'
import { Player } from '../model/player'
import { ChatService } from '../services/chat.service'

@Component({
  selector: 'app-other-users',
  templateUrl: './other-users.component.html',
  styleUrls: ['./other-users.component.css']
})
export class OtherUsersComponent implements OnInit {
  currentUserP$: Observable<Player | null>
  currentUserT$: Observable<Team | null>
  postId: string = ''
  isPlayerLoggedIn: boolean = false
  isTeamLoggedIn: boolean = false
  profileImg: string = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  posts: any[] = []
  name: string = ''
  dateOfBirth: string = ''
  address: string = ''
  phoneNumber: string = ''
  email: string = ''
  preferredPosition: string = ''
  managerName: string = ''
  isPlayer = true
  currentUser!: Player | Team
  user!: Player | Team
  playerAlreadyInTeam = false
  teamName: string = ''
  displayDescription: string = ''

  constructor(private route: ActivatedRoute, private postService: PostService, private playerService: PlayerService, private teamService: TeamService, private inviteService: InvitationsService, private chatService: ChatService, private router: Router) {
    this.currentUserP$ = this.playerService.getCurrentUser()
    this.currentUserT$ = this.teamService.getCurrentUser()
  }

  getUserByEmail(email: string): Observable<any> {
    if (this.isPlayer) {
      return this.playerService.getPlayerByEmail(email)
    } else {
      return this.teamService.getTeamByEmail(email)
    }
  }

  ngOnInit(): void {
    this.checkLoginStatus()

    this.currentUserP$.subscribe((player: Player | null) => {
      if (player) {
        this.currentUser = player
      }
    })

    this.currentUserT$.subscribe((team: Team | null) => {
      if (team) {
        this.currentUser = team
      }
    })

    this.route.params.pipe(
      switchMap(params => {
        const userEmail = params['email']
        return this.playerService.getPlayerByEmail(userEmail).pipe(
          catchError(error => {
            this.isPlayer = false
            return this.teamService.getTeamByEmail(userEmail)
          })
        )
      })
    ).subscribe((user: any) => {
      if (user) {
        if (this.isPlayer) {
          this.profileImg = this.formatProfileImage(user.profileImg)
          this.name = user.name
          this.email = user.email
          this.address = user.address
          this.phoneNumber = user.phoneNumber
          this.dateOfBirth = user.dateOfBirth
          this.preferredPosition = user.preferredPosition
          this.teamName = user.team
          
          if (this.isTeamLoggedIn) {
            if (this.currentUser.email == this.teamName) {
              this.playerAlreadyInTeam = true
            }
          }
          
        } else {
          this.profileImg = this.formatProfileImage(user.profileImg)
          this.name = user.name
          this.managerName = user.managerName
          this.phoneNumber = user.phoneNumber
          this.address = user.address
          this.email = user.email
          this.getTeamDescription(this.email)
        }
      }
    },
    error => {
      console.error('Error retrieving user details:', error)
    })

    this.loadUserData()
  }

  private loadUserData() {
    this.route.params.subscribe(params => {
      this.postId = params['postId']
      this.getUserPosts()
    })
  }

  getTeamDescription(email: string) {
    console.log("getTeamDescription start");
  
    console.log("Team Email:", this.email, this.isPlayer);
    if (!this.isPlayer) {
      this.teamService.getTeamDescription(this.email).subscribe(
        (response) => {
          console.log('Team description received successfully:', response);
          this.displayDescription = response.description;
        },
        (error) => {
          console.error('Error getting team description:', error);
        }
      );
    }
  
    console.log("getTeamDescription end");
  }  

  private formatProfileImage(imagePath: string): string {
    if (imagePath) {
      return `http://localhost:8000/${imagePath}`
    }

    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  }

  private checkLoginStatus() {
    this.isPlayerLoggedIn = this.playerService.isLoggedIn()
    this.isTeamLoggedIn = this.teamService.isLoggedIn()
  }

  // get the posts by the user email
  getUserPosts(): void {
    this.route.params.pipe(
      switchMap(params => {
        const userEmail = params['email']
        return this.playerService.getPlayerByEmail(userEmail).pipe(
          catchError(error => {
            this.isPlayer = false
            return this.teamService.getTeamByEmail(userEmail)
          })
        )
      }),
      switchMap((user: any) => {
        if (user) {
          const authorEmail = user.email

          return this.postService.getPostsByAuthorEmail(authorEmail).pipe(
            map((response: any[]) => {
              return response.map(post => ({
                ...post,
                image: post.image ? `http://localhost:8000/${post.image}` : undefined,
                video: post.video ? `http://localhost:8000/${post.video}` : undefined
              }))
            }),
            catchError(error => {
              console.error('Error retrieving posts:', error)
              return of([])
            })
          )
        } else {
          return of([])
        }
      })
    ).subscribe((posts: any[]) => {
      this.posts = posts
      console.log('Fetched Posts:', this.posts)
    },
    error => {
      console.error('Error retrieving user details:', error)
    })
  }
  
  sendInvitation(): void {
    if (this.isTeamLoggedIn) {
      this.teamService.getCurrentUser().subscribe((team: Team | null) => {
        if (team) {
          const playerEmail = this.email
  
          this.playerService.getPlayerByEmail(playerEmail).subscribe((player: Player | null) => {
            if (player) {
              if (player.team) {
                window.alert('Player is already a member of a team.')
              } else {
                this.inviteService.getInvitations(player.email).subscribe((invitations: Invitation[] | null) => {
                  if (invitations) {
                    const check = invitations.some(invitation => invitation.status === 'pending' || invitation.status === 'accepted')
                    if (check) {
                      window.alert('Player already has a pending or accepted invitation.')
                    } else {

                      this.playerService.updatePlayer(player.email, player).subscribe(
                        (updatedPlayer: Player) => {
                          console.log('Player information updated:', updatedPlayer)

                          this.inviteService.sendInvitation(team.email, updatedPlayer.email).subscribe(
                            (response) => {
                              window.alert('Invitation sent')
                              console.log('Invitation sent:', response)
                            },
                            (error) => {
                              console.error('Error sending invitation:', error)
                            }
                          )
                        },
                        (error) => {
                          console.error('Error updating player information:', error)
                        }
                      )
                    }
                  } else {
                    console.error('Invite data is not available.')
                  }
                })
              }
            } else {
              console.error('Player data is not available.')
            }
          })
        } else {
          console.error('Team data is not available.')
        }
      })
    }
  }

  join() {
    if (this.isPlayerLoggedIn || this.isTeamLoggedIn) {
      const user1 = this.currentUser.email
      const user2 = this.email
  
      const users = { user1, user2 }

      this.chatService.joinChat(users)

      console.log('data', users)
      
      this.router.navigate(['/chat'])
    }
  }
}