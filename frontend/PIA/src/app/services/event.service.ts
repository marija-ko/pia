import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import { EventUser } from '../models/events';
import { EventComment } from '../models/eventComments';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: EventUser[] = [];
  private eventsUpdated = new Subject<EventUser[]>();
  private comments: EventComment[] = [];
  private commentsUpdated = new Subject<EventComment[]>();

  constructor(private http: HttpClient) { }

  getEvents(){
    this.http.get<{message: string, events: any}>(environment.apiBaseUrl + '/events/list')
      .pipe(map(data=>{
        return data.events.map(event=>{
          let end;
          if(!event.end) end = null; else end = new Date(event.end)
          return {
            name: event.name,
            start: new Date(event.start),
            end: end,
            caption: event.caption,
            id: event._id,
            username: event.username,
            status: event.status,
            participants: event.participants
          }
        })
      }))
      .subscribe(data => {
        this.events = data;
        this.eventsUpdated.next([...this.events]);

      })
  }

  getEventUpdateListener() {
    return this.eventsUpdated.asObservable();
  }

  getEvent(id){
    return this.http.get<{message: string, event: {
      name: string,
      start: Date, 
      end: Date, 
      caption: string, 
      _id: string,
      userId: string,
      username: string,
      status: string,
    participants: string[]}}>(environment.apiBaseUrl + '/events/'+id)
  }

  addEvent(event: EventUser){

    return this.http.post<{message: string, event: {
      name: string,
      start: Date, 
      end: Date, 
      caption: string, 
      _id: string,
      userId: string,
      username: string,
      status: string,
    participants: string[]}}>(environment.apiBaseUrl + '/events/add', event)
  }

  updateEvent(event: EventUser) {
    return this.http.put(environment.apiBaseUrl + '/events/' + event.id, event)

  }


  getComments(eventId: string) {
    this.http.get<{message: string, comments: any}>(environment.apiBaseUrl + '/events/'+eventId+'/comments').pipe(map(data=>{
      return data.comments.map(comment=>{
        return {
          eventId: comment.eventId, 
          userId: comment.userId,
          body: comment.body, 
          id: comment._id,
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

  addComment(eventId, body){
    const comment = {
    "body": body,
    "eventId": eventId,
      "id" : null,
  }
    this.http.post<{ message: string; id: string }>(environment.apiBaseUrl + '/events/addComment', comment)
    .subscribe(responseData => {
        const id = responseData.id;
        comment.id = id;
        this.commentsUpdated.next([...this.comments]);
      });
  }

  deleteComment(id) {
    return this.http.delete(environment.apiBaseUrl + '/events/comment/' + id);
  }



}
