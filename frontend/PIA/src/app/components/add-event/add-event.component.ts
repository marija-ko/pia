import { Component, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { EventUser } from '../../models/events';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  private stepper: Stepper;

    name: string;
    start: Date;
    end: Date;
    caption: string;
    userId: string;
    username: string;
    status: string;
    participants: string;

    startNow = false;
    endNever = false;

 
  constructor(private eventService: EventService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.stepper = new Stepper(document.querySelector('#stepper1'), {
      linear: true,
      animation: true
    })
    this.userId = this.authService.getUserId();
    this.username = this.authService.getUsername();


  }

  next() {
    this.stepper.next();
  }

  previous(){
    this.stepper.previous();
  }

  onSubmit() {
    let participants: string[] = this.participants.split(',').map((item: string) => item.trim());
    if(!this.start) this.start = new Date();
    let event: EventUser = {
      name: this.name,
      start: this.start, 
      end: this.end, 
      caption: this.caption, 
      id: null,
      userId: this.userId,
      username: this.username,
      status: 'private',
      participants: participants


    }
    this.eventService.addEvent(event).subscribe();
    this.router.navigate(['/browse'])
    return false;
  }

}
