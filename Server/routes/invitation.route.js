const express = require("express")
const invitationRoute = express.Router()

const controllers = require('../controllers/invitation')
invitationRoute.post('/sendInvitation', controllers.sendInvitation)
invitationRoute.get('/getPlayerInvitations/:email', controllers.getPlayerInvitations)
invitationRoute.get('/getInvitationsFeed/:email', controllers.getInvitationsFeed)
invitationRoute.get('/getAllInvitations', controllers.getAllInvitations)
invitationRoute.post('/acceptInvitation/:id', controllers.acceptInvitation)
invitationRoute.post('/rejectInvitation/:id', controllers.rejectInvitation)

module.exports = invitationRoute;