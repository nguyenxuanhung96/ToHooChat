
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
      alert("Please verify your email first");
      return;
    }
    else {
      localStorage.setItem('currentUser', JSON.stringify({
        uid: loginResult.user.id,
        displayName: loginResult.user.displayName,
        email: loginResult.user.email,
      }));
      window.location.href = '../';
    }
  }catch(error){
    alert(error.message);
  }
})