const db_collection = 'chatting';
var conversations;
var activedConversation;

window.onload = () => {
  console.log(firebase.app().name);
}

var currentUsername = 'nguyenxuan.hung96@gmail.com';

function sendMessage($event){
  if($event.keyCode === 13){
    let m = {
      createBy: currentUsername,
      createAt: new Date().toISOString(),
      content: $event.target.value,
    };
    sendToDB(m);
    $event.target.value = "";
  }
}

function addMessage(message){
  if(message.createBy === currentUsername){
    addOutcomeMessage(message);
  }else{
    addIncomeMessage(message);
  }
}

function addOutcomeMessage(message){
  $('#chat-window').append(`
    <div class="chatbox__messages outcome-message animated fadeIn">
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
function addIncomeMessage(message){
  $('#chat-window').append(`
    <div class="chatbox__messages income-message">
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

function formatDatetime(d){
  return moment(d, 'dd-MM-yyyy HH:mm:ss');
}

async function sendToDB(newMessage){
  const db = firebase.firestore();

  await db.collection(db_collection).doc('aPkkl30lzWuqQBvDMX0I').update({
    messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
  });
}

async function loadConversation(){
  const db = firebase.firestore();
  db.collection(db_collection).where('members', 'array-contains', currentUsername)
    .onSnapshot(function (snapShot){
      if(!conversations){

        conversations = snapShot.docChanges().map(function(item){
          return {
            id: item.doc.id,
            ...item.doc.data(),
          };
        });
        if(conversations && conversations.length > 0){
          activedConversation = conversations[0];

          for (let message of activedConversation.messages) {
            addMessage(message);
          }
        }
      }else{
        for (const item of snapShot.docChanges()) {
          let c = {
            id: item.doc.id,
            ...item.doc.data(),
          };

          for (let i = 0; i < conversations.length; i++) {
            if(conversations[i].id === c.id){
              conversations[i] = c;
            }            
          };

          if(c.id === activedConversation.id){
            activedConversation = c;
            addMessage(c.messages[c.messages.length - 1]);
          }
        }
      }
    })
}

function selectUser(target){
  if(target.value){
    currentUsername = target.value;
    loadConversation();
  }
}

$('.input-message input').focus();


