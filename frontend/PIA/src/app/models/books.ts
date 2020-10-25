export interface Book {
    name: string;
    cover: string;
    authors: string[];
    published: Date;
    genres: string[];
    summary: string;
    rating: number;
    id: string;
    pages: number,
    numberOfRatings:number,
    sumOfRatings: number,
    status: string;
}

export let GENRES: string[]  = [
    "romance",
    "mystery",
    "thriller",
    "sci-fi",
    "fantasy",
    "adventure",
    "horror",
    "non-fiction",
    "poetry"
  ]
