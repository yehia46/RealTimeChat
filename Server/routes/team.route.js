const express = require("express")
const teamRoute = express.Router()
const multer = require('multer')

const controllers = require('../controllers/team')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './profile')
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_")
        cb(null, sanitizedFilename)
    }    
})

const upload = multer({ storage: storage })

teamRoute.get('/get-teams', controllers.getTeams)
teamRoute.post('/login', controllers.login)
teamRoute.post('/register', controllers.register)
teamRoute.patch('/update-preferred-positions/:email', controllers.updatePreferredPositions)
teamRoute.get('/get-suggested-players/:email', controllers.getSuggestedPlayers)
teamRoute.get('/get-team-by-email/:email', controllers.getTeamByEmail)
teamRoute.get('/getTeamPlayers/:email', controllers.getTeamPlayers)
teamRoute.delete('/removePlayerFromTeam/:email', controllers.removePlayerFromTeam)
teamRoute.put('/updateProfilePicture/:email', upload.single('profileImg'), controllers.updateProfilePicture)
teamRoute.get('/getTeamPreferredPositions/:email', controllers.getTeamPreferredPositions)
teamRoute.post('/addDescription/:teamEmail', controllers.addTeamDescription)
teamRoute.get('/getDescription/:teamEmail', controllers.getTeamDescription)

module.exports = teamRoute