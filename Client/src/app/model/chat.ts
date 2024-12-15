import { Message } from "./message";
import { Team } from "./team";

export class Chat {
  _id: string;
  isGroup: boolean;
  users: string[];
  message?: Message;
  groupAdmin?: Team;

  constructor(_id: string, users: string[], message: Message, groupAdmin: Team) {
    this._id = _id;
    this.isGroup = false;
    this.users = users;
    this.message = message;
    this.groupAdmin = groupAdmin;
  }
}