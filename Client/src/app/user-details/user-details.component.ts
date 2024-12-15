import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Post } from '../model/post'
import { PostService } from '../services/post.service'
import { Observable, take } from 'rxjs'
import { Player } from '../model/player'
import { Team } from '../model/team'
import { PlayerService } from '../services/player.service'
import { TeamService } from '../services/team.service'
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>
  profileImg: string = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  currentUser!: Player | Team
  selectedPositionsForm: FormGroup
  players: Player[] = []
  postId: string = ''
  post: Post | undefined
  posts: Post[] = []
  user: any = {}
  teamEmail: string = ''
  currentUserP$!: Observable<Player | null>
  currentUserT$!: Observable<Team | null>
  isPlayerLoggedIn: boolean = false
  isTeamLoggedIn: boolean = false
  playerNames: string[] = []
  teamNames: string[] = []
  selectedPositions: string[] = []
  positions: string[] = ['Striker', 'Midfielder', 'Defence', 'Goalkeeper']
  description: string = ''
  displayDescription: string = ''


  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private postService: PostService, private playerService: PlayerService, private teamService: TeamService, private router: Router) {
    this.currentUserP$ = this.playerService.getCurrentUser()
    this.currentUserT$ = this.teamService.getCurrentUser()

    this.selectedPositionsForm = this.formBuilder.group({
      selectedPositions: new FormControl([]),
    })
  }

  ngOnInit(): void {
    Promise.all([
      this.currentUserP$.pipe(take(1)).toPromise(),
      this.currentUserT$.pipe(take(1)).toPromise(),
    ]).then(([player, team]) => {
      if (!player && !team) {
        this.router.navigate(['profile'])
      } else {
        this.loadUserData()
        this.getTeamDescription()
      }
    })

    this.getTeamDescription()
  }

  private loadUserData() {
    this.route.params.subscribe(params => {
      this.postId = params['postId']
      this.getUserPosts()
    })

    this.playerService.getCurrentUser().subscribe(player => {
      console.log('Player:', player)
      this.isPlayerLoggedIn = player !== null
      if (player) {
        this.currentUser = player
        this.profileImg = this.formatProfileImage(player.profileImg)
        console.log('Profile Image:', player.profileImg)
      }
    })

    this.teamService.getCurrentUser().subscribe(team => {
      this.isTeamLoggedIn = team !== null

      if (team) {
        this.currentUser = team
        this.profileImg = this.formatProfileImage(team.profileImg)
        this.teamEmail = team.email
        this.getTeamPlayers(team.email)
    
        if (this.selectedPositionsForm) {
          this.teamService.getTeamPreferredPositions(this.teamEmail).subscribe(
            (preferredPositions: string[]) => {
              this.selectedPositionsForm.get('selectedPositions')?.setValue(preferredPositions)
            },
            error => {
              console.error('Error fetching preferred positions from the database:', error)
            }
          )
        }
      }
    })

    this.updateProfileImageInPosts(this.currentUser.email)
    this.fetchPlayerNames()
    this.fetchTeamNames()
  }

  private formatProfileImage(imagePath: string): string {
    if (imagePath) {
      return `http://localhost:8000/${imagePath}`
    }

    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  }

  private updateProfileImageInPosts(authorEmail: string): void {
    this.postService.getPostsByAuthorEmail(authorEmail).subscribe(
      (posts: Post[]) => {
        for (const post of posts) {
          post.profileImg = this.profileImg

          this.postService.editPost(post).subscribe(
            updatedPost => {
              console.log(`Profile image updated in post: ${updatedPost._id}`)
            },
            error => {
              console.error(`Error updating profile image in post: ${post._id}`, error)
            }
          )
        }
      },
      error => {
        console.error('Error fetching posts by author email:', error)
      }
    )
  }

  onPositionChange(position: string) {
    const selectedPositions = this.teamService.getSelectedPositionsFromStorage()
    const index = selectedPositions.indexOf(position)

    if (index !== -1) {
      selectedPositions.splice(index, 1)
    } else {
      selectedPositions.push(position)
    }

    this.teamService.setSelectedPositionsToStorage(selectedPositions)

    this.teamService.updatePreferredPositions(this.teamEmail, selectedPositions)
      .subscribe(
        response => {
          console.log('Preferred positions updated successfully.')
        },
        error => {
          console.error('Error updating preferred positions:', error)
        }
      )
  }

  isPositionSelected(position: string): boolean {
    const selectedPositions = this.teamService.getSelectedPositionsFromStorage()
    return selectedPositions.includes(position)
  }

  getTeamPlayers(teamEmail: string) {
    this.teamService.getTeamPlayers(teamEmail).subscribe(players => {
      this.players = players
    })
  }

  getUserPosts(): void {
    let authorEmail = ''

    if (this.currentUserP$) {
      this.currentUserP$.subscribe(currentUser => {
        if (currentUser && currentUser.email) {
          authorEmail = currentUser.email
        }
      })
    } else {
      console.log('Author Email:', authorEmail)
    }

    if (this.currentUserT$) {
      this.currentUserT$.subscribe(currentUser => {
        if (currentUser && currentUser.email) {
          authorEmail = currentUser.email
        }
      })
    } else {
      console.log('Author Email:', authorEmail)
    }

    this.postService.getPostsByAuthorEmail(authorEmail).subscribe(
      (response: any[]) => {
          this.posts = response.map(post => ({
              ...post,
              image: post.image ? `http://localhost:8000/${post.image}` : undefined,
              video: post.video ? `http://localhost:8000/${post.video}` : undefined
          }))
  
          console.log('Fetched Posts:', this.posts)
      },
      (error) => {
          console.error('Error retrieving posts:', error)
      }
    )
  }

  fetchPlayerNames() {
    this.playerService.getPlayers().subscribe(players => {
      this.playerNames = players.map(player => player.name)
    })
  }

  fetchTeamNames() {
    this.teamService.getTeams().subscribe(teams => {
      this.teamNames = teams.map(team => team.name)
    })
  }

  openFileInput(): void {
    console.log('Button clicked')
    this.fileInput.nativeElement.click()
  }  

  onFileSelected(event: any): void {
    const file: File = event.target.files[0]
    if (file) {
      const reader = new FileReader()
  
      reader.onload = (e: any) => {
        this.profileImg = e.target.result
  
        if (this.isTeamLoggedIn) {
          this.currentUserT$.subscribe(currentUser => {
            const teamId = currentUser?.email
            if (teamId) {
              this.teamService.updateProfilePicture(teamId, file).subscribe(
                (response) => {
                  console.log('API Response:', response)
                  this.profileImg = response.profileImg || this.profileImg

                  if (response.profileImg !== currentUser?.profileImg) {
                    const updatedTeam = { ...currentUser, profileImg: response.profileImg }
                    this.teamService.currentUser.next(updatedTeam)
                    localStorage.setItem('user_team', JSON.stringify(updatedTeam))
                    console.log('Profile picture updated successfully for team.')
                  }
                },
                error => {
                  console.error('Error updating profile picture for team:', error)
                }
              )
            }
          })
        } else if(this.isPlayerLoggedIn) {
          this.currentUserP$.subscribe(currentUser => {
            const playerId = currentUser?.email
            if (playerId) {
              this.playerService.updateProfilePicture(playerId, file).subscribe(
                (response) => {
                  console.log('API Response:', response)
                  this.profileImg = response.profileImg || this.profileImg
  
                  if (response.profileImg !== currentUser?.profileImg) {
                    const updatedPlayer = { ...currentUser, profileImg: response.profileImg }
                    this.playerService.currentUser.next(updatedPlayer)
                    localStorage.setItem('user_player', JSON.stringify(updatedPlayer))
                    console.log('Profile picture updated successfully for player.')
                  }
                },
                error => {
                  console.error('Error updating profile picture for player:', error)
                }
              )
            }
          })
        }
      }

      reader.readAsDataURL(file)

      location.reload()
    }
  }

  removePlayer(playerEmail: string) {
    const confirmation = window.confirm('Are you sure you want to remove this player from the team?')
  
    if (confirmation) {
      this.teamService.removePlayerFromTeam(playerEmail).subscribe(
        (response) => {
          this.getTeamPlayers(this.teamEmail)
        },
        (error) => {
          console.error('Error removing player from team:', error)
        }
      )
    }
  }  

  deletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe(
      () => {
        this.posts = this.posts.filter(post => post._id !== postId)
        console.log(`Post with ID ${postId} deleted.`)
      },
      error => {
        console.error(`Error deleting post with ID ${postId}:`, error)
      }
    )
    window.alert("Post deleted successfully")
  }

  addTeamDescription() {
    this.teamService.addTeamDescription(this.teamEmail, this.description).subscribe(
      (response) => {
        console.log('Team description added successfully:', response);
        this.getTeamDescription();
      },
      (error) => {
        console.error('Error adding team description:', error);
      }
    );
  }
  
  getTeamDescription() {
    if (this.isTeamLoggedIn) {
      this.teamService.getTeamDescription(this.teamEmail).subscribe(
        (response) => {
          console.log('Team description received successfully:', response);
          this.displayDescription = response.description;
        },
        (error) => {
          console.error('Error getting team description:', error);
        }
      );
    }
  }
}