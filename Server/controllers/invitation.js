const Invitation = require('../models/invitation')
const Team = require('../models/team')
const Player = require('../models/player')
const mongoose = require('mongoose')

exports.sendInvitation = async (req, res) => {
  try {
    const { teamEmail, playerEmail } = req.body

    const invitation = new Invitation({
      invitingTeam: teamEmail,
      invitedPlayer: playerEmail,
      status: 'pending',
      rejectionReason: null
    })

    await invitation.save()

    res.status(201).json(invitation)
  } catch (error) {
    console.error('Error sending invitation:', error)
    res.status(500).json({ error: 'Error sending invitation' })
  }
}

exports.getPlayerInvitations = async (req, res) => {
  try {
    const { email } = req.params
    console.log('email: ', email)
    const invitations = await Invitation.find({ invitedPlayer: email })
    res.status(200).json(invitations)
  } catch (error) {
    console.error('Error fetching player invitations:', error)
    res.status(500).json({ error: 'Error fetching player invitations' })
  }
}

exports.getInvitationsFeed = async (req, res) => {
  try {
    const { email } = req.params
    console.log('email: ', email)
    const invitations = await Invitation.find({ invitingTeam: email })
    res.status(200).json(invitations)
  } catch (error) {
    console.error('Error fetching team invitations:', error)
    res.status(500).json({ error: 'Error fetching team invitations' })
  }
}

exports.getAllInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find().populate('invitingTeam')
    res.status(200).json(invitations)
  } catch (error) {
    console.error('Error fetching all invitations:', error)
    res.status(500).json({ error: 'Error fetching all invitations' })
  }
}

exports.acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params

    const invitation = await Invitation.findById(id)

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been accepted or declined' })
    }

    invitation.status = 'accepted'
    await invitation.save()

    const [team, player] = await Promise.all([
      Team.findOne({ email: invitation.invitingTeam }),
      Player.findOne({ email: invitation.invitedPlayer }),
    ])

    if (!team || !player) {
      return res.status(404).json({ message: 'Team or Player not found' })
    }

    const playerToRemove = team.suggestedPlayers.find(suggestedPlayer => suggestedPlayer.equals(player._id))
    if (playerToRemove) {
      team.suggestedPlayers.pull(playerToRemove)
    }

    team.teamPlayers.push(player)
    player.inTeam = true
    player.team = team.email

    await Promise.all([team.save(), player.save()])

    return res.status(200).json({ message: 'Invitation accepted successfully' })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return res.status(500).json({ message: 'Error accepting invitation' })
  }
}

exports.rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const invitation = await Invitation.findById(id)

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.status === 'pending') {
      invitation.status = 'declined'
      invitation.rejectionReason = reason
      await invitation.save()

      return res.status(200).json({ message: 'Invitation rejected successfully' })
    } else if (invitation.status === 'accepted' || invitation.status === 'declined') {
      return res.status(400).json({ message: 'Invitation has already been accepted or declined' })
    } else {
      return res.status(400).json({ message: 'Invalid invitation status' })
    }
  } catch (error) {
    console.error('Error rejecting invitation:', error)
    return res.status(500).json({ message: 'Error rejecting invitation' })
  }
}