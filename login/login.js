
if (userFactory.isLogin()) {
  let currentUser = userFactory.getUser();
  if (currentUser.email) {
    window.location.href = '../';
  }
}

$('#form-info').submit(async function (e) {
  e.preventDefault();

  let email = this.elements['inputEmail'].value;
  let pass = this.elements['inputPassword'].value;
  let remember = this.elements['remember-me'].checked;
  try {
    const loginResult = await firebase.auth().signInWithEmailAndPassword(email, pass);
    if (!loginResult.user.emailVerified) {
      sweetAlertF.error("Please verify your email first!");
      return;
    }
    else {
      userFactory.setUser(
        loginResult.user
        , remember);

      swal({
        closeOnClickOutside: false,
        buttons: false,
        title: "Login success!",
        text: "Redirect after 2s...",
        icon: "success",
      });
      let i = 1;
      let countDown = setInterval(() => {
        $('.swal-modal .swal-text').html(`Redirect after ${i--}s...`);
        if (i < 0) clearInterval(countDown);
      }, 1000);
      setTimeout(() => {
        window.location.href = '../';
      }, 2000);
    }
  } catch (error) {
    if (error.code === FirebaseErrorCode.UserNotMatch) {
      sweetAlertF.error(error.message);
    } else {
      sweetAlertF.error("Email or password not matched!");
    }
  }
})