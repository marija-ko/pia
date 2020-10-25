import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventUser } from '../../models/events';
import { AuthService } from '../../services/auth.service';
import { EventComment } from '../../models/eventComments';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  eventId: string;
  event: EventUser;
  userId: string;
  username: string;
  private commentsSub: Subscription;
  comments: EventComment[] = [];

  body: string

  constructor(private route: ActivatedRoute, private eventService: EventService, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("eventId")) {
        this.eventId = paramMap.get("eventId");
        this.eventService.getEvent(this.eventId).subscribe(eventData => {
          let end;
          if(!eventData.event.end) end = null; else end = new Date(eventData.event.end)
          this.event = {
            id: eventData.event._id, 
            name: eventData.event.name, 
            start: new Date(eventData.event.start), 
            end: end, 
            caption: eventData.event.caption, 
            userId: eventData.event.userId,
            username: eventData.event.username,
            status: eventData.event.status,
            participants: eventData.event.participants
          };
        });
      
      }
    });
    this.userId = this.authService.getUserId();
    this.username = this.authService.getUsername();

    this.eventService.getComments(this.eventId);
      this.commentsSub = this.eventService.getCommentUpdateListener()
        .subscribe((comments: EventComment[]) => {
            this.comments = comments;
    });
  }

  activeEvent(): boolean{
    let now = new Date()
    return ((now>=this.event.start && now<=this.event.end) || (!this.event.end && now>=this.event.start))
  }

  onStart(){
    let start = new Date();
    if(this.event.end<start){
        this.event.end = null;
    }
    this.event.start = start;
    this.eventService.updateEvent(this.event).subscribe(() => {
      this.eventService.getEvent(this.eventId);
      })

  }
  
  onEnd(){
    let end: Date = new Date();
    this.event.end = end;
    this.eventService.updateEvent(this.event).subscribe(() => {
      this.eventService.getEvent(this.eventId);
      })
  }

  onDelete(comment){
    this.eventService.deleteComment(comment.id).subscribe(()=>{
      this.eventService.getComments(this.eventId);

    })
  }

  isParticipant(){
    if(this.event.participants.includes(this.username)) return true;
    if(this.event.userId == this.userId) return true;
    return false;
  }

  addComment(){
    this.eventService.addComment(this.eventId, this.body);
    this.body="";
    this.eventService.getComments(this.eventId);


  }

}

