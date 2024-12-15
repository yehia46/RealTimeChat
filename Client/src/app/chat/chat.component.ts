import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core'
import { ChatService } from '../services/chat.service'
import { PlayerService } from '../services/player.service'
import { TeamService } from '../services/team.service'
import { Observable } from 'rxjs'
import { Player } from '../model/player'
import { Team } from '../model/team'
import { Chat } from '../model/chat'
import { Message } from '../model/message'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('chatBody') chatBody!: ElementRef;

  currentUserP$: Observable<Player | null>
  currentUserT$: Observable<Team | null>
  isPlayerLoggedIn: boolean = false
  isTeamLoggedIn: boolean = false
  typing = false

  chatId: string = ''
  messageText: string = ''
  messageArray: Message[] = []
  storageArray: any[] = []

  currentUser!: Player | Team
  selectedUser!: Player | Team

  userList: { [chatId: string]: (Player | Team)[] } = {}
  profileImg: string = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  notification: Message[] = [];
  fetchAgain: boolean = false;


  constructor(private playerService: PlayerService, private teamService: TeamService, private chatService: ChatService) {
    this.currentUserP$ = this.playerService.getCurrentUser()
    this.currentUserT$ = this.teamService.getCurrentUser()
  }

  ngOnInit(): void {
    this.playerService.getCurrentUser().subscribe((player: Player | null) => {
      this.isPlayerLoggedIn = player !== null
      if (player) {
        this.currentUser = player
      }
    })

    this.teamService.getCurrentUser().subscribe((team: Team | null) => {
      this.isTeamLoggedIn = team !== null
      if (team) {
        this.currentUser = team
      }
    })

    this.chatService.requestChats(this.currentUser.email)

    this.chatService.receiveChats().subscribe((chat: Chat | null) => {
      if (chat) {
        if (chat.users && chat.users.length >= 2) {
          const [user1, user2] = chat.users
          if (this.currentUser.email === user1) {
            this.getUser(user2, chat._id)
          } else if (this.currentUser.email === user2) {
            this.getUser(user1, chat._id)
          }
        }
      }
    })

    this.chatService.getMessage((newMessageReceived: any) => {
      if (this.chatId) {
        this.messageArray.push(newMessageReceived);
        this.chatService.setStorage(this.messageArray);
      }
  
      if (!this.chatId || this.chatId !== newMessageReceived.chat.toString) {
        console.log('this.notification', this.selectedUser.email, newMessageReceived.sender);
        if (!this.notification.includes(newMessageReceived)) {
          this.notification = [newMessageReceived, ...this.notification];
          this.fetchAgain = !this.fetchAgain;
        }
      }
      console.log('this.notification', this.notification);
    });

    this.messageArray = this.chatService.getStorage();
  }

  getUser(email: string, chatId: string) {
    this.playerService.getUserByEmail(email).subscribe((user: Player | Team | null) => {
      if (user) {
        if (this.userList[chatId]) {
          this.userList[chatId].push(user)
        } else {
          this.userList[chatId] = [user]
        }
      }
    })
  }

  selectUserHandler(user: Player | Team, chatId: string): void {
    this.selectedUser = user
    this.chatId = chatId

    this.join(this.chatId, this.currentUser.email, this.selectedUser.email)
  }
  
  join(chatId: string, useremail1: string, useremail2: string): void {
    this.chatService.joinChat({_id: chatId, user1: useremail1, user2: useremail2})
  }

  private scrollChatToBottom(): void {
    try {
      if (this.chatContainer && this.chatContainer.nativeElement && this.chatBody && this.chatBody.nativeElement) {
        this.chatContainer.nativeElement.scrollTo({
          top: this.chatBody.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  sendMessage(): void {
    if (this.messageText != '') {
      if (this.chatId && this.selectedUser) {
        const data = {
          sender: this.currentUser.email,
          content: this.messageText,
          chat: this.chatId,
        }
  
        this.chatService.sendMessage(data)
  
        this.messageText = ''

        this.scrollChatToBottom()
      }
    }
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollChatToBottom();
    }, 0);
  }
  
  typingHandler(isTyping: boolean) {
    if (this.chatId && this.selectedUser) {
      const data = {
        isTyping,
        chat: this.chatId
      };
  
      this.chatService.sendTypingStatus(data);
    }
  }
}