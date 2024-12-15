const Team = require('../models/team')
const Player = require('../models/player')
const bcrypt = require('bcrypt')
const path = require('path')
const { log } = require('console')
const saltRounds = 10

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
    res.status(200).send(teams)
  } catch (e) {
    console.log(e)
    res.status(500).send({ message: "Failed to retrieve teams: " + e })
  }
}

exports.getSuggestedPlayers = async (req, res) => {
  try {
    const email = req.params.email
    const team = await Team.findOne({ email }).populate('suggestedPlayers')
    if (!team) {
      return res.status(404).send({ message: 'Team not found.' })
    }

    const suggestedPlayers = team.suggestedPlayers
    res.status(200).send(suggestedPlayers)
  } catch (error) {
    res.status(500).send({ message: 'Failed to retrieve suggested players: ' + error })
  }
}

exports.register = async (req, res) => {
  try {
    const { name, managerName, managerDob, address, phoneNumber, email, password, profileImg } = req.body

    const playerExists = await Player.findOne({ email })

    if (playerExists) {
      return res.status(400).send({ message: "Email is already registered as a player." })
    }

    const teamExists = await Team.findOne({ email })

    if (teamExists) {
      return res.status(400).send({ message: "Team already exists with this email." })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const team = new Team({
      name,
      managerName,
      managerDob,
      address,
      phoneNumber,
      email,
      password: hashedPassword,
      profileImg,
      preferredPosition: [],
      suggestedPlayers: [],
      teamPlayers: []
    })

    await team.save()
    res.status(200).send({
      message: "Team created successfully",
    })
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      message: "An error occurred while creating the team. Please try again later.",
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const team = await Team.findOne({ email })

    if (!team) {
      return res.status(404).send({ message: "User not found." })
    } else {
      const isMatch = await bcrypt.compare(password, team.password)

      if (!isMatch) {
        return res.status(400).send({ message: "Invalid email or password." })
      }
    }
    res.status(200).send({ message: "Logged in successfully.", team })
  } catch (e) {
    console.log(e)
    res.status(500).send({ message: "Something went wrong." })
  }
}

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const player = await Player.findOne({ email })

//     if (player) {
//       return res.status(200).send({ message: "This is a player account." })
//     }

//     const team = await Team.findOne({ email })

//     if (!team) {
//       return res.status(404).send({ message: "User not found." })
//     }

//     const isMatchTeam = bcrypt.compare(password, team.password)

//     if (!isMatchTeam) {
//       return res.status(400).send({ message: "Invalid email or password." })
//     }

//     res.status(200).send({ message: "Logged in successfully.", user: team })
//   } catch (e) {
//     console.log(e)
//     res.status(500).send({ message: "Something went wrong." })
//   }
// }

exports.getTeamByEmail = async (req, res) => {
  try {
    const { email } = req.params
    const team = await Team.findOne({ email })
    if (!team) return res.status(404).send()
    res.status(200).json(team)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    if (!team) return res.status(404).send()

    await team.save()

    res.status(200).json(team)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.updateProfilePicture = async (req, res) => {
  try {
    const { email } = req.params
    const { file } = req

    console.log('Profile Img:', file)

    const filePath = file.path

    const team = await Team.findOneAndUpdate({ email: email }, { profileImg: filePath }, {
      new: true
    })

    if (!team) {
      return res.status(404).send('Team not found')
    }

    console.log('Updated Team:', team)

    res.status(200).json(team)
  } catch (error) {
    console.error('Error updating profile picture:', error)
    res.status(500).send(error)
  }
}

exports.getTeamPlayers = async (req, res) => {
  try {
    const { email } = req.params
    console.log('EMAIL: ', email)

    const team = await Team.findOne({ email }).populate('teamPlayers')

    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    const teamPlayers = team.teamPlayers
    console.log('TEAM Players: ', teamPlayers)

    res.status(200).json(teamPlayers)
  } catch (error) {
    console.error('Error fetching team players:', error)
    res.status(500).json({ error: 'Error fetching team players' })
  }
}

exports.removePlayerFromTeam = async (req, res) => {
  try {
    const { email } = req.params
    console.log('Email: ', email)
    const player = await Player.findOne({ email })

    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    console.log('Player ID: ', player._id)
    player.inTeam = false
    player.team = ''

    await player.save()

    const team = await Team.findOne({ teamPlayers: player._id })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    team.teamPlayers = team.teamPlayers.filter(playerId => playerId.toString() !== player._id.toString())

    await team.save()

    res.status(200).json({ message: 'Player removed from the team successfully' })
  } catch (error) {
    console.error('Error removing player from the team:', error)
    res.status(500).json({ error: 'Error removing player from the team' })
  }
}

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndRemove(req.params.id)
    if (!team) return res.status(404).send()
    res.status(200).json({ message: 'Team deleted successfully' })
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.updatePreferredPositions = async (req, res) => {
  try {
    const { email } = req.params
    const { preferredPosition } = req.body

    const team = await Team.findOne({ email })

    if (!team) {
      return res.status(404).send({ message: 'Team not found.' })
    }

    team.preferredPosition = preferredPosition
    await team.save()

    res.status(200).send({ message: 'Preferred positions updated successfully.' })
  } catch (error) {
    res.status(500).send({ message: 'Failed to update preferred positions: ' + error })
  }
}

exports.getTeamPreferredPositions = async (req, res) => {
  const { email } = req.params
  console.log("team.preferredPosition", email)
  try {
    const team = await Team.findOne({ email: email })

    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }

    const preferredPositions = team.preferredPosition || []
    console.log("team.preferredPosition", team.preferredPosition)
    res.status(200).json(preferredPositions)
  } catch (error) {
    console.error('Error fetching preferred positions:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

exports.addTeamDescription = async (req, res) => {
  const { teamEmail } = req.params
  const { description } = req.body

  try {
    const team = await Team.findOne({ email: teamEmail })

    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    team.description = description
    await team.save()

    console.log('Team description added successfully:', description, team.email)

    return res.status(200).json({ message: 'Team description added successfully' })
  } catch (error) {
    console.error('Error adding team description:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

exports.getTeamDescription = async (req, res) => {
  const { teamEmail } = req.params

  try {
    const team = await Team.findOne({ email: teamEmail })
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    if (team.description) {
      return res.status(200).json({ description: team.description })
    } else {
      return res.status(200).json({ message: 'Team has no description' })
    }
  } catch (error) {
    console.error('Error getting team description:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}