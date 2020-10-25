import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from '../../validators/mimetype.validator';
import { Book, GENRES } from '../../models/books';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Genre } from '../../models/genres';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {
  
  bookForm: FormGroup;

  coverPreview: string;
  coverPicked: boolean = false;
  genres: Genre[] = [];
  genresSub: any;

  mode: string;
  bookId: string;
  book: Book;

  constructor(private bookService: BookService, private router: Router, private route: ActivatedRoute) { 
    this.bookForm = this.createFormGroup();
  }

  ngOnInit(): void {
    this.bookService.getGenres();
    this.genresSub = this.bookService.getGenresUpdateListener()
      .subscribe((genres) => {
          this.genres = genres;
  });

  this.route.paramMap.subscribe((paramMap: ParamMap) => {
    if (paramMap.has("id")) {
      this.mode = "edit";
      this.bookId = paramMap.get("id");
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
        this.bookForm.patchValue({
          name: this.book.name,
          authors: this.book.authors,
          cover: this.book.cover,
          published: new Date(this.book.published),
          genre1: this.book.genres[0], 
          genre2: this.book.genres[1], 
          genre3: this.book.genres[2], 
          summary: this.book.summary, 
          pages: this.book.pages, 
        })
        this.coverPreview = this.book.cover;
        //console.log(this.bookForm.value.authors.toString())

      });
    } else {
      this.mode = "add";
      this.bookId = null;
    }
  });

  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl('', [Validators.required]),
      authors: new FormControl('', [Validators.required]),
      summary: new FormControl('',[Validators.required]),
      cover: new FormControl('', {asyncValidators: mimeType}),
      genre1: new FormControl('', [Validators.required]),
      genre2: new FormControl(''),
      genre3: new FormControl(''),
      pages: new FormControl('', [Validators.required]),
      published: new FormControl('', [Validators.required]),

    });
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

  onAddBook(){
    let authors: string[] = this.bookForm.value.authors.toString().split(',').map((item: string) => item.trim());
    let newGenres: string[] = [this.bookForm.value.genre1];
    if(this.bookForm.value.genre2) newGenres.push(this.bookForm.value.genre2)
    if(this.bookForm.value.genre3) newGenres.push(this.bookForm.value.genre3)
    let book : Book;
    book = {
      name: this.bookForm.value.name,
      authors: authors,
      summary: this.bookForm.value.summary,
      genres: newGenres,
      cover: this.bookForm.value.cover,
      pages: this.bookForm.value.pages,
      rating: 0,
      sumOfRatings: 0,
      numberOfRatings: 0,
      published: new Date(this.bookForm.value.published),
      status: "pending",
      id:null,
    };
    //console.log(book)
    this.bookService.addBook(book, this.bookForm.value.cover);
    this.router.navigate(['/browse'])

  }

  onEditBook(){
    let authors: string[] = this.bookForm.value.authors.toString().split(',').map((item: string) => item.trim());
    let newGenres: string[] =[];
    if(this.bookForm.value.genre1) {
      newGenres.push(this.bookForm.value.genre1);
      if(this.bookForm.value.genre2) newGenres.push(this.bookForm.value.genre2)
      if(this.bookForm.value.genre3) newGenres.push(this.bookForm.value.genre3)
    }
    let book : Book;
    book = {
      name: this.bookForm.value.name,
      authors: authors,
      summary: this.bookForm.value.summary,
      genres: newGenres,
      cover: this.bookForm.value.cover,
      pages: this.bookForm.value.pages,
      rating: this.book.rating,
      sumOfRatings: this.book.sumOfRatings,
      numberOfRatings: this.book.numberOfRatings,
      published: new Date(this.bookForm.value.published),
      status: this.book.status,
      id:this.book.id,
    };
    //console.log(book)
    this.bookService.editBook(book, this.bookForm.value.cover).subscribe(()=>{
      this.router.navigate(['/book', this.book.id])

    });
  }

  onCancel(){
    if(this.mode==='add')this.router.navigate(['/browse']); else this.router.navigate(['/book', this.book.id])
  }

  get name() {
    return this.bookForm.get('name');
  }

  get authors() {
    return this.bookForm.get('authors');
  }

  get cover() {
    return this.bookForm.get('cover');
  }


  get summary() {
    return this.bookForm.get('summary');
  }

  get published() {
    return this.bookForm.get('published');
  }

  get genre1() {
    return this.bookForm.get('genre1');
  }

  get genre2() {
    return this.bookForm.get('genre2');
  }

  get genre3() {
    return this.bookForm.get('genre3');
  }

  get pages() {
    return this.bookForm.get('pages');
  }


}
