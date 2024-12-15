export interface Post {
  _id?: string
  authorType: string
  profileImg: string
  authorName: string
  authorEmail: string
  content: string
  image?: string
  video?: string
  createdAt?: Date
  updatedAt?: Date
}
