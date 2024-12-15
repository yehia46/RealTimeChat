const Player = require('../models/player')
const Team = require('../models/team')
const bcrypt = require('bcrypt')
const saltRounds = 10

exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find()
    res.status(200).send(players)
  } catch (e) {
    console.log(e)
    res.status(500).send({ message: "Failed to retrieve players: " + e })
  }
}

exports.register = async (req, res) => {
  try {
    const { name, dateOfBirth, address, phoneNumber, email, password, preferredPosition, profileImg, team } = req.body

    const teamExists = await Team.findOne({ email })

    if (teamExists) {
      return res.status(400).send({ message: "Email is already registered as a team." })
    }

    const playerExists = await Player.findOne({ email })

    if (playerExists) {
      return res.status(400).send({ message: "Player already exists with this email." })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const player = new Player({
      name,
      dateOfBirth,
      address,
      phoneNumber,
      email,
      password: hashedPassword,
      preferredPosition,
      profileImg,
      inTeam: false,
      team,
    })

    await player.save()
    res.status(200).send({
      message: "Player created successfully",
    })
  } catch (e) {
    console.log(e.message)
    res.status(500).send({
      message: "An error occurred while creating the Player. Please try again later.",
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const player = await Player.findOne({ email })

    if (!player) {
      return res.status(404).send({ message: "User not found." })
    } else {
      const isMatch = await bcrypt.compare(password, player.password)

      if (!isMatch) {
        return res.status(400).send({ message: "Invalid email or password." })
      }
    }
    res.status(200).send({ message: "Logged in successfully.", player })
  } catch (e) {
    console.log(e)
    res.status(500).send({ message: "Something went wrong." })
  }
}

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const team = await Team.findOne({ email })

//     if (team) {
//       return res.status(200).send({ message: "This is a team account." })
//     }

//     const player = await Player.findOne({ email })

//     if (!player) {
//       return res.status(404).send({ message: "User not found." })
//     }

//     const isMatch = await bcrypt.compare(password, player.password)

//     if (!isMatch) {
//       return res.status(400).send({ message: "Invalid password." })
//     }

//     res.status(200).send({ message: "Logged in successfully.", user: player })
//   } catch (e) {
//     console.log(e)
//     res.status(500).send({ message: "Something went wrong." })
//   }
// }

exports.getPlayerByEmail = async (req, res) => {
  try {
    const { email } = req.params
    const player = await Player.findOne({ email })
    if (!player) return res.status(404).send()
    res.status(200).json(player)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.getPlayerById = async (req, res) => {
  try {
    const { id } = req.params
    const player = await Player.findById(id)
    if (!player) return res.status(404).send()
    res.status(200).json(player)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.updatePlayer = async (req, res) => {
  try {
    const { email } = req.params
    const updatedPlayer = req.body

    const player = await Player.findOneAndUpdate({ email: email }, updatedPlayer, {
      new: true
    })

    if (!player) {
      return res.status(404).send('Player not found')
    }

    res.status(200).json(player)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.updateProfilePicture = async (req, res) => {
  try {
    const { email } = req.params
    const { file } = req

    const filePath = file.path

    const player = await Player.findOneAndUpdate({ email: email }, { profileImg: filePath }, {
      new: true
    })

    if (!player) {
      return res.status(404).send('Player not found')
    }

    console.log('Updated Player:', player)

    res.status(200).json(player)
  } catch (error) {
    console.error('Error updating profile picture:', error)
    res.status(500).send(error)
  }
}

exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndRemove(req.params.id)
    if (!player) return res.status(404).send()
    res.status(200).json({ message: 'Player deleted successfully' })
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params

    const player = await Player.findOne({ email })
    if (player) {
      return res.status(200).json(player)
    }

    const team = await Team.findOne({ email })
    if (team) {
      return res.status(200).json(team)
    }

    res.status(404).send('User not found')
  } catch (error) {
    res.status(500).send(error)
  }
}