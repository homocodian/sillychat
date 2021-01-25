const socket = io("http://localhost:3000");

const form = document.getElementById('text-mess');
const messageinput = document.getElementById('message-input');
const roomContainer = document.getElementById('room-container');
const broadcast = document.querySelector('.message-container');

var audio = new Audio('Receive.mp3');

// append function 
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    broadcast.append(messageElement);
    if (position == 'left') {
        audio.play();
    }
}

if (broadcast != null) {
    while (true) {
        const Username = prompt("Enter you name", "Anonymous");
        if (Username == null) {
        alert('Name is necessery');
        }else{
            socket.emit("new-user-joined", roomName,Username);
            break;
        }
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageinput.value;
        append(`You: ${message}`, 'right');
        socket.emit('send', roomName,message);
        messageinput.value = '';
        const messageBox = document.querySelector('.emojionearea-editor');
        messageBox.innerHTML = "";
    });
}

// socket.on('room-created',room =>{
//     const roomElement = document.createElement('div');
//     roomElement.innertext = room;
//     const roomLink = document.createElement('a');
//     roomLink.classList.add("room-join");
//     roomLink.href = `/${room}`;
//     roomLink.innerText = 'join'
//     roomContainer.append(roomElement);
//     roomContainer.append(roomLink);
// });

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', data => {
    append(`${data.name} : ${data.message}`, 'left');
});

socket.on('left', name => {
    append(`${name} left the chat`, 'left');
});