import { Invitation } from "./invitation"
import { Team } from "./team"

export class Player {
  name: string
  dateOfBirth: Date
  address: string
  phoneNumber: string
  email: string
  password: string
  preferredPosition: string
  profileImg: string
  inTeam: boolean
  team: string
  teamInvitations: Invitation[] = []

  constructor(name: string, dateOfBirth: Date, address: string, phoneNumber: string, email: string, password: string, preferredPosition: string, profileImg: string) {
    this.name = name
    this.dateOfBirth = dateOfBirth
    this.address = address
    this.phoneNumber = phoneNumber
    this.email = email
    this.password = password
    this.preferredPosition = preferredPosition
    this.profileImg = profileImg
    this.inTeam = false
    this.team = ''
    this.teamInvitations = []
  }
}