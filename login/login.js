
if(localStorage.getItem('currentUser')){
  let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if(currentUser.email){
    window.location.href = '../';
  }
}

$('#form-info').submit(async function (e) {
  e.preventDefault();

  let email = this.elements['inputEmail'].value;
  let pass = this.elements['inputPassword'].value;
  try {

    const loginResult = await firebase.auth().signInWithEmailAndPassword(email, pass);
    if (!loginResult.user.emailVerified) {
      sweetAlertF.error("Please verify your email first!");
      return;
    }
    else {
      localStorage.setItem('currentUser', JSON.stringify({
        uid: loginResult.user.id,
        displayName: loginResult.user.displayName,
        email: loginResult.user.email,
      }));

      swal({
        closeOnClickOutside: false,
        buttons: false  ,
        title: "Login success!",
        text: "Redirect after 2s..."
      });
      let i = 1;
      let countDown = setInterval(() => {
        $('.swal-modal .swal-text').html(`Redirect after ${i--}s...`);
        if(i < 0) clearInterval(countDown);
      }, 1000);
      setTimeout(() => {
        window.location.href = '../';
      }, 2000);
    }
  }catch(error){
    sweetAlertF.error(error.message);
  }
})