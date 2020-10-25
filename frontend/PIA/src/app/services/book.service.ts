import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment';
import { Book, GENRES } from '../models/books';
import { Comment } from '../models/comments';
import { ReadBook } from '../models/readBooks';
import { Genre } from '../models/genres';


@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books: Book[] = [];
  private booksUpdated = new Subject<Book[]>();

  private comments: Comment[] = [];
  private commentsUpdated = new Subject<Comment[]>();

  private readBooks: ReadBook[]=[]
  private readBooksUpdated = new Subject<ReadBook[]>();

  private genres: Genre[]=[]
  private genresUpdated = new Subject<Genre[]>();


  constructor(private http: HttpClient) { }

  getBooks(){

    this.http.get<{message: string, books: any}>(environment.apiBaseUrl + '/books/list')
      .pipe(map(data=>{
        return data.books.map(book=>{
          return {
            name: book.name,
            cover: book.cover,
            authors: book.authors,
            published: book.published,
            genres: book.genres,
            summary: book.summary,
            rating: book.rating,
            pages: book.pages,
            id: book._id,
            status: book.status
          }
        })
      }))
      .subscribe(data => {
        this.books = data;
        this.booksUpdated.next([...this.books]);

      })
  }

  getPendingBooks(){

    this.http.get<{message: string, books: any}>(environment.apiBaseUrl + '/books/list/pending')
      .pipe(map(data=>{
        return data.books.map(book=>{
          return {
            name: book.name,
            cover: book.cover,
            authors: book.authors,
            published: book.published,
            genres: book.genres,
            summary: book.summary,
            rating: book.rating,
            pages: book.pages,
            id: book._id,
            status: book.status
          }
        })
      }))
      .subscribe(data => {
        this.books = data;
        this.booksUpdated.next([...this.books]);

      })
  }
  

  getBookUpdateListener() {
    return this.booksUpdated.asObservable();
  }

  search(author: string, title: string, genre, books: Book[]): Book[]{
    if (!books) return null
    if((author && author!="") || (title && title!="") || (genre && genre!="")){
      let filteredBooks = books.filter((book, index) => {
        if (author && author!=""){
          let found: boolean = false;
          book.authors.forEach(a => {
            if((a.toLowerCase()).includes(author.toLowerCase())) found = true;
          });
          if(!found){
            return false;
          }
        }
        if (title && title!=""){

            if(!book.name.toLowerCase().includes(title.toLowerCase())) return false;
        }
        if (genre && genre!=""){
          let found: boolean = false;
          book.genres.forEach(g => {
            if(g === genre) {
              found = true;
            }
          });
          if(!found){
            return false;
          }
        }

        return true;
          
      });
      return filteredBooks;
    }  
    
    return books;
  }

  addBook(book: Book, cover: File){
    const bookData = new FormData();
    bookData.append("name", book.name);
    bookData.append("authors", book.authors.toString());
    bookData.append("summary", book.summary);
    bookData.append("pages", book.pages.toString());
    bookData.append("genres", book.genres.toString());
    bookData.append("published", book.published.toString());
    bookData.append("rating", book.rating.toString());
    if(cover) bookData.append("cover", cover, book.name+"_"+book.authors);
    return this.http.post<{ message: string; book: Book }>(environment.apiBaseUrl + '/books/add', bookData)
     .subscribe(responseData => {
    })

  }

  getBook(id: string) {
    return this.http.get<{ book: {_id: string, name: string, authors: string[], cover: string,
    published: Date,  genres: string[], summary: string, rating: number, pages: number, numberOfRatings: number, 
    sumOfRatings: number, status: string }}>(
      environment.apiBaseUrl + '/books/' + id
    )
  }

  editBook(book: Book, cover: File){
    let bookData : FormData | Book;
    if (cover && typeof cover === "object") {
      bookData = new FormData()
      bookData.append("name", book.name);
      bookData.append("authors", book.authors.toString());
      bookData.append("summary", book.summary);
      bookData.append("pages", book.pages.toString());
      bookData.append("genres", book.genres.toString());
      bookData.append("published", book.published.toString());
      bookData.append("rating", book.rating.toString());
      bookData.append("status", book.status);
      bookData.append("numberOfRatings", book.numberOfRatings.toString());
      bookData.append("sumOfRatings", book.sumOfRatings.toString());
      bookData.append("id", book.id)


      if(cover) bookData.append("cover", cover, book.name+"_"+book.authors);
    }
    else{
      bookData = book;
     }
    return this.http.put(
        environment.apiBaseUrl + '/books/' + book.id, bookData)
    }

    updateBook(book: Book){

      return this.http.put(
          environment.apiBaseUrl + '/books/' + book.id, book)
    }

    deleteBook(id) {
      return this.http.delete(environment.apiBaseUrl + '/books/' + id);
    }

 

  getComments(bookId: string) {
    this.http.get<{message: string, comments: any}>(environment.apiBaseUrl + '/books/'+bookId+'/comments').pipe(map(data=>{
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

  addComment(bookId, body, rating, bookName, bookAuthors){
    const comment = {
    "body": body,
    "bookId": bookId,
    "rating": rating,
      "id" : null,
    "bookTitle": bookName,
    "bookAuthors":bookAuthors
  }
    this.http.post<{ message: string; id: string }>(environment.apiBaseUrl + '/books/addComment', comment)
    .subscribe(responseData => {
        const id = responseData.id;
        comment.id = id;
        this.commentsUpdated.next([...this.comments]);
      });
  }

  deleteComment(id) {
    return this.http.delete(environment.apiBaseUrl + '/books/comment/' + id);
  }

  updateComment(comment: Comment) {
    return this.http.put(environment.apiBaseUrl + '/books/comment/' + comment.id, comment)

  }

  getReadBook(bookId){
    return this.http.get<{book:{bookId: string, userId: string, genres: string[], pagesRead: number,  bookTitle: string, bookAuthors: string[], pagesTotal: number, _id: string }}>
      (environment.apiBaseUrl + '/users/booklist/' + bookId)
  
  }

  addReadBook(readBook){
    return this.http.post(environment.apiBaseUrl + '/users/booklist/' + readBook.bookId, readBook)
      .subscribe(responseData => {
        this.readBooksUpdated.next([...this.readBooks]);
    });
  
  }

  updatePages(bookId, pagesRead){
    return this.http.put(environment.apiBaseUrl + '/users/booklist/' + bookId + '/pages', {pagesRead: pagesRead})

  }

  deleteReadBook(id) {
    return this.http.delete(environment.apiBaseUrl + '/users/booklist/' + id);
  }

  getReadBooks(id){

    return  this.http.get<{
      books: any }>(
    environment.apiBaseUrl + '/users/booklist/user/' + id) .pipe(map(data=>{
      if(!data) return null;
      return data.books.map(book=>{
        return {
          bookId: book.bookId, 
          userId: book.userId, 
          genres: book.genres, 
          pagesRead: book.pagesRead, 
          pagesTotal: book.pagesTotal, 
          bookTitle: book.bookTitle,
          bookAuthors: book.bookAuthors,
          id: book._id
        }
      })
    }))
    .subscribe(data => {
      if(!data) return null;
      this.readBooks = data;
      this.readBooksUpdated.next([...this.readBooks]);

    })
  }

  getReadBookUpdateListener() {
    return this.readBooksUpdated.asObservable();
  }

  getGenres(){

    return  this.http.get<{
      genres: any }>(
    environment.apiBaseUrl + '/books/genres/list/') .pipe(map(data=>{
      if(!data) return null;
      return data.genres.map(genre=>{
        return {
          name: genre.name, 
          id: genre._id
        }
      })
    }))
    .subscribe(data => {
      if(!data) return null;
      this.genres = data;
      this.genresUpdated.next([...this.genres]);

    })
  }

  addGenre(name: string){
    return this.http.post(environment.apiBaseUrl + '/books/addGenre/', {name: name})
      .subscribe(responseData => {
        this.genresUpdated.next([...this.genres]);
    });
  }

  getGenresUpdateListener() {
    return this.genresUpdated.asObservable();
  }

  deleteGenre(id) {
    return this.http.delete(environment.apiBaseUrl + '/books/genres/' + id);
  }

}
