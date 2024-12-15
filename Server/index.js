const express = require("express")
const app = express()
const cors = require('cors')
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const PORT = 8000
const db = require('./database')
const Chat = require('./models/chat')
const Message = require("./models/message")

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))
app.use("/profile", express.static("profile"))

// Socket.IO start
io.on("connection", (socket) => {
  console.log("Socket.IO connected")

  socket.on("join", async (room) => {
    const { user1, user2 } = room

    try {
      let chat = await Chat.findOne({
        $or: [{ users: [user1, user2] }, { users: [user2, user1] }],
      })

      if (!chat) {
        chat = new Chat({
          isGroup: false,
          users: [user1, user2],
          latestMessage: null,
          groupAdmin: null,
        })
  
        chat = await chat.save()
      }

      socket.join(chat._id)
      console.log("User Joined Room: " + chat._id)
    } catch (error) {
      console.error('Error joining chat:', error)
    }
  })

  socket.on('new message', async (newMessage) => {
    try {
      const message = new Message({
        sender: newMessage.sender,
        content: newMessage.content,
        chat: newMessage.chat
      })

      const savedMessage = await message.save()

      const chat = await Chat.findOne({ _id: newMessage.chat })
      if (chat) {
        chat.latestMessage = savedMessage._id
        await chat.save()
      }
      let room = chat._id.toString()
      io.emit('message received', newMessage)
      console.log("room: ", room)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  })

  socket.on("request chats", async (reqChat) => {
    try {
      let userChats = await Chat.find({ users: reqChat })
  
      socket.emit("chats received", userChats)
    } catch (error) {
      console.error("Error fetching user chats:", error)
    }
  })

  socket.on('typing', (data) => socket.in(data.chat).emit('typing...', data))
})
// socket io end

// Routes
const playerRoutes = require("./routes/player.route")
const teamRoutes = require("./routes/team.route")
const postRoutes = require("./routes/post.route")
const inviteRoutes = require("./routes/invitation.route")
app.use("/players", playerRoutes)
app.use("/teams", teamRoutes)
app.use("/posts", postRoutes)
app.use("/invitations", inviteRoutes)

// Welcome to server
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!")
})

const taskLogic = require("./task-logic")

// Automatic Task
app.post("/task", (req, res) => {
  try {
    taskLogic()
    res.status(200).json({ message: "Task executed successfully" })
  } catch (error) {
    console.error("Error executing task logic:", error)
    res.status(500).json({ message: "Error executing task logic" })
  }
})

// Start the server
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}).on("error", (err) => {
  console.error(`Error starting server: ${err}`)
})

// Schedule a task
const schedule = require("node-schedule")

// 10 min
const job = schedule.scheduleJob("*/10 * * * *", function () {
  taskLogic()
})







// const { log } = require("console")
// const { Socket } = require("socket.io")