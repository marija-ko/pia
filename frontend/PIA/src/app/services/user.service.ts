import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import { Book, GENRES } from '../models/books';
import { Comment } from '../models/comments';
import { ReadBook } from '../models/readBooks';
import { User } from '../models/users';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private comments: Comment[] = [];
  private commentsUpdated = new Subject<Comment[]>();

  private users: User[] = [];
  private usersUpdated = new Subject<User[]>();

 
    constructor(private http: HttpClient){}

    getUser(username: string) {
        return this.http.get<{
            user: {_id: string,
            name : string,
            surname: string,
            username: string,
            password: string,
            photo: string,
            birthdate: Date,
            city: string,
            country: string,
            email:string,
            status: string,
            lastSeen: Date} }>(
          environment.apiBaseUrl + '/users/' + username
        )
      }

      getUsers(){
        this.http.get<{message: string, users: any}>(environment.apiBaseUrl + '/users/list').pipe(map(data=>{
          return data.users.map(user=>{
            return {
              name: user.name,
              surname: user.surname,
              username: user.username,
              password: user.password,
              photo: user.photo,
              birthdate: new Date(user.birthdate),
              city: user.city,
              country: user.country,
              email: user.email,
              lastSeen: new Date(user.lastSeen),
              id: user._id,
              status: user.status,
            }
          })
        }))
        .subscribe(data => {
          this.users = data;
          this.usersUpdated.next([...this.users]);
    
        })
      }

      getUserUpdateListener() {
        return this.usersUpdated.asObservable();
      }

      deleteUser(id){
        return this.http.delete(environment.apiBaseUrl + '/users/' + id);

      }

      getComments(userId: string) {
        this.http.get<{message: string, comments: any}>(environment.apiBaseUrl + '/users/'+userId+'/comments').pipe(map(data=>{
          return data.comments.map(comment=>{
            return {
              bookId: comment.bookId, 
              userId: comment.userId,
              body: comment.body, 
              id: comment._id,          
              bookTitle: comment.bookTitle,
              bookAuthors: comment.bookAuthors,
              rating: comment.rating,
              username: comment.username
            }
          })
        }))
        .subscribe(data => {
          this.comments = data;
          this.commentsUpdated.next([...this.comments]);
    
        })
      }

      getCommentUpdateListener() {
        return this.commentsUpdated.asObservable();
      }

     


        
}
