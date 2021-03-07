require('dotenv').config();
// getting express
const express = require('express');
// mongoose schema
const roomInfo = require('./utils/modal.js');
// bcrypt for password hashing
const bcrypt = require('bcrypt');
// sessions for users
const expressSession = require('express-session');
// flash for showing messages sent from server
const flash = require('connect-flash');
// for formatting messages of users
const formatMessage = require('./utils/message.js');

// declaring it as express app
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
app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{ maxAge : 60000}
}))
app.use(flash());

// room varible to handle rooms
const rooms = {}
let authenticate = false;
const botName = 'Bot';


// rendering home page
app.get('/', (req, res) => {
    res.render('Room Creator',{ rooms: rooms, findingError:req.flash('errFinding'), roomDoesNotExist:req.flash('roomDoesNotExist'), roomExistence:req.flash('roomExist')});
});


// rendering login page
app.get('/login', (req, res) => {
    res.render('Login page',
    { authentication:req.flash('reqAuthentication'),incorrect:req.flash('incorrectPassword')});
});

// posting room page,getting values from client site and saving room datas into database
app.post('/room', async (req, res) => {
    if (rooms[req.body.room] != null) {
        req.flash('roomExist','Given room name already exists!')
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
            authenticate = true;
            res.redirect(req.body.room)
        } catch (error) {
            console.log(error);
        }

    } catch {
        console.log('Error while saving data in database');
        res.redirect('/');
    }
});

// redirecting to room
app.get('/:room',(req, res) => {
    if (rooms[req.params.room] == null) {
        req.flash('roomDoesNotExist','Given room name does not exists!');
        return res.redirect('/')
    }
    if (authenticate === true) {
        authenticate = false;
        res.render('room', { roomName: req.params.room });
    } else {
        req.flash('reqAuthentication','Please authenticate yourself by entering room name and password!');
        res.redirect('/login');
    }
});


// serving rooms and finding in databse 
app.post('/findroom', getRoom ,(req,res)=>{
    
})

app.post('/leave',(req,res)=>{
    res.redirect('/');
})

// function for accessing rooms and hashing password
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
                    authenticate = true;
                    res.redirect(req.body.room)
                }
                else {
                    req.flash('incorrectPassword','Given password was incorrect!')
                    res.redirect('/login')
                }

            } catch (error) {
                req.flash('errFinding','Error while finding room or it did not exist!');
                res.redirect('/');
            }
        }
    })
    next()
}

// making server
const port = 3000 || process.env.PORT;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// socket connections
io.on('connection', (socket) => {
    // New user connection
    socket.on('new-user-joined', (room, name) => {
        socket.join(room);
        rooms[room].users[socket.id] = name
        socket.emit('greeting',formatMessage(botName,"Welcome to sillychat!"));
        io.to(room).emit('roomUser',{Ids:rooms[room].users});
        socket.to(room).broadcast.emit('user-joined', formatMessage(botName,`${name} joined the chat`));
    });

    // sending and receiving message
    socket.on('send', (room, message) => {
        socket.to(room).broadcast.emit('receive',formatMessage(rooms[room].users[socket.id],message))
    });
    
    // handling disconnection and deleting rooms form databases
    socket.on('disconnect', () => {
        getUserName(socket).forEach(room => {
            socket.to(room).broadcast.emit('left', formatMessage(botName,`${rooms[room].users[socket.id]} left the chat`));
            delete rooms[room].users[socket.id];
            io.to(room).emit('roomUser',{socketIds:rooms[room].users});
            deleteRoom(room);
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


function deleteRoom(room) {
    if (Object.keys(rooms[room].users).length === 0) {
        const deleteRoom = {room: room}
        roomInfo.deleteOne(deleteRoom, (error) => {
            if (error) {
                console.log(error.error);
            } else {
                console.log(`${room} successfully removed!`);
                delete rooms[room]
            }
        })
    }
}