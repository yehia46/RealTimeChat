const express = require("express");
const multer = require('multer');
const playerRoute = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './profile');
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
        cb(null, sanitizedFilename);
    }    
});

const upload = multer({ storage: storage });

const controllers = require('../controllers/player')
playerRoute.get('/get-players', controllers.getPlayers)
playerRoute.post('/login', controllers.login)
playerRoute.post('/register', controllers.register)
playerRoute.get('/get-player-by-email/:email', controllers.getPlayerByEmail)
playerRoute.get('/get-player-by-id/:id', controllers.getPlayerById)
playerRoute.put('/update-player/:email', controllers.updatePlayer)
playerRoute.put('/updateProfilePicture/:email', upload.single('profileImg'), controllers.updateProfilePicture);
playerRoute.get('/getUserByEmail/:email', controllers.getUserByEmail)

module.exports = playerRoute;