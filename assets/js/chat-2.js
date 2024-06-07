/********************/
/*    Variables     */
/********************/

var chat_receive_seconds = 30000;
var is_receiver = document.getElementById("receiver_data");
let csrfToken = $('meta[name=csrf-token]').attr('content');
var audio = new Audio('/audio/chat_sound.mp3');

var USER = {
    'channel': document.getElementById('current_user_data').dataset.channel,
    'username': document.getElementById('current_user_data').dataset.username,
    'avatar':  document.getElementById('current_user_data').dataset.avatar,
    'receiver': document.getElementById('current_user_data').dataset.receiver,
    'room_id': document.getElementById('current_user_data').dataset.room,
}

if (is_receiver){
    var RECEIVER = {
        'username': document.getElementById('receiver_data').dataset.receiver,
        'room_id': document.getElementById('receiver_data').dataset.room,
    }
} else {
    var RECEIVER = {
        'username': null,
        'room_id': null,
    }
}

/************************/
/*    Run Functions     */
/************************/

$( document ).ready(function() {
    if (is_receiver){
        scrollToBottom("chat_messages");
        detect_enter_key();
        render_chat_messages_from_server();
    }

    Pusher.logToConsole = false;

    var pusher = new Pusher('9ce7bf8c4389f119e275', {
      cluster: 'us2'
    });

    var channel = pusher.subscribe(USER.channel);

    channel.bind('new-message', function(data) {

        if (is_receiver && parseInt(data['room_id']) === parseInt(RECEIVER.room_id)) {
            var message_display_data = {
                is_sender: false,
                created_on: null,
                message_content: htmlDecode(data["message"]),
            }
            add_chat_messages_to_chat_box(message_display_data)
        } else if (is_receiver && parseInt(data['room_id']) !== parseInt(RECEIVER.room_id)){
            //room-to-append
            play_chat_sound()
        } else if (!is_receiver){
            var chat_room_to_append = '<li id="'+data["room_id"]+'" class="p-3 chat-unread"><a class="d-flex" href="/my-account/message/'+data["username"].toLowerCase()+'"><div class="chat-user-thumbnail me-3 shadow"><img class="img-circle avatar avatar-md-sm rounded-circle" src="'+data["profile_picture"]+'" alt=""></div><div class="chat-user-info"><h6 class="text-truncate mb-0">'+data["username"]+'</h6><div class="last-chat"><p class="mb-0 text-truncate">'+data["message"]+' <span class="badge rounded-pill bg-primary ms-2">1</span></p></div></div></a><div class="dropstart chat-options-btn"><button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="mdi mdi-dots-vertical"></i></button><ul class="dropdown-menu"><li><a href="#"><i class="mdi mdi-volume-off"></i>Mute</a></li><li><a href="#"><i class="mdi mdi-cancel"></i>Ban</a></li></ul></div></li>'
            if(document.getElementById(data['room_id'])){
                document.getElementById(data['room_id']).remove();
            }
            document.getElementsByClassName('room-to-append')[0].innerHTML = chat_room_to_append + document.getElementsByClassName('room-to-append')[0].innerHTML
            play_chat_sound();
        }
    });
});

/*************************/
/*   Useful Functions    */
/*************************/

function convertTextToSafeText(inputText){
	try{
		return inputText.replace(/[&<>"']/g, function($0) {
			return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
		});

	} catch (error) {
		console.error(error);
	}
}

function convertSafeTextToTextWithLinks(inputText){
	try{
		var outputText = inputText.replace(/&lt;a href=&quot;(.*?)&quot;&gt;(.*?)&lt;\/a&gt;/g, function($0, $1, $2) {
			return "<a href=\"" + $1 + "\">" + $2 + "</a>";
		});
		outputText = outputText.replace(/&lt;span class=&quot;(.*?)&quot;&gt;(.*?)&lt;\/span&gt;/g, function($0, $1, $2) {
			return "<span class=\"" + $1 + "\">" + $2 + "</span>";
		});
		outputText = outputText.replace(/&lt;i class=&quot;(.*?)&quot;&gt;(.*?)&lt;\/i&gt;/g, function($0, $1, $2) {
			return "<i class=\"" + $1 + "\">" + $2 + "</i>";
		});
		return outputText;
	} catch (error) {
		console.error(error);
	}
}

// Auto scroll chats to bottom of div
function scrollToBottom (id) {
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "auto" });
}

function htmlDecode(html, decode=true) {
    if (decode) {
        return he.decode(html);
    }else{
        return html;
    }
}

function htmlEncode(input){
    return he.escape(input);
}

function linkParse(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4, replacePattern5;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank"><span class="chat-link"><i class="uil uil-link"></i> $1</span></a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank"><span class="chat-link"><i class="uil uil-link"></i> $2</span></a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" target="_blank"><span class="chat-link"><i class="uil uil-link"></i> $1</span></a>');

    //Match @ mentions - @Kimali Fernando-659 /@(\w+( \w+)*)-(\d*)/gim
    // replacePattern4 = /@(\W*\w+( \W*\w+)*)-(\d*)/gim
    // replacedText = replacedText.replace(replacePattern4, '<a href="/u/$2"><span class="chat-link">@$1</span></a>');

    // Match # Hash - #gotabaya /#[a-zA-Z0-9_]/gim
    if ( inputText.indexOf('&#x') === -1 ) {
        replacePattern5 = /(#[^`~!@$%^&*\#()\-+=\\|\/\.,<>?\'\":;{}\[\]* ]+)/gim
        replacedText = (replacedText).replace(replacePattern5, '<span class="hashtag">$1</span>');
    }

    return replacedText;
}

function get_input_message(){
    return document.getElementById('message_content').value
}

function clear_input_message(){
    document.getElementById('message_content').value = ''
}

function play_chat_sound() {
    // Play Chat pop sound
    audio.play();
}

function detect_enter_key() {
    document.getElementById('message_content').addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            send_message();
        }
    });
}

function delete_room(room_id=RECEIVER.room_id){
    $.ajax({
        url: "/my-account/message/"+ RECEIVER.username +"/delete",
        type: "POST",
        dataType: 'json',
        data: {
            room_id: room_id,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        success: function(data) {
            window.location.replace("https://abpoll.com/my-account/message");
        }
    });
}

function send_message(){
    var message_data = get_input_message();
    var message_to_send = htmlDecode(message_data, decode=true);
    var message_display_data = {
        is_sender: true,
        created_on: null,
        message_content: htmlDecode(message_to_send),
        avatar: USER.avatar,
        room_id: RECEIVER.room_id,
    }
    
    if (htmlEncode(message_to_send).replace(/\s+/g,'') !== ""){

        add_chat_messages_to_chat_box(message_display_data);
        clear_input_message();
    
        $.ajax({
            url: "/my-account/message/"+ RECEIVER.username +"/send",
            type: "POST",
            dataType: 'json',
            data: message_display_data,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
            },
            success: function(data) {
                // console.log('done');
            }
        });
    }
}


/****************************/
/*    Retrieve Messages     */
/****************************/

function render_chat_message_element(chat){
    var chat_message = "";
    if(chat.is_sender){
      chat_message = `
      <!-- Single Chat Item -->
      <div class="single-chat-item outgoing">
        <!-- User Avatar -->
        <!-- User Message -->
        <div class="user-message">
          <div class="message-content">
            <div class="single-message">
              <p>${linkParse(convertTextToSafeText(chat.message_content))}</p>
            </div>
            <!-- Options -->
            <div class="dropstart">
              <button class="btn btn-options dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots-vertical"></i></button>
              <ul class="dropdown-menu">
                <li><a href="#"><i class="bi bi-reply"></i>Reply</a></li>
                <li><a href="#"><i class="bi bi-forward"></i>Forward</a></li>
                <li><a href="#"><i class="bi bi-trash"></i>Remove</a></li>
              </ul>
            </div>
          </div>
          ${chat.created_on == null ? `` : `
          <!-- Time and Status -->
          <div class="message-time-status">
            <small class="small sent-time">${moment(chat.created_on).fromNow(no_suffix = false)}</small>
            <div class="sent-status seen"><i class="bi bi-check-lg" aria-hidden="true"></i></div>
          </div>
          `}
        </div>
      </div>
      `;
    }else{
      chat_message = `
      <!-- Single Chat Item -->
      <div class="single-chat-item">
        <!-- User Message -->
        <div class="user-message">
          <div class="message-content">
            <div class="single-message">
              <p>${linkParse(convertTextToSafeText(chat.message_content))}</p>
            </div>
            <!-- Options -->
            <div class="dropstart">
              <button class="btn btn-options dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots-vertical"></i></button>
              <ul class="dropdown-menu">
                <li><a href="#"><i class="bi bi-reply"></i>Reply</a></li>
                <li><a href="#"><i class="bi bi-forward"></i>Forward</a></li>
                <li><a href="#"><i class="bi bi-trash"></i>Remove</a></li>
              </ul>
            </div>
          </div>
          ${chat.created_on == null ? `` : `
          <!-- Time and Status -->
          <div class="message-time-status">
            <small class="small sent-time">${moment(chat.created_on).fromNow(no_suffix = false)}</small>
          </div>
          `}
        </div>
      </div>
      `;
    }
    return chat_message;
}

function render_chat_messages(chats) {
    var chat_messages = "";
    for (var i = 0; i < chats.length; i++) {
        chat_messages += render_chat_message_element(chats[i]);
    }
    return chat_messages;
}

function render_chat_messages_to_chat_box(chats) {
    var chat_messages = render_chat_messages(chats);
    document.getElementsByClassName("add-messages")[0].innerHTML = chat_messages;
    scrollToBottom("chat_messages");
}

function add_chat_messages_to_chat_box(chats) {
    var chat_message = render_chat_message_element(chats);
    document.getElementsByClassName("add-messages")[0].innerHTML += chat_message;
    scrollToBottom("chat_messages");
}

function render_chat_messages_from_server(){
    if (is_receiver){
        $.ajax({
            type: "POST",
            url: '/util/my-account/message/retrieve',
            data: {
                "chat_room_id": RECEIVER.room_id,
            },
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
            },
            success: function(data) {
                // Do something on success
                render_chat_messages_to_chat_box(data);
            },
            error: function(data){
                console.log(data)
                // Do something if report fails
            },
        });
    }
}