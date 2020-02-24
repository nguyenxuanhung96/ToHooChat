let currentUser;
firebase.auth().onAuthStateChanged((user) => {
  currentUser = user;
  displayCurrentUser(currentUser);
});

function displayCurrentUser(user) {
  $('#userDisplayName').html(user.displayName);
  $('#inputEmail').val(user.email);
  $('#inputName').val(user.displayName);
  $('#inputPhone').val(user.phoneNumber);
  $('#inputAvatar').val(user.photoURL);
  if (user.photoURL) {
    $('#avatar').replaceWith(`<img id="avatar" src="${user.photoURL}" width="30" height="30"/>`)
  } else {
    $('#avatar').replaceWith(`<i class="fas fa-user" id="avatar"></i>`)
  }
}

$('#frmUserInfo').submit((e) => {
  e.preventDefault();

  currentUser.updateProfile({
    displayName: $('#inputName').val(),
    phoneNumber: $('#inputPhone').val(),
    photoURL: $('#inputAvatar').val(),
  }).then(() => {
    userFactory.setUser(currentUser);
    toatrAlerF.success("Update successfully!");
    displayCurrentUser(currentUser);
  }).catch((error) => {
    toatrAlerF.error(error.message);
  });

});


