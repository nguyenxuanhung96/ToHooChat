const db_collection = 'chatting';
var conversations;
var activedConversation;

window.onload = () => {
  console.log(firebase.app().name);
}
var currentUser, currentUsername;
if (localStorage.getItem('currentUser')) {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  currentUsername = currentUser.email;
  $('#userDisplayName').html(currentUser.displayName);
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
    <!-- Sender Message-->
    <div class="animated fadeIn media w-50 mb-3"><i class="far fa-user fa-2x"></i>
      <div class="media-body ml-3">
        <div class="bg-light rounded py-2 px-3 mb-2">
          <p class="text-small mb-0 text-muted">${message.content}</p>
        </div>
        <p class="small text-muted">${formatDatetime(message.createAt)}</p>
      </div>
    </div>
  `);
  $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
}
function addOutcomeMessage(message) {
  $('#chat-window').append(`
    <!-- Reciever Message-->
    <div class="animated fadeIn media w-50 ml-auto mb-3">
      <div class="media-body">
        <div class="bg-primary rounded py-2 px-3 mb-2">
          <p class="text-small mb-0 text-white">${message.content}</p>
        </div>
        <p class="small text-muted">${formatDatetime(message.createAt)}</p>
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
        $('.chatbox_conversations').append(`
        <a class="animated fadeInUp list-group-item list-group-item-action list-group-item-light rounded-0" ref="${c.id}" onclick="onSelectedConversation('${c.id}');">
          <div class="media"><i class="fas fa-users fa-2x"></i>
            <div class="media-body ml-4">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <h6 class="mb-0">${c.name}</h6><small class="small font-weight-bold">25 Dec</small>
              </div>
              <p class="font-italic mb-0 text-small">${c.members.length} member(s)</p>
            </div>
          </div>
        </a>
        `);
        activeUIActiveConversation();
      }, i * 150)
    }
  }
}

async function loadConversation() {
  const db = firebase.firestore();
  db.collection(db_collection).where('members', 'array-contains', currentUsername)
    .onSnapshot(function (snapShot) {
      if (!conversations) {

        conversations = snapShot.docChanges().map(function (item) {
          return {
            id: item.doc.id,
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
        for (const item of snapShot.docChanges()) {
          let c = {
            id: item.doc.id,
            ...item.doc.data(),
          };

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

// $('#frmSendMessage input').focus();


