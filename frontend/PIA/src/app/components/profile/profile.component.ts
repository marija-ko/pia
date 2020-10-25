import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/users';
import { Comment } from '../../models/comments'
import { AuthService } from '../../services/auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { mimeType } from '../../validators/mimetype.validator';
import { Subscription } from 'rxjs';
import { ReadBook } from '../../models/readBooks';
import { Book } from '../../models/books';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  username: string;
  user: User
  loggedInUserId: string;
  loggedInUsername: string

  editingMode: boolean = false;
  editingForm: FormGroup
  photoPreview: string;
  photoPicked: boolean;
  private commentsSub: Subscription;
  comments: Comment[] = [];
  private readBooksSub: Subscription;
  readBooks: ReadBook[] = [];

  pendingBooks: Book[] = [];
  booksSub: Subscription;



  constructor(private userService: UserService, private authService: AuthService, private route: ActivatedRoute,
    private router: Router, private bookService: BookService) { }


  ngOnInit(): void {

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("username")) {
        this.username = paramMap.get("username");
        this.userService.getUser(this.username).subscribe(userData => {
          this.user =  {
            id: userData.user._id,
            name : userData.user.name,
            surname: userData.user.surname,
            username: userData.user.username,
            password: userData.user.password,
            photo: userData.user.photo,
            birthdate: new Date(userData.user.birthdate),
            city: userData.user.city,
            country: userData.user.country,
            email:userData.user.email,
            lastSeen: null,
            status: userData.user.status 
          }

            this.userService.getComments(this.user.id);
              this.commentsSub = this.userService.getCommentUpdateListener()
                .subscribe((comments: Comment[]) => {
                    this.comments = comments;
            });
            this.bookService.getReadBooks(this.user.id);
            this.readBooksSub = this.bookService.getReadBookUpdateListener()
              .subscribe((readBooks: ReadBook[]) => {
                  this.readBooks = readBooks;
          });
           
            
      }
        )}
    });
    this.loggedInUserId = this.authService.getUserId();
    this.loggedInUsername = this.authService.getUsername();
    if(this.authService.getRole()==="moderator" || this.authService.getRole()==="admin") {
      this.bookService.getPendingBooks();
      this.booksSub = this.bookService.getBookUpdateListener()
        .subscribe((books: Book[]) => {
            this.pendingBooks = books;
    });
    }


    
  }

  onEdit(){
      this.editingMode = true;
      this.editingForm = this.createFormGroup();
      this.editingForm.patchValue({
        name: this.user.name,
        surname: this.user.surname,
        email: this.user.email,
        photo: this.user.photo,
        city: this.user.city,
        country: this.user.country,
        date: this.user.birthdate
      })
      this.photoPreview = this.user.photo;
  }

  onCancel(){
    this.editingMode = false;
  }
  createFormGroup() {
    return new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      photo: new FormControl('', {asyncValidators: mimeType}),
      city: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
    });
  }

  onImagePicked(event: Event){

    const file = (event.target as HTMLInputElement).files[0];
    this.editingForm.patchValue({photo: file});
    this.editingForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    }
    reader.readAsDataURL(file);
    this.photoPicked = true;
  }

  onSubmit(){
    let editedUser: User = {
      name: this.editingForm.value.name,
      surname: this.editingForm.value.surname,
      username: this.user.username,
      email: this.editingForm.value.email,
      photo: this.editingForm.value.photo,
      password: this.user.password,
      city: this.editingForm.value.city,
      country: this.editingForm.value.country,
      birthdate: new Date(this.editingForm.value.date),
      id:this.user.id,
      lastSeen:this.user.lastSeen,
      status: this.user.status
    };
    this.authService.changeUser(editedUser, this.editingForm.value.photo);
    this.editingMode = false;
    this.photoPreview = editedUser.photo
    this.userService.getUser(this.username).subscribe()
  }

  onChangePassword(){
    this.editingMode = false;
    this.router.navigate(['/changePassword'])
  }

  onDeleteProgress(bookId){
    this.bookService.deleteReadBook(bookId).subscribe(()=>{
      this.bookService.getReadBooks(this.user.id);

    })

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
        this.bookService.getPendingBooks();
  
      })
  })
}

onDeleteBook(bookId){
  this.bookService.deleteBook(bookId).subscribe(()=>{
    this.bookService.getPendingBooks();
  })
}
  get name() {
    return this.editingForm.get('name');
  }

  get surname() {
    return this.editingForm.get('surname');
  }

  get photo() {
    return this.editingForm.get('photo');
  }

  get email() {
    return this.editingForm.get('email');
  }

  get city() {
    return this.editingForm.get('city');
  }

  get country() {
    return this.editingForm.get('country');
  }

  get date() {
    return this.editingForm.get('date');
  }

  ngOnDestroy(): void {
    this.commentsSub.unsubscribe();
    this.readBooksSub.unsubscribe();

  }

}
