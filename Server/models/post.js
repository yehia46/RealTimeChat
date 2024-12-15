const mongoose = require('mongoose');

const Post = new mongoose.Schema(
  {
    authorType: {
      type: String,
      required: true,
      enum: ['Player', 'Team']
    },
    profileImg: String,
    authorEmail: String,
    authorName: String,
    content: String,
    image: String,
    video: String,
  },
  { 
    collection: "Posts",
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('Posts', Post);