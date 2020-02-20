
$('#form-info').submit(async function (e) {
  e.preventDefault();
  let email = this.elements['inputEmail'].value;
  let pass = this.elements['inputPassword'].value;
  let conPass = this.elements['inputConPassword'].value;
  let name = this.elements['inputName'].value;
  if (pass != conPass) {
    alert("Password not matched");
    return;
  }

  try {
    await firebase.auth().createUserWithEmailAndPassword(email, pass);
    firebase.auth().currentUser.updateProfile({
      displayName: name,
    });
    firebase.auth().currentUser.sendEmailVerification();
    alert("Success");
    window.location.href = '../login'
  } catch (error) {
    alert(error.message);
  }
});
