const db_collection = 'chatting';
var conversations;
var activedConversation;

window.onload = () => {
  console.log(firebase.app().name);
}

var currentUsername;

function sendMessage($event) {
  if ($event.keyCode === 13) {
    if (!currentUsername) {
      alert('Select acc first!');
      return;
    }
    let m = {
      createBy: currentUsername,
      createAt: new Date().toISOString(),
      content: $event.target.value,
    };
    sendToDB(m);
    $event.target.value = "";
  }
}

function addMessage(message) {
  if (message.createBy === currentUsername) {
    addOutcomeMessage(message);
  } else {
    addIncomeMessage(message);
  }
}

function addOutcomeMessage(message) {
  $('#chat-window').append(`
    <div class="chatbox__messages outcome-message animated fadeIn d-flex flex-row-reverse">
      <div class="chatbox__messages__user-message">
        <div class="chatbox__messages__user-message--ind-message" title="${formatDatetime(message.createAt)}">
          <p class="message">${message.content}</p>
        </div>
        <div class="clear-float"></div>
      </div>
    </div>
  `);
  $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
}
function addIncomeMessage(message) {
  $('#chat-window').append(`
    <div class="chatbox__messages income-message animated fadeIn">
      <div class="chatbox__messages__user-message">
        <div class="chatbox__messages__user-message--ind-message" title="${formatDatetime(message.createAt)}">
          <p class="name">${message.createBy}</p>
          <br />
          <p class="message">${message.content}</p>
        </div>
        <div class="clear-float"></div>
      </div>
    </div>`);
  $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
}

function formatDatetime(d) {
  return moment(d).format('DD-MM-YYYY HH:mm:ss');
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
    for (const c of conversations) {
      $('.chatbox_conversations').append(`
      <div class='chatbox__user' ref="${c.id}" onclick="onSelectedConversation('${c.id}');">
        <p>${c.name}</p>
      </div>
      `);
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
          for (let message of activedConversation.messages) {
            addMessage(message);
          }
        }
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
      addConversations(conversations);
      activeUIActiveConversation();
    });
};

function onSelectedConversation(id) {
  for (const c of conversations) {
    if (c.id === id) {
      activedConversation = c;
      reloadConversation();
    }
  }
  activeUIActiveConversation();
}

function reloadConversation() {
  $('#chat-window').html('');
  for (let message of activedConversation.messages) {
    addMessage(message);
  }
}

function activeUIActiveConversation(){
  $('.chatbox_conversations .chatbox__user').removeClass('active');
  $(`.chatbox_conversations .chatbox__user[ref="${activedConversation.id}"]`).addClass('active');
}

function selectUser(target) {
  if (target.value) {
    currentUsername = target.value;
    loadConversation();
  }
}

$('.input-message input').focus();


