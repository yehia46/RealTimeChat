const Post = require('../models/post')
const fs = require('fs')

exports.createPost = async (req, res) => {
    console.log(req.body)
    console.log(req.files)

    const newPost = new Post({
        profileImg: req.body.profileImg,
        authorType: req.body.authorType,
        authorEmail: req.body.authorEmail,
        authorName: req.body.authorName,
        content: req.body.content,
        image: req.files['image'] ? req.files['image'][0].path : undefined,
        video: req.files['video'] ? req.files['video'][0].path : undefined,
    })    

    try {
        let post = await newPost.save()
        res.status(201).json(post)
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.getPostsByAuthorEmail = async (req, res) => {
    const authorEmail = req.params.email

    try {
      const posts = await Post.find({ authorEmail }).sort({ createdAt: -1 })
      res.json(posts)
    } catch (error) {
      res.status(500).send(error)
    }
}  

exports.getAllPosts = async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 }) // Sorting posts reverse
      res.json(posts)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
}

exports.editPost = async (req, res) => {
  const updatedPost = req.body;

  try {
    const post = await Post.findByIdAndUpdate(updatedPost._id, updatedPost, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).send(error);
  }
}

exports.deletePost = async (req, res) => {
  const postId = req.params.id

  try {
    const post = await Post.findByIdAndDelete(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).send(error)
  }
}