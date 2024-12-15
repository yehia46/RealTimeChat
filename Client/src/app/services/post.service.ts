import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Post } from '../model/post'

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiURL = 'http://localhost:8000/posts'

  constructor(private http: HttpClient) { }

  createPost(postData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.apiURL}/create-post`, postData)
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiURL}/get-all`)
  }

  editPost(post: Post): Observable<Post> {
    const url = `${this.apiURL}/edit/`;
    return this.http.put<Post>(url, post);
  }

  deletePost(id: string): Observable<void> {
    const url = `${this.apiURL}/delete/${id}`
    return this.http.delete<void>(url)
  }

  getPostsByAuthorEmail(authorEmail: string): Observable<Post[]> {
    const url = `${this.apiURL}/get-posts-by-author-email/${authorEmail}`
    return this.http.get<Post[]>(url)
  }
}