import { Chat } from "./chat";

export class Message {
  sender: string;
  content: string;
  chat: Chat;

  constructor(sender: string, content: string, chat: Chat) {
    this.sender = sender;
    this.content = content;
    this.chat = chat;
  }
}