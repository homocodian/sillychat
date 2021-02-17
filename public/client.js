const socket = io("http://localhost:3000");

const form = document.getElementById('text-mess');
const messageinput = document.getElementById('message-input');
const broadcast = document.querySelector('.message-container');
var container = document.getElementById('users-name');

var audio = new Audio('Receive.mp3');


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
        clientAppend(message, 'right');
        socket.emit('send', roomName,message,broadcast.scrollTop = broadcast.scrollHeight);
        messageinput.value = '';
        const messageBox = document.querySelector('.emojionearea-editor');
        messageBox.innerHTML = "";
        messageBox.focus();
    });
}


socket.on('user-joined', name => {
    append(name, 'right');
    broadcast.scrollTop = broadcast.scrollHeight;
});

socket.on('roomUser',socketIds =>{
    findUser(socketIds);
})


socket.on('greeting',greeting =>{
    append(greeting,'right');
})

socket.on('receive', message => {
    append(message, 'left');
    broadcast.scrollTop = broadcast.scrollHeight;
});

socket.on('left', name => {
    append(name, 'left');
    broadcast.scrollTop = broadcast.scrollHeight;
});


// finding users name which are coming from server
function findUser(socketIds) {
    container.innerHTML = '';
    for (const name in socketIds) {
        if (Object.hasOwnProperty.call(socketIds, name)) {
            const users = socketIds[name];
            for (const nameOfId in users) {
                if (Object.hasOwnProperty.call(users, nameOfId)) {
                    const idName = users[nameOfId];
                    newUser(idName);
                }
            }
        }
    }
}

// pushing users to client
function newUser(name) {
    var div = document.createElement('div');
    div.innerText = name;
    container.appendChild(div);
}


// appending sender message 
function clientAppend(message,position){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageElement.innerHTML = `<p class="meta" >You</p>
    <p class "text">
    ${message}
    </p>`;
    broadcast.append(messageElement);
}

// appending receiver message 
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageElement.innerHTML = `<p class="meta">${message.name} : <span> ${message.time}</span></p>
    <p class "text">
        ${message.text}
    </p>`;
    broadcast.append(messageElement);
    if (position == 'left') {
        audio.play();
    }
}

// form opening function 
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

// invite function 
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