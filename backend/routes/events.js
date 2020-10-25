const express = require('express')
const multer = require('multer');
const router = express.Router();

const checkAuth = require('../middleware/auth-check');

const Event = require('../models/event');
const EventComment = require('../models/eventComment');





router.get("/list", (req, res, next)=>{
    Event.find()
        .then(docs => {
            res.json({
                message: "success",
                events: docs
            });
        });

})

router.get("/:id", checkAuth, (req, res, next)=>{
    Event.findById(req.params.id)
        .then(docs => {
            //console.log(docs)
            res.json({
                message: "success",
                event: docs
            });
        });

})

router.post('/add', checkAuth, (req, res, next) => {
    let end;
    if(!req.body.end) end = null; else end = new Date(req.body.end)
    
    var event = new Event( {
        name : req.body.name,
        start : new Date(req.body.start),
        end : end,
        caption : req.body.caption,
        userId: req.userData.userId,
        username: req.userData.username,
        status: req.body.status,
        participants: req.body.participants
      });
      
    event.save().then(createdEvent => {
        res.status(201).json({
            message: "Event added successfully!",
            event:{
                ...createdEvent,
                id: createdEvent._id
            }
        })
    
        
    }).catch (err => {
      res.status(500).json({
        error: err
      })
    })
});

router.put("/:id", checkAuth, (req, res, next) => {
      //console.log(req.params.id)
      let end;
        if(!req.body.end) end = null; else end = new Date(req.body.end)
      const event = new Event({
        _id: req.body.id,
        name : req.body.name,
        start : new Date(req.body.start),
        end : end,
        caption : req.body.caption,
        userId: req.body.userId,
        username: req.body.username,
        status: req.body.status,
        participants: req.body.participants
      });
      Event.updateOne(
        { _id: req.params.id, userId: req.userData.userId}, event)
        .then(result => {
       // console.log(result)
        if (result.nModified > 0) {
          res.status(200).json({ message: "Update successful!" });
        } else {
          res.status(401).json({ message: "Not authorized to edit the event!" });
        }
      });
    }
  );

  router.post('/addComment', checkAuth, (req, res, next) => {
   // console.log("adding a new comment")
    var comment = new EventComment( {
        userId : req.userData.userId,
        username: req.userData.username,
        eventId : req.body.eventId,
        body : req.body.body,
      });    
    //console.log(comment);
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
    Event.findById(req.params.id).then(event => {
      if (event) {
        EventComment.find({eventId: req.params.id}).then(docs => {
          res.status(200).json({message: "success", comments: docs});
        })
      } else {
        res.status(404).json({ message: "Book not found!" });
      }
    });
  });
  
  router.delete("/comment/:id", checkAuth, (req, res, next) => {
    EventComment.deleteOne({ _id: req.params.id, userId: req.userData.userId }).then(
      result => {
       // console.log(result);
        if (result.n > 0) {
          res.status(200).json({ message: "Deletion successful!" });
        } else {
          res.status(401).json({ message: "Not authorized!" });
        }
      }
    );
  });

  router.put("/comment/:id", checkAuth, (req, res, next) => {
    const comment = new EventComment({
      _id: req.body.id,
      username: req.body.username,
      body: req.body.body,
      userId: req.body.userId,
      eventId: req.body.eventId,
    });
   // console.log(comment._id)

    EventComment.updateOne(
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