import { Invitation } from "./invitation"
import { Player } from "./player"

export class Team {
  name: string
  address: string
  phoneNumber: string
  email: string
  password: string
  managerName: string
  dateOfBirth: Date
  profileImg: string
  preferredPosition?: string[]
  suggestedPlayers?: Player[]
  teamPlayers?: Player[]
  description?: string

  constructor(name: string, address: string, phoneNumber: string, email: string, password: string, managerName: string, dateOfBirth: Date, profileImg: string, preferredPosition?: string[], suggestedPlayers?: Player[], teamPlayers?: Player[], description?: string) {
    this.name = name
    this.address = address
    this.phoneNumber = phoneNumber
    this.email = email
    this.password = password
    this.managerName = managerName
    this.dateOfBirth = dateOfBirth
    this.profileImg = profileImg
    this.preferredPosition = preferredPosition
    this.suggestedPlayers = suggestedPlayers
    this.teamPlayers = teamPlayers
    this.description = description
  }
}
