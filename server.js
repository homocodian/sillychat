// getting express
const express = require('express');


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
const roomdata = new mongoose.Schema({
    room: String,
    password: String,
});


// converting schema into model to use it in db
const roominfo = mongoose.model('roomdata', roomdata);


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
    console.log('welcome to our home page');
    res.render('Room Creator', { rooms: rooms });
});


// rendering login page
app.get('/login',(req,res)=>{
    console.log('Welcome to our login page');
    res.render('Login page');
});


// posting room page,getting values from client site and saving room datas into database
app.post('/room', (req, res) => {
    console.log('Logging info in out database...');
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    const data = {
        room : req.body.room,
        password : req.body.roomPassword,
    }
    const roomdata = new roominfo(data);
    roomdata.save();
    res.redirect(req.body.room)
    // send message
    // io.emit('room-created', req.body.room);
});


app.get('/:room', (req, res) => {
    console.log(`redirecting to chatroom: ${req.params.room}`);
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room });
});


// serving rooms and finding in databse 
app.post('/findroom',(req,res)=>{
    console.log(`searching room : ${req.body.room}`);
    const getdata ={
        room : req.body.room,
        password : req.body.roomPassword,
    }
    roominfo.find(getdata,(err,data)=>{
        if (err) {
            console.log(err);
        }
        if (data == "") {
            return res.redirect('/Login page')
        }
        res.redirect(req.body.room)
    })
})


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
                    const droom = {
                        room:room
                    }
                    roominfo.deleteOne(droom,(err)=>{
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