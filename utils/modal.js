// getting mongoose for database entries  
const mongoose = require('mongoose');

// setting connection with mongo database
mongoose.connect('mongodb://localhost:27017/chatapp', { useNewUrlParser: true, useUnifiedTopology: true });


//getting connection of database as db variable
const db = mongoose.connection;
// logging error if occurs
db.on('error', console.error.bind(console, 'connection error:'));


// checking for once are we connected or not
db.once('open', function () {
    // we're connected!
    console.log("We are connected!");
});


// making schema
const roomDataScheme = new mongoose.Schema({
    room: String,
    password: String,
});

// converting schema into model to use it in db
const roomInfo = mongoose.model('roomdata', roomDataScheme);

module.exports = roomInfo;