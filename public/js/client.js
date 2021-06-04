// socket connection
const socket = io("http://localhost:3000");

// neccessary variables
let Username = null;
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
        Username = prompt("Enter you name", "Anonymous");
        if (Username === "" || Username === 'undefined' || Username == null) {
            alert('Name is necessery');
            continue;
        }
        if(Username.startsWith(' ',0) || Username.startsWith('_',0) || Username.startsWith('-',0)){
            alert('Name cannot start with space or underscrore,name should starts with valid character.')
            continue;
        }
        else if(Username.length > 16){
            alert('Only 16 characters are allowed, please type your name again.');
            continue;
        }
        else{
            socket.emit("new-user-joined", roomName,Username);
            break;
        }
    }

    function transmit(e) {
        e.preventDefault();
        const message = $("#message-input").data("emojioneArea").getText();
        if(message == "" || message == null){
            return false;
        }
        clientAppend(message, 'right');
        socket.emit('send', roomName,message);
        messageInput.value = '';
        $('#message-input').data('emojioneArea').setText("");
        $('#message-input').data('emojioneArea').setFocus();
    }

    // on form submission 
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (message != "" || message != null) {
            clientAppend(message, 'right');
            socket.emit('send', roomName,message);
            messageInput.value = '';
            $('#message-input').data('emojioneArea').setText("");
            $('#message-input').data('emojioneArea').setFocus();
        }
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

// for invitation
socket.on('invite',(code)=>{
    invitationUrl = code
});

// messages from server
socket.on('receive', message => {
    append(message, 'left');
});

// media from server
socket.on('media',media =>{
    mediaLayout(media,'left');
});

// those users who are offline
socket.on('left', name => {
    append(name, 'left');
});

// when room was delete and somehow user tries to reconnect
socket.on('errorOnRoom',serverResponse =>{
    console.log(serverResponse);
    append(serverResponse,"left");
})


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

// for scrolling 
function scrollup() {
    broadcast.scrollTop = broadcast.scrollHeight;
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
    ${String(message)}
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
    messageElement.innerHTML = `<p class="meta">${String(message.name)} : <span> ${String(message.time)}</span></p>
    <p class "text">
        ${String(message.text)}
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
            audio.play().catch(()=>{
                console.warn('User interation needed with dom');
            })
        }
    }
    
}

// media view layout
function mediaLayout(media,position) {
    if (media.text.substring(0,8) === "uploads/") {
        if (media.text.substring(media.text.length -3,media.text.length) === "mp4") {
            const div = document.createElement('div');
            const span = document.createElement('span');
            const downloadLink = document.createElement('a');
            const video = document.createElement('video');
            downloadLink.href = `http://localhost:3000/${media.text}`;
            downloadLink.innerHTML = `<i class="fas fa-download" style="margin:0px 0px 0px 10px"></i>`;
            span.innerHTML = `${media.name}: ${media.time}`;
            video.src = `http://localhost:3000/${media.text}`;
            video.autoplay = true;
            video.muted = true;
            video.controls = true;
            video.controlsList = "nodownload";
            downloadLink.classList.add('downloadlink');
            span.classList.add("modified_media_meta");
            span.classList.add(position);
            video.classList.add('modified_media');
            video.classList.add(position);
            if (darkModeDecider.checked) {
                span.style.backgroundColor = 'aliceblue';
                video.style.boxShadow = "7px 6px 8px #121212";
            }
            else if (redcherryDecider.checked) {
                video.style.backgroundColor ="#66afe999";
                video.style.boxShadow = "7px 6px 8px #b76666";
            }
            span.appendChild(downloadLink);
            div.append(span);
            broadcast.append(div,video);
            scrollup();
        }else{
            const div = document.createElement('div');
            const span = document.createElement('span');
            const downloadLink = document.createElement('a');
            const img = document.createElement('img');
            downloadLink.href = `http://localhost:3000/${media.text}`;
            downloadLink.innerHTML = `<i class="fas fa-download" style="margin:0px 0px 0px 10px"></i>`;
            span.innerHTML = `${media.name}: ${media.time}`;
            img.src = `http://localhost:3000/${media.text}`;
            span.classList.add("modified_media_meta");
            span.classList.add(position);
            img.classList.add('modified_media');
            img.classList.add(position);
            downloadLink.classList.add('downloadlink');
            if (darkModeDecider.checked) {
                span.style.backgroundColor = 'aliceblue';
                img.style.boxShadow = "7px 6px 8px #121212";
            }
            else if (redcherryDecider.checked) {
                video.style.backgroundColor ="#66afe999";
                img.style.boxShadow = "7px 6px 8px #b76666";
            }
            span.appendChild(downloadLink);
            div.append(span);
            broadcast.append(div,img);
            scrollup();
        }
    }
    setTimeout(() => {
        let disableLink = document.querySelectorAll('.downloadlink');
        if (disableLink != null) {
            disableLink.forEach(links => {
                links.style.display = "none";
            });
        }
    }, 1000 * 60 * 60);

    scrollup();
    if (position == 'left') {
        audio.play();
    }
}

//media for client
var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
        let data = `${reader.result}`;
        let extractedData = data.split(";");
        let extName = extractedData[0].split("/");
        const ext = extName[1];
        if (ext == 'mp4') {
            const video = document.createElement('video');
            video.classList.add('modified_media');
            video.classList.add('right');
            video.classList.add('modified_media_margins');
            video.controls = true;
            video.autoplay = true;
            video.muted = true;
            video.src = reader.result;
            if (darkModeDecider.checked) {
                video.style.boxShadow = "7px 6px 8px #121212";
            }else if (redcherryDecider.checked) {
                video.style.boxShadow = "7px 6px 8px #b76666";
            }
            broadcast.append(video);
        }else{
            const img = document.createElement('img');
            img.alt = 'image';
            img.classList.add('modified_media');
            img.classList.add('right');
            img.classList.add('modified_media_margins');
            img.src = reader.result;
            if (darkModeDecider.checked) {
                img.style.boxShadow = "7px 6px 8px #121212";
            }else if (redcherryDecider.checked) {
                img.style.boxShadow = "7px 6px 8px #b76666";
            }
            broadcast.append(img);
            scrollup();
        }
        scrollup();
    };
    scrollup();
    reader.readAsDataURL(event.target.files[0]);
    scrollup();
};

//media upload
function sendFile(files,event) {
    maxSize = 10602144;
    if (files[0].size > maxSize) {
        alert("Try choosing file below 10 mb");
        document.getElementById('file-input').value = '';
        return;
    }else{
        loadFile(event);
        let formData = new FormData;
        const config = {
            header : { "content-type" : "multipart/form-data" }
        }
        formData.append('file',files[0]);

        axios.post('api/sillychat/uploadfiles',formData,config)
            .then(response=>{
                document.getElementById('file-input').value = '';
                if (response.data.success) {
                    let media = response.data.url;
                    socket.emit('media', Username,roomName,media);
                }
            })
            .catch(err =>{
                console.warn(err);
            })
    }
}

// current time
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
    var media = document.querySelectorAll('.modified_media');
    var media_meta = document.querySelectorAll('.modified_media_meta');
    if (darkModeDecider.checked) {
        document.body.classList.add('dark');
        broadcast.classList.add('darkMessageBox');
        user_container.classList.add('dark-user-container');
        dark_invite_menu.classList.add('dark-invitation-popup');
        dark_setting_menu.classList.add('dark-setting-menu');
        messageBox.forEach(box => {
            box.classList.add('darkTextMessageBox');
        });
        if (media.length != 0) {
            media.forEach(element => {
                element.style.boxShadow = "7px 6px 8px #121212";
            });
        }
        if (media_meta.length != 0) {
            media_meta.forEach(meta => {
                meta.style.backgroundColor = 'aliceblue';
            });
        }
    } else {
        document.body.classList.remove('dark');
        broadcast.classList.remove('darkMessageBox');
        user_container.classList.remove('dark-user-container');
        dark_invite_menu.classList.remove('dark-invitation-popup');
        dark_setting_menu.classList.remove('dark-setting-menu');
        messageBox.forEach(box => {
            box.classList.remove('darkTextMessageBox');
        });
        if (media.length != 0) {
            media.forEach(element => {
                element.style.boxShadow = "";
            });
        }
        if (media_meta.length != 0) {
            media_meta.forEach(meta => {
                meta.style.backgroundColor = '';
            });
        }
        scrollup();
    }
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
    var media = document.querySelectorAll('.modified_media');
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
        if (media.length != 0) {
            media.forEach(element => {
                element.style.boxShadow = "7px 6px 8px #b76666";
            });
        }
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
        if (media.length != 0) {
            media.forEach(element => {
                element.style.boxShadow = "";
            });
        }
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