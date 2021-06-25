const express = require('express');
const router = express.Router();
const Post = require('../models/Post')


router.get('/',
  async (req, res, next) => {
      res.locals.posts = await Post.find({})
      res.render('shareMoments');
});

router.post('/',
  async (req, res, next) => {
      const post = new Post(
        {text:req.body.text,
         createdAt: new Date(),
         imageURL:req.body.imageURL,
         userId: req.user._id,
        })
      await post.save();
      res.render('showMoments')
});

module.exports = router;
