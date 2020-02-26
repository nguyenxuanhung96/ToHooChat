const db_collection = 'chatting';
var conversations;
var changeConversations = [];
var activedConversation;
var currentUser, currentUsername;
if (userFactory.isLogin()) {
  currentUser = userFactory.getUser();
  currentUsername = currentUser.email;
  $('#userDisplayName').html(currentUser.displayName);
  if (currentUser.photoURL) {
    $('#avatar').replaceWith(`<img id="avatar" src="${currentUser.photoURL}" width="30" height="30"/>`)
  } else {
    $('#avatar').replaceWith(`<i class="fas fa-user" id="avatar"></i>`)
  }
  loadConversation();
} else {
  sweetAlertF.error('You need login first!');
  window.location.href = 'login';
}

$('#frmSendMessage').submit(function (e) {
  e.preventDefault();
  if (this.elements['inputMessage'].value) {
    let m = {
      createBy: currentUsername,
      createAt: new Date().toISOString(),
      content: this.elements['inputMessage'].value,
    };
    sendToDB(m);
    this.elements['inputMessage'].value = "";
  }
})

function addMessage(message) {
  if (message.createBy === currentUsername) {
    addOutcomeMessage(message);
  } else {
    addIncomeMessage(message);
  }
}

function addIncomeMessage(message) {
  $('#chat-window').append(`
    <div class="animated fadeIn media mb-3"><i class="far fa-user fa-2x"></i>
      <div class="media-body ml-3">
        <div class="message-content message-income d-inline-block" onclick="showTime(this);"
          data-toggle="tooltip" data-placement="left" data-html="true" title="<span class='d-none d-sm-block tooltip-content'>${formatDatetime(message.createAt)}</span>">
          <p class="text-small mb-0">${message.content}</p>
        </div>
        <p class="create-at small text-muted d-sm-none" style="display:none;">${formatDatetime(message.createAt)}</p>
      </div>
    </div>
  `);
  $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
}
function addOutcomeMessage(message) {
  $('#chat-window').append(`
    <div class="animated fadeIn media ml-auto mb-3">
      <div class="media-body text-right">
        <div class="message-content message-outcome d-inline-block" onclick="showTime(this);"
          data-toggle="tooltip" data-placement="top" data-html="true" title="<span class='d-none d-sm-block tooltip-content'>${formatDatetime(message.createAt)}</span>">
          <p class="text-small mb-0">${message.content}</p>
        </div>
        <p class="create-at small text-muted d-sm-none" style="display:none;">${formatDatetime(message.createAt)}</p>
      </div>
    </div>
  `);
  $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
}

function formatDatetime(d) {
  return moment(d).format('HH:mm | DD-MM');
}

async function sendToDB(newMessage) {
  const db = firebase.firestore();

  await db.collection(db_collection).doc(activedConversation.id).update({
    messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
  });
}

function addConversations(conversations) {
  $('.chatbox_conversations').html('');
  if (conversations) {
    for (const [i, c] of conversations.entries()) {
      setTimeout(() => {
        addConversation(c);
        activeUIActiveConversation();
      }, i * 150);
    }
  }
}

function addConversation(c) {
  $('.chatbox_conversations').append(`
    <a class="animated fadeInUp list-group-item list-group-item-action list-group-item-light rounded-0" ref="${c.id}" onclick="onSelectedConversation('${c.id}');">
      <div class="media"><i class="fas fa-users fa-2x"></i>
        <div class="media-body ml-4">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <h6 class="mb-0">${c.name}</h6><!--<small class="small font-weight-bold">25 Dec</small>-->
          </div>
          <p class="font-italic mb-0 text-small">${c.members.length} member(s)</p>
        </div>
      </div>
    </a>
    `);
}

function modifyConversation(c) {
  $(`.chatbox_conversations .list-group-item[ref="${c.id}"]`).replaceWith(`
    <a class="animated list-group-item list-group-item-action list-group-item-light rounded-0" ref="${c.id}" onclick="onSelectedConversation('${c.id}');">
      <div class="media"><i class="fas fa-users fa-2x"></i>
        <div class="media-body ml-4">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <h6 class="mb-0">${c.name}</h6><!--<small class="small font-weight-bold">25 Dec</small>-->
          </div>
          <p class="font-italic mb-0 text-small">${c.members.length} member(s)</p>
        </div>
      </div>
    </a>
    `);
}

function removeConversation(id) {
  $(`.chatbox_conversations .list-group-item[ref="${id}"]`).slideUp();
  setTimeout(() => {
    $(`.chatbox_conversations .list-group-item[ref="${id}"]`).remove();
  }, 1000);
}

function loadChangeConversations(newConversations) {
  let added = newConversations.filter(e => e.type === FirebaseSnapshotType.Add);
  let modified = newConversations.filter(e => e.type === FirebaseSnapshotType.Modify);
  let removed = newConversations.filter(e => e.type === FirebaseSnapshotType.Remove);
  conversations.push(...added);
  removed.forEach(function (c) {
    let i = conversations.findIndex(e => e.id === c.id);
    if (i >= 0) {
      conversations.splice(i, 1);
      removeConversation(c.id);
    }
  });
  added.forEach(function (c) {
    addConversation(c);
  });
  modified.forEach(function (c) {
    modifyConversation(c);
  });
}

function loadChangeConversation(c) {
  $(`.chatbox_conversations .list-group-item[ref="${c.id}"]`).html(`
  <a class="animated fadeInUp list-group-item list-group-item-action list-group-item-light rounded-0" ref="${c.id}" onclick="onSelectedConversation('${c.id}');">
    <div class="media"><i class="fas fa-users fa-2x"></i>
      <div class="media-body ml-4">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <h6 class="mb-0">${c.name}</h6><!--<small class="small font-weight-bold">25 Dec</small>-->
        </div>
        <p class="font-italic mb-0 text-small">${c.members.length} member(s)</p>
      </div>
    </div>
  </a>
  `);
}

async function loadConversation() {
  const db = firebase.firestore();
  db.collection(db_collection).where('members', 'array-contains', currentUsername)
    .onSnapshot(function (snapShot) {
      if (!conversations) {
        conversations = snapShot.docChanges().map(function (item) {
          return {
            id: item.doc.id,
            type: 'added',
            ...item.doc.data(),
          };
        });
        if (conversations && conversations.length > 0) {
          activedConversation = conversations[0];

          $('#chat-window').html('');
          for (let [i, message] of activedConversation.messages.entries()) {
            addMessage(message);
          }
        }
        addConversations(conversations);
      } else {
        let docChange = snapShot.docChanges();
        changeConversations.length = 0;
        for (const item of docChange) {
          let c = {
            id: item.doc.id,
            type: item.type,
            ...item.doc.data(),
          };
          console.log(item);
          changeConversations.push(c);
          for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].id === c.id) {
              conversations[i] = c;
            }
          };

          if (c.id === activedConversation.id) {
            activedConversation = c;

            if (c.messages.length > 0) {
              addMessage(c.messages[c.messages.length - 1]);
            }
          }
          loadChangeConversations(changeConversations);
        }
      }
      activeUIActiveConversation();
    });
};

function onSelectedConversation(id) {
  for (const c of conversations) {
    if (c.id === id) {
      activedConversation = c;
    }
  }
  reloadConversation();
  activeUIActiveConversation();
  $('#frmSendMessage input').focus();
}

function reloadConversation() {
  $('#chat-window').html('');
  for (let message of activedConversation.messages) {
    addMessage(message);
  }
}

function activeUIActiveConversation() {
  $('.chatbox_conversations .list-group-item').addClass("list-group-item-light").removeClass('active text-white');
  $(`.chatbox_conversations .list-group-item[ref="${activedConversation.id}"]`).removeClass("list-group-item-light").addClass('active text-white');
}

let showTime = ($this) => {
  $($this).closest('.media-body').children('.create-at').slideToggle();
}

let addNewConversations = () => {
  $('#modalAddNewConversation').modal('show');
}

$('#frmNewConversation').submit(function (e) {
  e.preventDefault();
  $('#newConversation-error').hide();
  let name = this.elements['inputNewConversation'].value;
  let members = this.elements['inputMembersList'].value;
  let list = members ? members.split(',') : [];
  if (list.length === 0) {
    $('#newConversation-error').show();
    $('#newConversation-error').html('Members is required');
  } else {
    let newConversation = getNewConversation(name, list);
    const db = firebase.firestore();
    db.collection(db_collection).add(newConversation).then(function (doc) {
      $('#modalAddNewConversation').modal('hide');
      toatrAlerF.success("Create new conversation successfully");
    }).catch(function (error) {
      toatrAlerF.error(error.message);
    })
  }
});
$('#frmNewConversation').keypress(function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
  }
});

$('#frmNewConversation #inputMembers').keyup(function (e) {
  e.preventDefault();
  $('#inputMembers-error').hide();
  if (e.keyCode === 13) {
    if (validateEmail($(this).val())) {
      let listValue = $('#frmNewConversation #inputMembersList').val();
      let list = listValue ? listValue.split(',') : [];
      list.push($(this).val());
      $('#frmNewConversation #inputMembersList').val(list.join(','));
      loadMemberList(list);
      $(this).val('');
    } else {
      $('#inputMembers-error').show();
    }
  }
});

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

let loadMemberList = (list) => {
  $('#members-list').html('');
  for (const [i, m] of list.entries()) {
    $('#members-list').append(`
      <tr>
        <td>${i + 1}</td>
        <td>${m}</td>
      </tr>
    `);
  }
}

$('#modalAddNewConversation').on('hidden.bs.modal', function (e) {
  $('#frmNewConversation').trigger('reset');
  $('#members-list').html('');
});

$('#modalAddNewConversation').on('show.bs.modal', function (e) {
  $('#frmNewConversation #inputMembersList').val(currentUsername);
  loadMemberList([currentUsername]);
})

$('body').tooltip({
  selector: '.message-content',
});


let getNewConversation = (name, memberList) => {
  let r = {
    createAt: new Date().toISOString(),
    members: memberList,
    messages: [],
    name: name,
    createBy: currentUsername,
  };
  return r;
}