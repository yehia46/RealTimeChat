const Player = require("./models/player")
const Team = require("./models/team")

async function taskLogic() {
  try {
    console.log('Task logic function is running')

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    const newPlayers = await Player.find({
      createdAt: { $gte: tenMinutesAgo }
    })

    console.log('newPlayers', newPlayers)

    for (const player of newPlayers) {
      const preferredPosition = player.preferredPosition

      const teamsWithVacancy = await Team.find({
        preferredPosition: preferredPosition
      })

      console.log('teamsWithVacancy', teamsWithVacancy) 

      for (const team of teamsWithVacancy) {
        const isPlayerSuggested = team.suggestedPlayers.some((suggestedPlayer) => 
        suggestedPlayer.equals(player._id)
      )

        console.log('isPlayerSuggested', isPlayerSuggested)

        console.log('player', player)

        if (!isPlayerSuggested) {
          team.suggestedPlayers.push(player._id)
          await team.save()

          console.log(`Player ${player.name} suggested to team ${team.name}`)
        }
      }
    }

    console.log('Task logic function completed')
  } catch (error) {
    console.error('Error executing task logic:', error)
  }
}

module.exports = taskLogic