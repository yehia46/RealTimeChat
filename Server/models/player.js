const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: String,
  dateOfBirth: Date,
  address: String,
  phoneNumber: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  preferredPosition: String,
  profileImg: String,
  inTeam: {
    type: Boolean,
    required: false,
  },
  team: String,
},
{
  collection: "Players",
  versionKey: false,
  timestamps: true,
});

module.exports = mongoose.model("Players", playerSchema);