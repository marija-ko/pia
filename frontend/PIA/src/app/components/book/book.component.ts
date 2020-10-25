import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookService } from '../../services/book.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Book } from '../../models/books';
import { Comment } from '../../models/comments'
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ReadBook } from '../../models/readBooks';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../../validators/mimetype.validator';
import { Genre } from '../../models/genres';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, OnDestroy {

  book: Book;
  bookId: string;
  comments: Comment[] = [];
  rating: number;
  body: string;

  updatedRating: number;
  updatedBody: string;

  bookInList: boolean = false;
  readBook: ReadBook
  pagesRead: number = 0;
  canComment: boolean = false;
  progress: number = 0;

  selectedComment: string = "";
  private commentsSub: Subscription;
  private authStatusSub: Subscription;

  isAuthenticated: boolean = false;
  userId: string;
  userRole: string;
  username: any;

  bookForm: FormGroup;
  coverPreview: string;
  coverPicked: boolean;

  genres: Genre[] = [];
  genresSub: any;


  constructor(private bookService: BookService, private route: ActivatedRoute,
    private authService: AuthService, private router: Router) {    }


  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("bookId")) {
        this.bookId = paramMap.get("bookId");
        this.bookService.getBook(this.bookId).subscribe(bookData => {
          this.book = {
            id: bookData.book._id,
            name: bookData.book.name, 
            authors: bookData.book.authors, 
            cover: bookData.book.cover,
            published: new Date(bookData.book.published),  
            genres: bookData.book.genres, 
            summary: bookData.book.summary, 
            rating: bookData.book.rating,
            pages: bookData.book.pages, 
            numberOfRatings: bookData.book.numberOfRatings, 
            sumOfRatings: bookData.book.sumOfRatings,
            status: bookData.book.status
          };
        });
      
      }
    });
    if(this.bookId)
    this.bookService.getComments(this.bookId);
      this.commentsSub = this.bookService.getCommentUpdateListener()
        .subscribe((comments: Comment[]) => {
            this.comments = comments;
    });
    this.isAuthenticated = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getRole();
    this.authStatusSub = this.authService.getAuthListener()
    .subscribe((isAuthenticated) => {
        this.userId = this.authService.getUserId();
        this.userRole = this.authService.getRole();
        this.isAuthenticated = isAuthenticated;
});
if(this.isAuthenticated){
    this.bookService.getReadBook(this.bookId).subscribe(data=>{
      if(data) {
      this.readBook = {
        bookId: data.book.bookId, 
        userId: data.book.userId, 
        genres: data.book.genres, 
        pagesRead: data.book.pagesRead, 
        pagesTotal: data.book.pagesTotal,
        id: data.book._id,
        bookTitle: data.book.bookTitle,
        bookAuthors: data.book.bookAuthors,
  
      }
      this.bookInList = true;
      this.pagesRead = this.readBook.pagesRead
      this.progress = +data.book.pagesRead/+data.book.pagesTotal
      if(this.progress>=0.5) this.canComment = true;
    }
    })
    this.bookService.getGenres();}
    this.genresSub = this.bookService.getGenresUpdateListener()
      .subscribe((genres) => {
          this.genres = genres;
  });
  }

  updateRating(r: number){
    this.book.numberOfRatings++;
     let s = +r + +this.book.sumOfRatings;
     this.book.sumOfRatings = s;

     this.book.rating = this.book.sumOfRatings/this.book.numberOfRatings;
     this.bookService.updateBook(this.book).subscribe(() => {
      this.bookService.getBook(this.bookId);
      })
  }

  addComment(){
    this.bookService.addComment(this.bookId, this.body, this.rating, this.book.name, this.book.authors);
    this.updateRating(this.rating)
    this.body="";
    this.bookService.getComments(this.bookId);
    this.commentsSub = this.bookService.getCommentUpdateListener()
        .subscribe((comments: Comment[]) => {
            this.comments = comments;
    });


  }

  onDelete(comment) {
    this.book.numberOfRatings--;
    this.book.sumOfRatings-= +comment.rating;
    if(this.book.numberOfRatings === 0) this.book.rating = 0;
    else this.book.rating = this.book.sumOfRatings/this.book.numberOfRatings;

    this.bookService.deleteComment(comment.id).subscribe(() => {
      this.bookService.getComments(this.bookId);
      this.commentsSub = this.bookService.getCommentUpdateListener()
        .subscribe((comments: Comment[]) => {
            this.comments = comments;
    });
      })
  }

  onEdit(id, body, username){
    this.selectedComment = id;
    this.updatedBody = body;
    this.username = username;
  }

  onEditBook(){
    this.router.navigate(['/editBook', this.book.id])
  }

  onCancel(){
    this.selectedComment = "";
  }

  onSubmitComment(comment){
      this.book.numberOfRatings--;
      this.book.sumOfRatings-= +comment.rating;
      const updatedComment: Comment = {
      rating: this.updatedRating,
      body: this.updatedBody,
      username: this.username,
      userId: this.userId,
      id: this.selectedComment,
      bookId: this.bookId,
      bookAuthors: this.book.authors,
      bookTitle: this.book.name


    }
    comment = updatedComment;
    this.updateRating(updatedComment.rating)

    this.bookService.updateComment(updatedComment).subscribe(() => {
      this.bookService.getComments(this.bookId);
      this.commentsSub = this.bookService.getCommentUpdateListener()
        .subscribe((comments: Comment[]) => {
            this.comments = comments;
    });
      })

    this.selectedComment = "",
    this.updatedBody= "";
    this.username = "";
  }

  finishBook(){
    this.readBook = {
      bookId: this.bookId, 
      userId: this.userId, 
      genres: this.book.genres, 
      pagesRead: this.book.pages, 
      pagesTotal: this.book.pages,
      bookTitle: this.book.name,
      bookAuthors: this.book.authors,
      id: null
    }
    this.bookService.addReadBook(this.readBook)
    this.bookInList = true;
    this.canComment = true;
    this.progress = 1;
    this.pagesRead = this.book.pages;



  }

  startBook(){
    this.readBook = {
      bookId: this.bookId, 
      userId: this.userId, 
      genres: this.book.genres, 
      bookTitle: this.book.name,
      bookAuthors: this.book.authors,
      pagesRead: 0, 
      pagesTotal: this.book.pages,
      id: null
    }
    this.bookService.addReadBook(this.readBook)
    this.bookInList = true;
  }

  onSaveProgress(){
    if(this.pagesRead>this.readBook.pagesTotal) this.pagesRead = this.readBook.pagesTotal
    this.bookService.updatePages(this.bookId, this.pagesRead).subscribe(()=>{
      this.progress = +this.pagesRead/+this.readBook.pagesTotal
      this.canComment = (this.progress>=0.5)
    })
  }
  onDeleteFromList(){
    this.bookService.deleteReadBook(this.bookId).subscribe(()=>{
      this.bookInList = false;
      this.readBook = null;
      this.canComment = false;
      this.pagesRead = 0;
      this.bookService.getComments(this.bookId);
    })
  }

  onImagePicked(event: Event){

    const file = (event.target as HTMLInputElement).files[0];
    this.bookForm.patchValue({cover: file});
    this.bookForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    }
    reader.readAsDataURL(file);
    this.coverPicked = true;
  }
  

  ngOnDestroy(): void {
    this.commentsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

}
