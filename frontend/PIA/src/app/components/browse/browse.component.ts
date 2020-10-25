import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'

import { Book, GENRES } from '../../models/books'
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { EventUser } from '../../models/events';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../../validators/mimetype.validator';
import { Genre } from '../../models/genres';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css']
})
export class BrowseComponent implements OnInit, OnDestroy {

  books: Book[] = [];
  private booksSub: Subscription;

  events: EventUser[] = []
  private eventsSub: Subscription;

  private authStatusSub: Subscription;

  isAuthenticated: boolean = false;
  userRole: string;

  coverPreview: string;
  coverPicked: boolean = false;

  genres: Genre[] = [];
  author: string;
  title: string;
  genre: string;
  genresSub: Subscription;

  constructor(private bookService: BookService, private eventService: EventService,
      private route: ActivatedRoute, private router: Router,
      private authService: AuthService) { 
      }


  ngOnInit(): void {
      this.bookService.getBooks();
      this.booksSub = this.bookService.getBookUpdateListener()
        .subscribe((books: Book[]) => {
            this.books = books;
    });
    this.eventService.getEvents();
      this.eventsSub = this.eventService.getEventUpdateListener()
        .subscribe((events: EventUser[]) => {
            this.events = events;
    });
    this.isAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthListener()
        .subscribe((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
    });
    this.bookService.getGenres();
    this.genresSub = this.bookService.getGenresUpdateListener()
      .subscribe((genres) => {
          this.genres = genres;
  });
      this.userRole = this.authService.getRole();
  }

  ngOnDestroy(): void {
      this.booksSub.unsubscribe();
      this.eventsSub.unsubscribe();
      this.authStatusSub.unsubscribe();
  }


  onSearch(){
    this.books = this.bookService.search(this.author, this.title, this.genre, this.books);
  }

  onReset(){
    this.bookService.getBooks();
      this.booksSub = this.bookService.getBookUpdateListener()
        .subscribe((books: Book[]) => {
            this.books = books;
    });
  }

  activeEvent(event): boolean{
      return ((Date.now()>=event.start && Date.now()<=event.end) || (!event.end && Date.now()>=event.start))
  }

  isUpcoming(event): boolean{
    return (!event.end || Date.now()<=event.end )
}

  onApproveBook(bookId){
    this.bookService.getBook(bookId).subscribe(bookData => {
      let book = {id: bookData.book._id, name: bookData.book.name, authors: bookData.book.authors, cover: bookData.book.cover,
        published: new Date(bookData.book.published),  genres: bookData.book.genres, summary: bookData.book.summary, rating: bookData.book.rating,
        pages: bookData.book.pages, numberOfRatings: bookData.book.numberOfRatings, sumOfRatings: bookData.book.sumOfRatings,
        status: bookData.book.status
      };
      book.status = "active";
      this.bookService.updateBook(book).subscribe(()=>{
        this.bookService.getBooks();

      })
  })
  }

  onDeleteBook(bookId){
    this.bookService.deleteBook(bookId).subscribe(()=>{
      this.bookService.getBooks();
    })
  }



}
