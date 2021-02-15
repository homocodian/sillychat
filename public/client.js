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
            reload();
            break;
        }
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageinput.value;
        append(`You: ${message}`, 'right');
        socket.emit('send', roomName,message,broadcast.scrollTop = broadcast.scrollHeight);
        messageinput.value = '';
        const messageBox = document.querySelector('.emojionearea-editor');
        messageBox.innerHTML = "";
    });
}

function openForm(state) {
    var containerElement = window.document;
    var overlayEle = document.getElementById('overlay');

    if (state) {
        overlayEle.style.display = 'block';
        containerElement.classList.add('blur','popup');
    } else {
        overlayEle.style.display = 'none';
        containerElement.classList.remove('blur','popup');
    }
}

function reload(){
    var container = document.getElementById("users-name");
    var content = container.innerHTML;
    container.innerHTML= content;
    console.log(content);
    console.log(container);
}

function newUser(username) {
    let newDiv = document.createElement('div');
    newDiv.appendChild(document.createTextNode(username));
    document.getElementById('users-name').appendChild(newDiv);
}

function sendInvite() {
    var senderName = document.getElementById('senderName').value;
    var receiverEmail = document.getElementById('receiverEmail').value;
    var overlayEle = document.getElementById('overlay');
    if (senderName == "" || receiverEmail == "") {
        alert('Please provide relevent info of required field')
    } else {
        const link = window.location.href;
        window.open(`mailto:${receiverEmail}?subject=${senderName} wants to discuss something private&body=click on the link to join the conversation  >>>>>>>>>>> ${link}`);
        document.getElementById('senderName').value = "";
        document.getElementById('receiverEmail').value = "";
        overlayEle.style.display = 'none';
        containerElement.classList.remove('blur', 'popup');

    }
}

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right');
    newUser(name);
    broadcast.scrollTop = broadcast.scrollHeight;
});

socket.on('receive', data => {
    append(`${data.name} : ${data.message}`, 'left');
    broadcast.scrollTop = broadcast.scrollHeight;
});

socket.on('left', name => {
    append(`${name} left the chat`, 'left');
    broadcast.scrollTop = broadcast.scrollHeight;
});