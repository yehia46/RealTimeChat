const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  invitingTeam: {
    type: String,
    required: true,
  },
  invitedPlayer: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  rejectionReason: String
},
{
  collection: "Invitation",
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model("Invitation", invitationSchema);