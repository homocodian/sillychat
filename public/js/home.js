// const alert = document.querySelector(".alert");
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const form = document.getElementById("validationID");

form.addEventListener('submit',(e)=>{
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  let name_field_value = document.getElementById('roomCreatorName').value;
  let pass_field_value = document.getElementById('passCreator').value;
  let strongPassword = String(pass_field_value).match(strongRegex);

  if (name_field_value.toLowerCase() == pass_field_value.toLowerCase()) {
    e.preventDefault();
    alert("Name and password should not be same");
  }

  else if(pass_field_value == "password" || pass_field_value == "Password" || pass_field_value == "PASSWORD"){
    e.preventDefault();
    alert("Password should not be password");
  }

  else if(String(pass_field_value).startsWith(" ") || String(pass_field_value).endsWith(" ")){
    e.preventDefault();
    alert("Password should not start and ends with space character")
  }
  
  else if(strongPassword == null){
    e.preventDefault();
    alert("Password must contain at least 1 lowercase,1 uppercase,1 numeric,1 special character and it must be eight characters or longer");
  }
})

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

let input_type_text = false;
function showPassword(id) {
  if (!input_type_text) {
    document.getElementById(String(id)).type = "text";
    input_type_text = true;
  }
  else{
    document.getElementById(String(id)).type = "password";
    input_type_text = false;
  }
}

// function validation(name_field_id,pass_field_id) {
//   console.log("validating");
  
//   console.log(name_value);
//   console.log(pass_value);
//   alert("hello");
//   return false;
// }