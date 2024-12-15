import { DatePipe } from '@angular/common'
import { Component, ViewChild, ElementRef } from '@angular/core'
import { PostService } from '../services/post.service'
import { Post } from '../model/post'
import { PlayerService } from '../services/player.service'
import { TeamService } from '../services/team.service'
import { Observable, combineLatest, take } from 'rxjs'
import { Router } from '@angular/router'
import { Player } from '../model/player'
import { Team } from '../model/team'

declare var $: any

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('imageModalInput') imageModalInput!: ElementRef
  @ViewChild('videoModalInput') videoModalInput!: ElementRef
  videoError: string = ''
  imageError: string = ''
  message: string = ''
  authorType: string = ''
  posts: Post[] = []
  suggestedPlayers: any[] = []
  profileImg: string = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  isPlayerLoggedIn: boolean = false
  isTeamLoggedIn: boolean = false
  currentUserP$: Observable<Player | null>
  currentUserT$: Observable<Team | null>

  constructor(private postService: PostService, private playerService: PlayerService, private teamService: TeamService, private router: Router, private datePipe: DatePipe) {
    this.currentUserP$ = this.playerService.getCurrentUser()
    this.currentUserT$ = this.teamService.getCurrentUser()
  }

  ngOnInit() {
    Promise.all([
      this.currentUserP$.pipe(take(1)).toPromise(),
      this.currentUserT$.pipe(take(1)).toPromise()
    ]).then(([player, team]) => {
      if (!player && !team) {
        this.router.navigate(['profile'])
      } else {
        this.updatePosts()
        this.fetchSuggestedPlayers()
      }
    })
  }

  handleFileInput(event: any, fileType: string): void {
    const file = event.target.files[0]
  
    if (fileType === 'video' && file.type.startsWith('video/')) {
      this.videoError = ''
      this.handleValidFileType(fileType, file)
    } else if (fileType === 'image' && file.type.startsWith('image/')) {
      this.imageError = ''
      this.handleValidFileType(fileType, file)
    } else {
      if (fileType === 'video') {
        this.videoError = 'Invalid file type. Please select a video file.'
      } else if (fileType === 'image') {
        this.imageError = 'Invalid file type. Please select an image file.'
      }
      event.target.value = ''
    }
  }
  
  handleValidFileType(fileType: string, file: File): void {
    const formData = new FormData()
    formData.append(fileType, file)
    formData.append('content', this.message)
  
    this.createPost(formData)
  }
  
  postContent() {
    if (!this.message) {
      return
    }

    const formData = new FormData()
    formData.append('content', this.message)
    this.createPost(formData)
  }

  createPost(formData: FormData) {
    combineLatest([
      this.playerService.currentUser.asObservable(),
      this.teamService.currentUser.asObservable()
    ]).subscribe(([currentUserP, currentUserT]) => {
      let currentUser
      let profileImg: string = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  
      if (currentUserP !== null) {
        currentUser = currentUserP
        this.authorType = 'Player'
      } else if (currentUserT !== null) {
        currentUser = currentUserT
        this.authorType = 'Team'
      } else {
        this.authorType = 'Unknown'
      }
      
      if (currentUser) {
        formData.append('authorEmail', currentUser.email)
        formData.append('authorName', currentUser.name)
        formData.append('profileImg', currentUser.profileImg || profileImg)
      }
  
      formData.append('authorType', this.authorType)
  
      this.postService.createPost(formData).subscribe(
        (response) => {
          $('#messageModal').modal('hide')
          $('#imageModal').modal('hide')
          $('#videoModal').modal('hide')
  
          this.message = ''
          this.clearFileInputs()
  
          this.posts.unshift(response)
          this.updatePosts()
          window.alert("Uploaded successfully")
        },
        (error) => {
          console.error('Error posting content:', error)
        }
      )
    })
  }

  clearFileInputs() {
    this.imageModalInput.nativeElement.value = ''
    this.videoModalInput.nativeElement.value = ''
  }

  updatePosts() {
    this.postService.getAllPosts().subscribe(
      (response: any[]) => {
        this.posts = response.map(post => ({
          ...post,
          image: post.image ? `http://localhost:8000/${post.image}` : undefined,
          video: post.video ? `http://localhost:8000/${post.video}` : undefined
        }))
      },
      (error) => {
        console.error('Error retrieving posts:', error)
      }
    )
  }

  fetchSuggestedPlayers() {
    combineLatest([
      this.playerService.getCurrentUser(),
      this.teamService.getCurrentUser()
    ]).subscribe(([currentUserP, currentUserT]) => {
      if (currentUserT) {
        this.teamService.getSuggestedPlayers(currentUserT.email).subscribe(
          (suggestedPlayers: Player[]) => {
            this.suggestedPlayers = suggestedPlayers.map((suggestion: Player) => ({
              teamName: currentUserT.name,
              suggestedPlayers: [suggestion]
            }))
          },
          (error) => {
            console.error('Error retrieving suggested players:', error)
          }
        )
      }
    })
  }
}