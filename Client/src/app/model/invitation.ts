export class Invitation {
  _id: string
  invitingTeam: string
  invitedPlayer: string
  status: 'pending' | 'accepted' | 'declined'
  rejectionReason: string

  constructor(_id: string, invitingTeam: string, invitedPlayer: string, rejectionReason: string) {
    this._id = _id
    this.invitingTeam = invitingTeam
    this.invitedPlayer = invitedPlayer
    this.status = 'pending'
    this.rejectionReason = rejectionReason
  }
}