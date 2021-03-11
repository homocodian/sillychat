// socket connection
const socket = io("http://localhost:3000");

// neccessary variables 
let setting_menu_closed = true;
const form = document.getElementById('text-mess');
const messageInput = document.getElementById('message-input');
const broadcast = document.querySelector('.message-container');
const darkModeDecider = document.getElementById('toggleDark');
const redcherryDecider = document.getElementById('redcherry');
const muteSound = document.getElementById('mute-sound');
const usersName = document.getElementById('users-name');
let invitationUrl = null;

// Notification sound 
var audio = new Audio('Receive.mp3');

// taking user name and sending to server 
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

    // on form submission 
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        clientAppend(message, 'right');
        socket.emit('send', roomName,message);
        messageInput.value = '';
        const messageBox = document.querySelector('.emojionearea-editor');
        messageBox.innerHTML = "";
        messageBox.focus();
    });
}

// user join event
socket.on('user-joined', name => {
    append(name, 'left');
});

// room users name
socket.on('roomUser',Ids =>{
    findUser(Ids);
})

// greeting form server
socket.on('greeting',greeting =>{
    append(greeting,'right');
})

// messages from server
socket.on('receive', message => {
    append(message, 'left');
});

// for invitation
socket.on('invite',(code)=>{
    invitationUrl = code
});

// those users who are offline
socket.on('left', name => {
    append(name, 'left');
});


// // finding users name which are coming from server
function findUser(Ids) {
    usersName.innerHTML = '';
    for (const name in Ids) {
        if (Object.hasOwnProperty.call(Ids, name)) {
            const users = Ids[name];
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
    usersName.appendChild(div);
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
    if (darkModeDecider.checked) {
        messageElement.classList.add('darkTextMessageBox');
    }
    else if (redcherryDecider.checked) {
        messageElement.classList.add('cherrymsg');
    }
    broadcast.append(messageElement);
    scrollup()
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
    if (darkModeDecider.checked) {
        messageElement.classList.add('darkTextMessageBox');
    }
    else if (redcherryDecider.checked) {
        messageElement.classList.add('cherrymsg');
    }
    scrollup()
    if (position == 'left') {
        if (!muteSound.checked) {
            audio.play();
        }
    }
    
}

// current for users
function get_current_time(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var currentTime = hours + ':' + minutes + ' ' + ampm;
    return currentTime;
}

// for scrolling 
function scrollup() {
    broadcast.scrollTop = broadcast.scrollHeight
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
        setting_menu_closed = true;
        setting_menu.style.display = 'none';
        getting_setting_div.style.display = "none";
    }
}

// // form opening function 
function openForm(state) {
    var overlayEle = document.getElementById('overlay');
    if (state) {
        overlayEle.style.display = 'flex';
        const url = window.location.href.split('/');
        const modifiedUrl = url[0]+'//'+url[1]+url[2];
        socket.emit('generateInvitationCode',roomName,modifiedUrl);
    } else {
        overlayEle.style.display = 'none';
    }
}


//Dark mode
function darkMode() {
    if (redcherryDecider.checked) {
        darkModeDecider.checked = false;
        alert('Please Turn off red cherry theme to active dark mode');
        return
    }
    var messageBox = document.querySelectorAll('div.message');
    var user_container = document.querySelector('.user-container');
    var dark_setting_menu = document.getElementById('setting-menu');
    let dark_invite_menu = document.getElementById('invitation-popup');
    if (darkModeDecider.checked) {
        document.body.classList.add('dark');
        broadcast.classList.add('darkMessageBox');
        user_container.classList.add('dark-user-container');
        dark_invite_menu.classList.add('dark-invitation-popup');
        dark_setting_menu.classList.add('dark-setting-menu');
        messageBox.forEach(box => {
            box.classList.add('darkTextMessageBox');
        });
    } else {
        document.body.classList.remove('dark');
        broadcast.classList.remove('darkMessageBox');
        user_container.classList.remove('dark-user-container');
        dark_invite_menu.classList.remove('dark-invitation-popup');
        dark_setting_menu.classList.remove('dark-setting-menu');
        messageBox.forEach(box => {
            box.classList.remove('darkTextMessageBox');
        });
    }
    scrollup();
}

// RedCherry Theme
function redcherry() {
    if (darkModeDecider.checked) {
        redcherryDecider.checked = false;
        alert('Please Turn off dark mode to active red cherry theme');
        return
    }
    const messageBox = document.querySelectorAll('div.message');
    const user_container = document.querySelector('.user-container');
    const cherry_setting_menu = document.getElementById('setting-menu');
    const cherry_invite_menu = document.getElementById('invitation-popup');
    const roomname_box = document.getElementById('roomname');
    const username_box = document.getElementById('users-name');
    const userbutton_box = document.querySelectorAll('.userButtons');
    if (redcherryDecider.checked) {
        document.body.classList.add('cherry');
        broadcast.classList.add('cherrybgimg');
        roomname_box.classList.add('cherryroomname');
        username_box.classList.add('cherryusername');
        userbutton_box.forEach(box => {
            box.classList.add('cherryuserbuttons');
        });
        cherry_setting_menu.classList.add('cherry-setting-menu');
        cherry_invite_menu.classList.add('cherry-invitation-popup');
        user_container.classList.add('cherryinfobox');
        messageBox.forEach(box => {
            box.classList.add('cherrymsg');
        });
    } else {
        document.body.classList.remove('cherry');
        broadcast.classList.remove('cherrybgimg');
        roomname_box.classList.remove('cherryroomname');
        username_box.classList.remove('cherryusername');
        userbutton_box.forEach(box => {
            box.classList.remove('cherryuserbuttons');
        });
        cherry_setting_menu.classList.remove('cherry-setting-menu');
        cherry_invite_menu.classList.remove('cherry-invitation-popup');
        user_container.classList.remove('cherryinfobox');
        messageBox.forEach(box => {
            box.classList.remove('cherrymsg');
        });
    }
    scrollup();
}

// whatsapp invitation
function openwhatsapp() {
    if (invitationUrl != null) {
        window.open(`whatsapp://send?text=${invitationUrl}`);
    }
}

// facebook invitation
function openfacebook() {
    if (invitationUrl != null) {
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(invitationUrl), "pop", "width=600, height=400, scrollbars=no"); 
    }
}

// twitter invitation
function opentwitter() {
    if (invitationUrl != null) {
        window.open(`https://twitter.com/messages/compose?text=${encodeURIComponent(invitationUrl)}`);
    }
}

// telegram invitation
function opentelegram() {
    if (invitationUrl != null) {
        const text = "I want to discuss something private with you click on above link";
        window.open(`tg://msg_url?url=${invitationUrl}&text=${text}`);
    }
}

// email invitation
function openmail() {
    if (invitationUrl != null) {
        window.open(`mailto:?subject= I wants to discuss something private&body=click on the link to join the conversation  >>>>>> ${invitationUrl}`);
    }
}