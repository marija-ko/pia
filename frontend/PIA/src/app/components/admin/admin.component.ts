import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/users';
import { BookService } from '../../services/book.service';
import { Genre } from '../../models/genres';
import { Book } from '../../models/books';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  users: User[];

  genresSub: Subscription;
  genres: Genre[];

  newGenre: string;
  booksSub: Subscription;
  books: Book[] = [];

  deleteMessage: string = null;

  constructor(private authService: AuthService, private userService: UserService, private bookService: BookService) { }

  ngOnInit(): void {

    this.userService.getUsers();
    this.userSub = this.userService.getUserUpdateListener()
      .subscribe((users: User[]) => {
          this.users = users;
  });
  this.bookService.getGenres();
    this.genresSub = this.bookService.getGenresUpdateListener()
      .subscribe((genres) => {
          this.genres = genres;
  });
  }

  onAcceptUser(user: User){
      user.status = "active";
      //console.log(user);
      let photo = user.photo
      this.authService.changeUser(user, null);
      this.userService.getUsers();
      this.userSub = this.userService.getUserUpdateListener()
      .subscribe((users: User[]) => {
          this.users = users;
  }) 

}

  onModerator(user: User){
    user.status = "moderator"
    this.authService.changeUser(user, null);
    this.userService.getUsers();
    this.userSub = this.userService.getUserUpdateListener()
    .subscribe((users: User[]) => {
        this.users = users;
    }) 
  }

  onDeleteUser(user: User){
    //console.log(user)
    this.userService.deleteUser(user.id).subscribe(()=>{
      this.userService.getUsers();
      this.userSub = this.userService.getUserUpdateListener()
      .subscribe((users: User[]) => {
          this.users = users;
      }) 
    })
  }

  onAddGenre(){
    this.bookService.addGenre(this.newGenre);
    this.bookService.getGenres();
    this.genresSub = this.bookService.getGenresUpdateListener()
      .subscribe((genres) => {
          this.genres = genres;
  });
  this.newGenre = ""
  }

  onDeleteGenre(g: Genre){
    this.bookService.getBooks();
      this.booksSub = this.bookService.getBookUpdateListener()
        .subscribe((books: Book[]) => {
            this.books = books;
            let found = false;
    for(let i=0; i<this.books.length;i++){
      for(let j = 0; j< this.books[i].genres.length; j++){
        if(this.books[i].genres[j]===g.name) {
          found = true;
          break;
        }
      }
    } 
    if(!found){
      this.bookService.deleteGenre(g.id).subscribe(()=>{
      this.bookService.getGenres();
      this.genresSub = this.bookService.getGenresUpdateListener()
      .subscribe((genres) => {
          this.genres = genres;
    })
  })} else {
    this.deleteMessage = "Unable to delete. There are still books with this genre."
  }
    });
    
}

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
