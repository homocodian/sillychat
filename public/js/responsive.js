
let menu_open = false;
const menu_button = document.querySelector('.menu-btn');
const message_container = document.querySelector('.message-container');
const message_form = document.getElementById('text-mess');
const box_for_user = document.querySelector('.user-container');
const overlay = document.getElementById('overlay');
const invitation_close_button = document.querySelector('div#close b');

invitation_close_button.addEventListener('click',()=>{
    overlay.style.display = "none"
});

menu_button.addEventListener('click', () => {
    if (!menu_open) {
        message_container.style.display = "none";
        message_form.style.display = "none";
        menu_button.classList.add('open');
        box_for_user.style.display = "flex";
        menu_open = true;
    } else {
        message_container.style.display = "block";
        message_form.style.display = "flex";
        box_for_user.style.display = "none";
        menu_button.classList.remove('open');
        menu_open = false;
        openForm(0); // this is for form closing only if opened
    }
});

function imageSelection() {
    var file = document.getElementById('file-input');
    var image_button = document.getElementById('send-image-button');
    file.onchange = function (){
        var maxSize = 954990;
        var fileSize = file.files[0].size; // in bytes
        if(fileSize>maxSize){
            file.value = "";
            image_button.src = `https://img.icons8.com/plasticine/100/000000/image.png`
            alert('file size is more then ' +maxSize + ' bytes this is only for security reason & will be revoked soon');
            return false;
        }else{
            image_button.src = `../png/tick.png`;
            return false
        }

    }
}
