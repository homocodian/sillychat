
// getting express
const express = require('express');
const bcrypt = require('bcrypt');

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

// announcing it as express app
const app = express();


// creating server with the help of http
const server = require('http').Server(app)


// getting socket.io in express server 
const io = require('socket.io')(server)


// serving views file so it can be accessed by server
app.set('views', './views');


// setting view engine
app.set('view engine', 'ejs');


// serving static files so it can be acces by server
app.use(express.static('public'));



// getting values from client sites
app.use(express.urlencoded({ extended: true }))

// room varible to handle rooms
const rooms = {}


// rendering home page
app.get('/', (req, res) => {
    res.render('Room Creator', { rooms: rooms });
});


// rendering login page
app.get('/login', (req, res) => {
    console.log('Welcome to our login page');
    res.render('Login page');
});


// posting room page,getting values from client site and saving room datas into database
app.post('/room', async (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    try {
        const hashedpassword = await bcrypt.hash(req.body.roomPassword, 10);
        const logData = {
            room: req.body.room,
            password: hashedpassword,
        }
        const roomData = new roomInfo(logData);
        try {
            roomData.save();
            res.redirect(req.body.room)
        } catch (error) {
            console.log(error);
        }

    } catch {
        console.log('Error while saving data in database');
        res.redirect('/');
    }

    // send message
    // io.emit('room-created', req.body.room);
});


app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room });
});


// serving rooms and finding in databse 
app.post('/findroom', getRoom ,(req,res)=>{
    
})

function getRoom(req, res, next) {
    const getRoomByName = {
        room: req.body.room
    }
    roomInfo.findOne(getRoomByName, async(err, data) => {
        if (err) {
            console.log(err);
        } else {
            try {
                const match = await bcrypt.compare(req.body.roomPassword, data['password']);

                if (match) {
                    //login
                    res.redirect(req.body.room)
                }
                else {
                    res.redirect('/login')
                }

            } catch (error) {
                res.redirect('/')
            }
        }
    })
    next()
}

// making server
server.listen(3000, () => {
    console.log('App Started on port 3000');
});


// socket connections
io.on('connection', (socket) => {
    // New user connection
    socket.on('new-user-joined', (room, name) => {
        socket.join(room);
        rooms[room].users[socket.id] = name
        socket.to(room).broadcast.emit('user-joined', name);
    });


    // sending and receiving message
    socket.on('send', (room, message) => {
        socket.to(room).broadcast.emit('receive', { message: message, name: rooms[room].users[socket.id] })
    });



    // handling disconnection and deleting rooms form databases
    socket.on('disconnect', (room, name) => {
        getUserName(socket).forEach(room => {
            socket.to(room).broadcast.emit('left', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id];
            if (Object.keys(rooms[room].users).length === 0) {
                console.log('Room deletion process initiated');
                setTimeout(() => {
                    const deleteRoom = {
                        room: room
                    }
                    roomInfo.deleteOne(deleteRoom, (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`${room} successfully removed!`);
                            delete rooms[room]
                        }
                    })
                }, 5000);
            }
        })
    })
})


// function to get username of client who just disconnected
function getUserName(socket) {
    return Object.entries(rooms).reduce((names, [roomname, room]) => {
        if (room.users[socket.id] != null) names.push(roomname)
        return names
    }, [])
}