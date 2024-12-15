import { Component, OnInit, ViewChild } from '@angular/core'
import { PlayerService } from '../services/player.service'
import { TeamService } from '../services/team.service'
import { tap, Observable } from 'rxjs'
import { Router } from '@angular/router'
import { Player } from '../model/player'
import { Team } from '../model/team'
import { Invitation } from '../model/invitation'
import { InvitationsService } from '../services/invitations.service'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  @ViewChild('rejectModal') rejectModal: any

  invitations: Invitation[] = []
  invitationsFeed: { status: string, count: number, details?: { email?: string, reason?: string }[] }[] = []
  isPlayerLoggedIn: boolean = false
  isTeamLoggedIn: boolean = false
  currentUserP$: Observable<Player | null>
  currentUserT$: Observable<Team | null>
  profileImg: string = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"

  searchEntities: { name: string, email: string, preferredPosition: string }[] = []
  searchResults: { name: string, email: string, preferredPosition: string }[] = []
  teamName: string = ''
  currentUser!: Player | Team
  rejectReason: string = ''

  constructor(private playerService: PlayerService, private teamService: TeamService, private router: Router, private invitationService: InvitationsService) { 
    this.currentUserP$ = this.playerService.getCurrentUser()
    this.currentUserT$ = this.teamService.getCurrentUser()
  }
  
  ngOnInit(): void {
    this.playerService.getCurrentUser().subscribe((player: Player | null) => {
      this.isPlayerLoggedIn = player !== null
      if(this.isPlayerLoggedIn) {
        this.profileImg = this.formatProfileImage(player?.profileImg)
        if(player){
          this.currentUser = player
        }
      }
    })

    this.teamService.getCurrentUser().subscribe((team: Team | null) => {
      this.isTeamLoggedIn = team !== null
      if(this.isTeamLoggedIn) {
        this.profileImg = this.formatProfileImage(team?.profileImg)
        if(team){
          this.currentUser = team
        }
      }
    })

    this.refreshInvitationsPlayer(this.currentUser.email)
    this.refreshInvitationsTeam(this.currentUser.email)
    this.fetchEntities()
    this.updateInvitations()
  }

  private formatProfileImage(imagePath: string | undefined): string {
    if (imagePath) {
      return `http://localhost:8000/${imagePath}`
    }

    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  }
  
  fetchEntities() {
    this.playerService.getPlayers().subscribe(players => {
      players.forEach(player => {
        this.searchEntities.push({ name: player.name, email: player.email, preferredPosition: player.preferredPosition })
      })
    })
    this.teamService.getTeams().subscribe(teams => {
      teams.forEach(team => {
        this.searchEntities.push({ name: team.name, email: team.email, preferredPosition: '' })
      })
    })
  }

  updateInvitations() {
    this.invitationService.getAllInvitations().subscribe((invitations: Invitation[]) => {
      this.invitations = invitations.filter(invitation => invitation.invitedPlayer === this.currentUser.email)
      this.loadTeamName(this.invitations)
    },
    (error) => {
      console.error('Error fetching invitations:', error)
    })
  }

  loadTeamName(invitations: Invitation[]) {
    invitations.forEach(invitation => {
      this.teamService.getTeamByEmail(invitation.invitingTeam).subscribe((team: Team | null) => {
        if (team) {
          this.teamName = team.name
        }
      })
    })
  }

  logout(): void {
    this.playerService.logout()
    this.teamService.logout()
    this.router.navigate(['/profile'])
  }

  onSearchInput(event: any): void {
    const value = event.target.value
    const searchTerm = value.trim().toLowerCase()

    if (!searchTerm) {
      this.searchResults = []
      return
    }

    this.searchResults = this.searchEntities.filter(entity => 
      entity.name.toLowerCase().includes(searchTerm) ||
      entity.email.toLowerCase().includes(searchTerm) ||
      entity.preferredPosition.toLowerCase().includes(searchTerm)
    )
  }

  onSearchResultClick(result: any): void {
    console.log('Clicked on result:', result)
    this.router.navigate(['/other-users', result.email])
    this.searchResults = []
  }

  get isLoggedIn(): boolean {
    return this.isPlayerLoggedIn || this.isTeamLoggedIn
  }

  showInvitations() {
    console.log('Invitations button clicked')
    const invitationModal = document.getElementById('invitationModal')
    if (invitationModal) {
      invitationModal.style.display = 'block'
    }
  }  
  
  acceptInvitation(invitation: Invitation): void {
    this.invitationService.acceptInvitation(invitation._id).subscribe(
      (response) => {
        console.log('Invitation accepted:', response)
        invitation.status = 'accepted'
        this.refreshInvitationsTeam(this.currentUser.email)
        this.updateInvitations()
      },
      (error) => {
        console.error('Error accepting invitation:', error)
      }
    )
  }
  
  rejectInvitation(invitation: Invitation): void {
    this.invitationService.rejectInvitation(invitation._id, this.rejectReason).subscribe(
      (response) => {
        console.log('Invitation rejected:', response)
        invitation.status = 'declined'
        this.refreshInvitationsTeam(this.currentUser.email)
        this.updateInvitations()
        this.closeRejectModal()
      },
      (error) => {
        console.error('Error rejecting invitation:', error)
      }
    )
  }
  
  closeRejectModal(): void {
    this.rejectModal.nativeElement.modal('hide')
  }

  refreshInvitationsPlayer(email: string): void {
    this.invitationService.getInvitations(email).subscribe(
      (invitations) => {
        this.invitations = invitations

      },
      (error) => {
        console.error('Error fetching invitations:', error)
      }
    )
  }

  refreshInvitationsTeam(email: string): void {
    this.invitationService.getTeamInvitationsFeed(email).subscribe(
      (invitations) => {
        this.invitations = invitations
  
        console.log(invitations)
  
        let acceptedCount = 0
        let declinedCount = 0
        let pendingCount = 0
        let declinedDetails: { email?: string; reason?: string }[] = []
  
        invitations.forEach((invitation) => {
          switch (invitation.status) {
            case 'accepted':
              acceptedCount++
              break
            case 'declined':
              declinedCount++
              declinedDetails.push({ email: invitation.invitedPlayer, reason: invitation.rejectionReason })
              console.log(invitation.rejectionReason)
              break
            case 'pending':
              pendingCount++
              break
          }
        })
  
        this.invitationsFeed = [
          { status: 'accepted', count: acceptedCount },
          { status: 'declined', count: declinedCount, details: declinedDetails },
          { status: 'pending', count: pendingCount }
        ]
  
        console.log('Counts:', acceptedCount, declinedCount, pendingCount)
      },
      (error) => {
        console.error('Error fetching invitations:', error)
      }
    )
  }  
}