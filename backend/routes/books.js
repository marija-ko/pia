const express = require('express')
const multer = require('multer');
const router = express.Router();

const checkAuth = require('../middleware/auth-check');

const Book = require('../models/book');

const Comment = require('../models/comment');

const Genre = require('../models/genre')


const MIME_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpeg'
  }

storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isValid = MIME_TYPE[file.mimetype];
      let error = new Error("Invalid mime type");
      if(isValid) error = null;
      cb(error, "assets")
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('_');
        const ext = MIME_TYPE[file.mimetype];
        cb(null, name+'_'+Date.now()+'.'+ext);
    }
    
  })

router.get("/list", (req, res, next)=>{
    Book.find()
        .then(docs => {
            res.json({
                message: "success",
                books: docs
            });
        });

})

router.get("/list/pending", checkAuth, (req, res, next)=>{
  if(req.userData.role === "moderator" || req.userData.role === "admin"){
    //console.log("Getting pending books")
  Book.find({status: "pending"})
      .then(docs => {
        //console.log(docs)
          res.json({
              message: "success",
              books: docs
          });
      });}
      else {
       // console.log(req.userData.role)
        res.status(401).json({
        message:"Authorization failed"
      })}

})

router.get("/genres/list", (req, res, next)=>{
 // console.log('getting genres')
  Genre.find()
      .then(docs => {
          res.json({

              message: "success",
              genres: docs
          });
      });

})

router.post('/add', checkAuth, multer({storage: storage}).single("cover"), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    var book = new Book( {
        name : req.body.name,
        authors : req.body.authors.split(','),
        genres : req.body.genres.split(','),
        summary : req.body.summary,
        published : new Date(req.body.published),
        rating : 0,
        pages : parseInt(req.body.pages, 10),
        numberOfRatings: 0,
        sumOfRatings:0,
        status: "pending"

      });
    if(req.file) book.cover = url + "/assets/" + req.file.filename;
    else book.cover = url + "/assets/" + "default_cover.png";
      
    //console.log(book);
    book.save().then(createdBook => {
        res.status(201).json({
            message: "Book added successfully!",
            book:{
                ...createdBook,
                id: createdBook._id
            }
        })
    
        
    }).catch (err => {
      res.status(500).json({
        error: err
      })
    })
});

router.get("/:id", (req, res, next) => {
  //console.log("getting a book")
  Book.findById(req.params.id).then(book => {
      if (book) {
        //console.log(book)
      res.status(200).json({book: book});
    } else {
      res.status(404).json({ message: "Book not found!" });
    }
  });
});

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("cover"),
  (req, res, next) => {
    let cover = req.body.cover;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      cover = url + "/assets/" + req.file.filename;
      //console.log(cover)
    }
    //console.log(`Updating book ${req.params.id}`)
    const book = new Book({
      _id: req.body.id,
      name : req.body.name,
      authors : req.body.authors.toString().split(','),
      genres : req.body.genres.toString().split(','),
      summary : req.body.summary,
      published : new Date(req.body.published),
      rating : parseInt(req.body.rating.toString(), 10),
      pages : parseInt(req.body.pages.toString(), 10),
      numberOfRatings: parseInt(req.body.numberOfRatings.toString(), 10),
      sumOfRatings : parseInt(req.body.sumOfRatings.toString(), 10),
      pending: req.body.pending,
      status: req.body.status,
      cover: cover
    });
    Book.updateOne(
      { _id: req.params.id},
      book
    ).then(result => {
     // console.log(result)
      if (result.nModified > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized to edit the book!" });
      }
    });
  }
);

router.delete("/:id", checkAuth, (req, res, next) => {
  if(req.userData.role === "moderator" || req.userData.role === "admin"){
  Book.deleteOne({ _id: req.params.id }).then(
    result => {
     // console.log(result);
      if (result.n > 0) {
        Comment.deleteMany({bookId: req.params.id}).then(com => {
       //   console.log(com)
        })
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }
  );
  }else {
    res.status(401).json({ message: "Not authorized!" });
  }
});

router.post('/addComment', checkAuth, (req, res, next) => {
  //console.log("adding a new comment")
  var comment = new Comment( {
      userId : req.userData.userId,
      username: req.userData.username,
      bookId : req.body.bookId,
      body : req.body.body,
      rating : req.body.rating,
      bookTitle: req.body.bookTitle,
      bookAuthors: req.body.bookAuthors
    });    
 // console.log(comment);
  comment.save().then(createdComment => {
      res.status(201).json({
          message: "Comment added successfully!",
          id: createdComment._id
      })
  
      
  }).catch (err => {
    res.status(500).json({
      error: err
    })
  })
});

router.get("/:id/comments", (req, res, next) => {
  Book.findById(req.params.id).then(book => {
    if (book) {
      Comment.find({bookId: req.params.id}).then(docs => {
        res.status(200).json({message: "success", comments: docs});
      })
    } else {
      res.status(404).json({ message: "Book not found!" });
    }
  });
});

router.delete("/comment/:id", checkAuth, (req, res, next) => {
  Comment.deleteOne({ _id: req.params.id, userId: req.userData.userId }).then(
    result => {
      //console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }
  );
});

router.post('/addGenre', checkAuth, (req, res, next) => {
  //console.log("adding a new genre")
  var genre = new Genre( {
      name: req.body.name
    });    
  //console.log(genre);
  genre.save().then(createdGenre => {
      res.status(201).json({
          message: "Comment added successfully!",
          id: createdGenre._id
      })
  
      
  }).catch (err => {
    res.status(500).json({
      error: err
    })
  })
});

router.delete("/genres/:id", checkAuth, (req, res, next) => {
  Genre.deleteOne({ _id: req.params.id }).then(
    result => {
      //console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }
  );
});

router.put("/comment/:id", checkAuth,
  (req, res, next) => {
    const comment = new Comment({
      _id: req.body.id,
      username: req.body.username,
      body: req.body.body,
      userId: req.body.userId,
      bookId: req.body.bookId,
      rating: req.body.rating,
      bookTitle: req.body.bookTitle,
      bookAuthors: req.body.bookAuthors

    });
   // console.log(comment._id)
    //console.log(`${req.userData.userId} is trying to edit the post`)

    Comment.updateOne(
      { _id: req.params.id, userId: req.userData.userId },
      comment
    ).then(result => {
     // console.log(result)
      if (result.nModified > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    });
  }
);

module.exports = router;