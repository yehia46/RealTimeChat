const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    name: String,
    managerName: String,
    address: String,
    phoneNumber: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    managerDob: Date,
    profileImg: String,
    preferredPosition: [String],
    suggestedPlayers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Players"
    }],
    teamPlayers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Players"
    }],
    description: String
},
{
    collection: "Teams",
    versionKey: false
});

module.exports = mongoose.model("Teams", teamSchema);