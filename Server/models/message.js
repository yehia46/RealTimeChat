const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String },
  content: { type: String, trim: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }
},
{
  collection: "Message",
  timestamps: true
});

module.exports = mongoose.model("Message", messageSchema);