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
// json web tokens for authorization
const jwt = require('jsonwebtoken');
// multer for uploading
const multer = require('multer');
// path
const path = require('path');
// fs
const fs = require('fs');

// multer config
const storage =  require('./utils/storage');
const { fileLoader } = require('ejs');

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

// json
app.use(express.json());

// serving static files so it can be acces by server
app.use(express.static('public'));

var upload = multer({ storage: storage }).single('file');

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

const fsp = require('fs').promises;
const oneHour = 1000 * 60 * 5;

// run cleanup once per hour
let cleanupTimer = setInterval(async () => {
    const downloadRoot = 'uploads/'
    let oneHourOld = Date.now() - oneHour;
    try {
        let files = await fsp.readdir(downloadRoot, {withFileTypes: true});
        for (let f of files) {
             if (f.isFile()) {
                 let fullName = path.join(__dirname +'/' + downloadRoot, f.name);
                 let info = await fsp.stat(fullName);
                 // if file modification time is older than one hour, remove it
                 if (info.mtimeMs <= oneHourOld) {
                     fsp.unlink(fullName).catch(err => {
                         // log error, but continue
                         console.log(`Can't remove temp download file ${fullName}`, err);
                     });
                 }
             }
        }
    } catch(e) {
        console.log(e);
    }
    
}, oneHour);

// unref the timer so it doesn't stop node.js from exiting naturally
cleanupTimer.unref();

// rendering home page
app.get('/', (req, res) => {
    res.render('home',{ rooms: rooms, findingError:req.flash('errFinding'), roomDoesNotExist:req.flash('roomDoesNotExist'), roomExistence:req.flash('roomExist'),unauthorizedToken:req.flash('unauthorisedToken')});
});

// rendering login page
app.get('/login', (req, res) => {
    res.render('login',
    { authentication:req.flash('reqAuthentication'),incorrect:req.flash('incorrectPassword')});
});

// redirecting to room
app.get('/:room',authenticateRooms,(req, res) => {});

// handling downloads
const downloadRoot = './uploads/'
app.get("/uploads/:id", (req, res) => {
    const fullPath = path.resolve(path.join(downloadRoot, req.params.id));
    res.download(fullPath, (err) => {
        if (err) {
            console.log(err);
        }
    })
});

// posting room page,getting values from client site and saving room datas into database
app.post('/room',postRooms,(req, res) => {});

// serving rooms and finding in databse 
app.post('/findroom', getRoom ,(req,res)=>{})

app.post('/leave',(req,res)=>{
    res.redirect('/');
})

// handling upload
app.post("/api/sillychat/uploadfiles", (req, res) => {
    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err });
        }
        return res.json({ success: true, url: `uploads` + '/' + req.file.filename });
    });
});

//posting all rooms necessary details to the server
async function postRooms(req,res,next) {
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
        res.redirect('/');
    }
    next();
}

function authenticateRooms(req,res,next) {
    if (rooms[req.params.room] == null) {
        req.flash('roomDoesNotExist','We could not verify your credentials. Please double-check and try again.');
        return res.redirect('/')
    }
    if (req.query.t != undefined) {
        const token = req.query.t;
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,room)=>{
            if(err) {
                req.flash('unauthorisedToken','Invalid token. Please fill the required fields to get access');
                return res.redirect('/login');
            }else{
                if (req.params.room == room.room) {
                    res.render('room', { roomName: room.room });
                }else{
                    req.flash('unauthorisedToken','We could not verify your credentials. Please double-check and try again.');
                    return res.redirect('/');
                }
            }
        })
    } else if (authenticate === true) {
        authenticate = false;
        res.render('room', { roomName: req.params.room });
    } else {
        req.flash('reqAuthentication','We could not verify your credentials. Please double-check and try again.');
        res.redirect('/login');
    }
    next();
}


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
                    req.flash('incorrectPassword','We could not verify your credentials. Please double-check and try again.')
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
        socket.to(room).broadcast.emit('user-joined', formatMessage(botName,`${name} has joined us`));
    });

    //invitation code
    socket.on('generateInvitationCode',(room,modifiedUrl)=>{
        const accessToken = jwt.sign({room:room},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: 60*5 });
        const newUrl = modifiedUrl + '/' + room + '?t=' + accessToken;
        io.to(socket.id).emit('invite',newUrl);
    });

    // sending and receiving message
    socket.on('send', (room, message) => {
        socket.to(room).broadcast.emit('receive',formatMessage(rooms[room].users[socket.id],message))
    });
    
    // receiving and sending media
    socket.on('media', (Username,media) => {
        socket.broadcast.emit('media', formatMessage(Username,media));
    });
    
    // handling disconnection and deleting rooms form databases
    socket.on('disconnect', () => {
        getUserName(socket).forEach(room => {
            socket.to(room).broadcast.emit('left', formatMessage(botName,`${rooms[room].users[socket.id]} left us`));
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