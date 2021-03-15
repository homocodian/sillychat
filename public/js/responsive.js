
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
        box_for_user.style.display = "";
        menu_button.classList.remove('open');
        menu_open = false;
        openForm(0); // this is for form closing only if opened
    }
});
