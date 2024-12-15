const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/TeamUpSoccer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.once('open', () => {
  console.log('Successfully connected to MongoDB');
});
