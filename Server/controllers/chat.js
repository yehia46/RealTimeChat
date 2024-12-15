const Chat = require('../models/chat');
const Team = require('../models/team');
const Player = require('../models/player');

exports.sendMessage = async (user1, user2, sender, content) => {
  try {
    let chat = await Chat.findOne({
      $or: [{ user1, user2 }, { user1: user2, user2: user1 }],
    });

    if (!chat) {
      chat = new Chat({
        user1: user1,
        user2: user2,
        messages: [],
      });
    }

    chat.messages.push({ sender, content });

    await chat.save();

    return chat;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Error sending message');
  }
};

exports.getChats = async (userEmail) => {
  try {
    const chatRooms = await Chat.find({
      $or: [{ user1: userEmail }, { user2: userEmail }],
    });

    return chatRooms;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw new Error('Error fetching chat rooms');
  }
};

exports.getMessage = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    
    const chat = await Chat.findOne({ $or: [ { user1, user2 }, { user1: user2, user2: user1 } ] });
    
    if (chat) {
      res.status(200).json(chat);
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } catch (error) {
    console.error('Error fetching chat object:', error);
    res.status(500).json({ error: 'Error fetching chat object' });
  }
};