const socket = io("http://localhost:3000");
let setting_menu_closed = true;
const form = document.getElementById('text-mess');
const messageinput = document.getElementById('message-input');
const broadcast = document.querySelector('.message-container');
var container = document.getElementById('users-name');
const decider = document.getElementById('toggleDark');
const mute_sound = document.getElementById('mute-sound');
var containerElement = window.document;
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


// // finding users name which are coming from server
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

// // pushing users to client
function newUser(name) {
    var div = document.createElement('div');
    div.innerText = name;
    container.appendChild(div);
}


// // appending sender message 
function clientAppend(message,position){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageElement.innerHTML = `<p class="meta" >You : ${get_current_time(new Date)}</p>
    <p class "text">
    ${message}
    </p>`;
    broadcast.append(messageElement);
       if (decider.checked) {
           darkMode();
       }
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
        if (!mute_sound.checked) {
            audio.play();
        }
    }
       if (decider.checked) {
           darkMode();
      }
}

// setting menu
function open_setting() {
    var getting_setting_div = document.getElementById('setting-overlay');
    var setting_menu = document.getElementById('setting-menu');
    if (setting_menu_closed) {
        getting_setting_div.style.display = "flex";
        setting_menu.style.display = 'flex';
        setting_menu_closed = false;
    } else {
        setting_menu.style.display = 'none';
        getting_setting_div.style.display = "none";
        setting_menu_closed = true;
    }
}

// // form opening function 
function openForm(state) {
    var containerElement = window.document;
    var overlayEle = document.getElementById('overlay');

    if (state) {
        overlayEle.style.display = 'flex';
        containerElement.classList.add('blur','popup');
    } else {
        overlayEle.style.display = 'none';
        containerElement.classList.remove('blur','popup');
    }
}

// const send_invitation = document.getElementById('popup');
// send_invitation.addEventListener('submit',(e)=>{
//     e.preventDefault();
//     sendInvite();
// });

// // invite function 
// function sendInvite() {
//     var senderName = document.getElementById('senderName').value;
//     var receiverEmail = document.getElementById('receiverEmail').value;
//     var overlayEle = document.getElementById('overlay');
//     const link = window.location.href;
//     window.open(`mailto:${receiverEmail}?subject=${senderName} wants to discuss something private&body=click on the link to join the conversation  >>>>>>>>>>> ${link}`);
//     document.getElementById('senderName').value = "";
//     document.getElementById('receiverEmail').value = "";
//     overlayEle.style.display = 'none';
//     containerElement.classList.remove('blur', 'popup');
// }

//Dark mode
function darkMode() {
    var messageBox = document.querySelectorAll('div.message');
    var meta = document.querySelectorAll('p.meta');
    var user_container = document.querySelector('.user-container');
    var dark_setting_menu = document.getElementById('setting-menu');
    if (decider.checked) {
        document.body.classList.add('dark');
        broadcast.classList.add('darkMessageBox');
        user_container.classList.add('dark-user-container');
        dark_setting_menu.classList.add('dark-setting-menu');
        for (let index = 0; messageBox.length; index++) {
            meta[index].classList.add('color');
            messageBox[index].classList.add('darkTextMessageBox');
        }
    } else {
        document.body.classList.remove('dark');
        broadcast.classList.remove('darkMessageBox');
        user_container.classList.remove('dark-user-container');
        dark_setting_menu.classList.remove('dark-setting-menu');
        for (let index = 0; messageBox.length; index++) {
            meta[index].classList.remove('color');
            messageBox[index].classList.remove('darkTextMessageBox');
        }
    }
}

function get_current_time(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function openwhatsapp() {
    const url = window.location.href;
    window.open(`whatsapp://send?text=${url}`);
}

function openfacebook() {
    const url = window.location.href;
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "pop", "width=600, height=400, scrollbars=no"); 
}

function opentwitter() {
    // var fbShareLink = shareLink + '&picture=' + imgUrl + '&description=' + descript;
    // var twShareLink = 'text=' + descript + '&url=' + shareLink;
    const url = window.location.href;
    window.open(`https://twitter.com/messages/compose?text=${encodeURIComponent(url)}`);
}

function opentelegram() {
    const url = window.location.href;
    const text = "I want to discuss something private with you click on above link";
    window.open(`tg://msg_url?url=${url}&text=${text}`);
}

function openmail() {
    const url = window.location.href;
    window.open(`mailto:?subject= I wants to discuss something private&body=click on the link to join the conversation  >>>>>> ${url}`);
}