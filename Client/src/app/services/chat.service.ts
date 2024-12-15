import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { io, Socket } from 'socket.io-client'

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  socket: Socket
  apiURL: string = 'http://localhost:8000'

  constructor() {
    this.socket = io(this.apiURL, { transports: ['websocket', 'polling', 'flashsocket'] })
  }

  joinChat(room: any): void {
    this.socket.emit('join', room)
  }

  sendMessage(newMessage: any): void {
    this.socket.emit('new message', newMessage)
  }

  getMessage(callback: (messageReceived: any) => void) {
    this.socket.on('message received', (messageReceived) => {
      callback(messageReceived);
    });
  }

  requestChats(email: string): void {
    this.socket.emit("request chats", email);
  }

  receiveChats(): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on('chats received', (chatReceived) => {
        if (Array.isArray(chatReceived)) {
          chatReceived.forEach(chat => observer.next(chat));
        } else {
          observer.next(chatReceived);
        }
      });
  
      return () => {
        this.socket.disconnect();
      }
    });
  }

  sendTypingStatus(data: any) {
    this.socket.emit('typing', data);
    console.log(data);
    
  }

  receiveTypingStatus(callback: () => void) {
    this.socket.on('typing...', (data) => {
      callback();
    });
  }

  getStorage(): any[] {
    const storage: string | null = localStorage.getItem('message');
    return storage ? JSON.parse(storage) : [];
  }
  
  setStorage(data: any[]): void {
    localStorage.setItem('message', JSON.stringify(data));
  }
}