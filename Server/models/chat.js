const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  users: [String], 
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams"
  }
},
{
  collection: "Chat",
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model("Chat", chatSchema);