const express = require('express')
const multer = require('multer');
const router = express.Router();

const checkAuth = require('../middleware/auth-check');

const User = require('../models/user');
const Comment = require('../models/comment');
const ReadBook = require('../models/readBook');


router.get("/list", (req, res, next)=>{
  User.find()
      .then(docs => {
        console.log(`Getting users: ${docs}`)
          res.json({
              message: "success",
              users: docs
          });
      });

})

router.get("/:username", checkAuth, (req, res, next) => {
    console.log("getting an user")
    User.findOne({username: req.params.username}).then(user => {
        if (user) {
          console.log(user)
        res.status(200).json({user});
      } else {
        res.status(404).json({ message: "User not found!" });
      }
    });
  });

  router.delete("/:id", checkAuth, (req, res, next) => {
    if(req.userData.role === "admin"){
    User.deleteOne({_id: req.params.id}).then(
      result => {
        console.log(result);
        if (result.n > 0) {
          Comment.deleteMany({userId: req.params.id})
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

router.get("/:id/comments", checkAuth,(req, res, next) => {
    User.findById(req.params.id).then(user => {
      if (user) {
        Comment.find({userId: req.params.id}).then(docs => {
          console.log(req.params.id)
          console.log(docs)
          res.status(200).json({message: "success", comments: docs});
        })
      } else {
        res.status(404).json({ message: "User not found!" });
      }
    });
});

router.post('/booklist/:id/', checkAuth, (req, res, next) => {
  var book = new ReadBook( {
      userId: req.userData.userId,
      bookId : req.params.id,
      genres : req.body.genres,
      pagesRead : req.body.pagesRead,
      pagesTotal : req.body.pagesTotal,
      bookTitle: req.body.bookTitle,
      bookAuthors: req.body.bookAuthors
    });
    
  console.log(book);
  book.save().then(readBook => {
      res.status(201).json({
          message: "Book added successfully!",
      })
  
      
  }).catch (err => {
    res.status(500).json({
      error: err
    })
  })
});

router.get("/booklist/:id", checkAuth, (req, res, next) => {
  ReadBook.findOne({bookId: req.params.id, userId: req.userData.userId}).then(book => {
    if (book) {
      res.status(200).json({book});
    } else {
      res.status(200).json();
    }
  });
});

router.get("/booklist/user/:id", checkAuth, (req, res, next) => {
  console.log('getting booklists')
  ReadBook.find({userId: req.params.id}).then(docs => {
    console.log(docs)
    if (docs) {
      res.status(200).json({books: docs, message:"success"});
    } else {
      res.status(400).json({message:"no books"});
    }
  });
});

router.delete("/booklist/:id", checkAuth, (req, res, next) => {
  ReadBook.deleteOne({ bookId: req.params.id, userId: req.userData.userId }).then(
    result => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }
  );
});

router.put("/booklist/:id/pages", checkAuth, (req, res, next) => {
  console.log('Updating pages')  
  ReadBook.updateOne(
    { bookId: req.params.id, userId: req.userData.userId},
    {$set: {pagesRead : req.body.pagesRead}}).then(result => {
          console.log(result)
          if (result.nModified > 0) {
            res.status(200).json({ message: "Update successful!" });
          } else {
            res.status(401).json({ message: "Not authorized to update the pages!" });
          }
    });
});

module.exports = router;