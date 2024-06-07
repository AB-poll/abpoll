"use strict"; // Start of use strict

var isMobile = false;
var emojione = true;
var lastTypedTime = new Date(0);
var chat_date = "";
var is_typing = 0;
var audio = new Audio('/audio/chat_sound.mp3');
var can_scroll_up = true;
var can_scroll_down = false;
var chat_search_mode = false;
var room_user_search_mode = false;
var heartbeat_status = 0;
var updated_chats_heartbeat_status = 0;
var current_uppy_zone = '';
var previous_height = '';
var notification_count_status = 1;
let csrfToken = $('meta[name=csrf-token]').attr('content');

var SETTINGS = {
    'typingDelayMilliSe': 1000,
    'enable_codes': false,
    'is_authenticated': true,
    'animate_css': false,
    'display_name_format': 'username',
    'system_timezone_offset': 0,
    'max_message_length': 1000,
    'push_notifications': false,
    'chat_receive_seconds': 2,
    'chat_status_check_seconds': 2,
    'flood_control_time_limit': 200,
    'flood_control_message_limit': 3,
}

var USER = {
    'id': document.getElementById('current_user_data').dataset.username,
    'username': document.getElementById('current_user_data').dataset.username,
    'avatar':  document.getElementById('current_user_data').dataset.avatar,
    'receiver': document.getElementById('current_user_data').dataset.receiver,
}

var last_sent;
var sent_count = getChatCookie('sent_count');
var time_limit = SETTINGS.flood_control_time_limit;
var message_limit = SETTINGS.flood_control_message_limit;


// Auto scroll chats to bottom of div
function scrollToBottom (id) {
   var div = document.getElementById(id);
   div.scrollTop = div.scrollHeight - div.clientHeight;
}
scrollToBottom("chat_messages")

// Play Chat pop sound
function play_chat_sound() {
    audio.play();
}

// Convert html chars
function htmlEncode(input){
    return he.escape(input);
}

// check user is typing
function refreshTypingStatus() {
    if ($('#message_content').data("emojioneArea").getText().length == 0 || new Date().getTime() - lastTypedTime.getTime() > SETTINGS.typingDelayMilliSe) {
        is_typing = 0;
    } else {
        is_typing = 1;
    }
}

function htmlDecode(html, decode=true) {
    if (decode) {
        return he.decode(html);
    }else{
        return html;
    }
}

function setChatCookie(name,value,days=30) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getChatCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


// Convert text links to hyperlinks in chat
function linkParse(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4, replacePattern5;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank"><span class="chat-link"><i class="fa fa-link"></i> $1</span></a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank"><span class="chat-link"><i class="fa fa-link"></i> $2</span></a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1"><span class="chat-link"><i class="fa fa-link"></i> $1</span></a>');

    //Match @ mentions - @Kimali Fernando-659 /@(\w+( \w+)*)-(\d*)/gim
    replacePattern4 = /@(\W*\w+( \W*\w+)*)-(\d*)/gim
    replacedText = replacedText.replace(replacePattern4, '<span class="mention" data-user="$3">@$1</span>');

    // Match # Hash - #gotabaya /#[a-zA-Z0-9_]/gim
    if ( inputText.indexOf('&#x') === -1 ) {
        replacePattern5 = /(#[^`~!@$%^&*\#()\-+=\\|\/\.,<>?\'\":;{}\[\]* ]+)/gim
        replacedText = (replacedText).replace(replacePattern5, '<span class="hashtag">$1</span>');
    }

    return replacedText;
}

// update user last type time
function updateLastTypedTime() {
    lastTypedTime = new Date();
}

// make youtube links as clickable and popup the video player
function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

// new message save
function newMessage(message_data, message_type, decode=true){
    if (last_sent !==  undefined) {
        if(moment(last_sent).add(time_limit, 'seconds') < moment()){
            sent_count = 0;
        }
    }else{
        sent_count = 0;
    }

    if(sent_count == 0){
        last_sent = moment();
    }
    if(message_limit > sent_count){
        if (message_data === undefined) {
            var message_data = htmlEncode($("#message_content").val());
        }
        if (message_type === undefined) {
            var message_type = 1;
        }
        var chat_type = "private";
        if ($('#active_user').val() == ""){
            chat_type = "group";
        }
        var random_id = Math.random();
        if(message_data != ""){
            var msg_obj = {};
            msg_obj['sender_id'] = USER.id;
            msg_obj['status'] = 1;
            msg_obj['type'] = message_type;
            msg_obj['chat_type'] = chat_type;
            msg_obj['avatar'] = USER.avatar;
            msg_obj['user_type'] = "{{USER.user_type}}";
            msg_obj['message'] = message_data;
            msg_obj['random_id'] = random_id;
            msg_obj['id'] = "";
            msg_obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss');
            if (message_data != "") {
                createMessage(msg_obj, false, true, decode);
                $('#message_content').val(null);
                $('.emojionearea-editor').empty();

                if (message_type==7) {
                    GreenAudioPlayer.init({
                        selector: '.cn-player',
                        stopOthersOnPlay: true,
                    });
                }else if(message_type==10){
                    if(SETTINGS.enable_codes){
                        Prism.highlightAll();
                    }
                }else if(message_type==8){
                    if(JSON.parse(message_data)['new_message']['new_type'] == 10){
                        if(SETTINGS.enable_codes){
                            Prism.highlightAll();
                        }
                    }
                }

            }

            var active_user = $("#active_user").val();
            var active_group = $("#active_group").val();
            var active_room = $("#active_room").val();
            var chat_meta_id = $("#chat_meta_id").val();
            if (active_user) {
                active_group = null;
            }
            $.ajax({
                url: "/my-account/message/"+ USER.receiver +"/send",
                type: "POST",
                dataType: 'json',
                data: {
                    active_user: active_user,
                    active_group: active_group,
                    active_room: active_room,
                    chat_meta_id: chat_meta_id,
                    message_content: message_data,
                    message_type: message_type,
                    random_id: random_id,
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-CSRFToken', csrfToken);
                },
                success: function(data) {
                    var message_to_append = '<li class="chat-right"><div class="d-inline-block"><div class="d-flex chat-type mb-3"><div class="position-relative chat-user-image"><img src="'+USER.avatar+'" class="avatar avatar-md-sm rounded-circle border shadow" alt=""></div><div class="chat-msg" style="max-width: 500px;"><p class="text-muted small msg px-3 py-2 bg-light rounded mb-1">'+ message_data +'</p><small class="text-muted msg-time"><i class="uil uil-clock-nine me-1"></i>a few seconds ago</small></div></div></div></li>'
                    document.getElementsByClassName('add-messages')[0].innerHTML += message_to_append;
                    scrollToBottom("chat_messages");
                }
            });
        }
        sent_count++;
    }else{
        toastr.error(
            "{{_('Hey, Slow down!')}}", '',
            {
                timeOut: 1500,
                fadeOut: 1500,
            }
        );
    }

	setChatCookie('sent_count', sent_count);

}

$(".emojionearea").emojioneArea({
    standalone: true
});

// message create and append to the chat container
function createMessage(obj, direction="down", save_message=false, decode=true){
    var sender_div = "";
    var is_group = "";
    var msg_delete_btn = "";
    var sent_animation = '';
    var replies_animation = '';
    var active_room_created_by = $('#active_room_created_by').val();
    var is_mod = $('#is_mod').val();
    var msg_reply_btn = ``;
    var deleted = "";
    var msg_report_btn = true;
    var is_view_as = "{{VIEW_AS}}";
    var start_chat = false;
    if (SETTINGS.animate_css){
     sent_animation = ' animate__animated {{ SETTINGS.sent_animation }} ';
     replies_animation = ' animate__animated {{ SETTINGS.replies_animation }}';
    }
    if (obj.sender_id == USER.id) {
        var message_class_name = "sent" + sent_animation;
        var msg_status = '<i class="fa fa-check-double"></i>';
        var msg_status_class = '';
        if (obj.status == 2) {
            msg_status_class = 'read';
        }
        if (obj.status != 3) {
            msg_delete_btn = `<i class="fa fa-trash-alt message-delete" data-chat-type="`+obj.chat_type+`" title="{{_('Delete')}}"></i>`;
        }

        if (SETTINGS.display_name_format == 'username') {
        	var display_name = '{{ USER.user_name }}';
        }else{
        	var display_name = '{{ USER.first_name }}';
        }
    }else{
        var message_class_name = "replies" + replies_animation;
        var msg_status = '';
        var msg_status_class = '';
        if (SETTINGS.display_name_format == 'username') {
        	var display_name = obj.user_name;
        }else{
        	var display_name = obj.first_name + ' ' + obj.last_name;
        }
        if(obj.chat_type == "group"){
            start_chat = true;
            is_group = "grp";
            sender_div = "<small class='sender-name' data-user-id='"+obj.sender_id+"'>"+display_name +" </small>";
        }

        //check delete access
        var delete_access = false;
        if(USER.user_type == 1){
            delete_access = true;
        }else if(USER.user_type == 4 && obj.user_type != 1){
            delete_access = true;
        }else if(USER.id == active_room_created_by && (obj.user_type != 1 && obj.user_type != 4)){
            delete_access = true;
        }else if(is_mod == 1 && (obj.user_type != 1 && obj.user_type != 4 && obj.sender_id != active_room_created_by)){
            delete_access = true;
        }else if(is_view_as != ""){
            delete_access = true;
        }

        if (delete_access && obj.status != 3){
            msg_delete_btn = `<i class="fa fa-trash-alt message-delete" data-chat-type="`+obj.chat_type+`" title="{{_('Delete')}}"></i>`;
        }
    }

    if(!obj.random_id){
        obj.random_id = "";
    }

    var img_src = USER.avatar;

    var msg = "";

    if(obj.status != 3){
        msg = messageHtml(obj, decode);

        msg_reply_btn = `<i class="fa fa-reply message-reply" data-chat-type="`+obj.chat_type+`" title="{{_('Reply')}}"></i>`;

    }else{
        deleted = "deleted";
        msg_status = "";
        msg = `<div class="chat-txt deleted"><i class="fa fa-ban"></i> {{_('This message was deleted')}}</div>`;
        msg_reply_btn = ``;
    }

    var new_chat_date = moment('Now').format('dddd, MMM D, YYYY');
    var chat_actions = '';
    if(obj.chat_type == 'group'){
        var joined_room = $('#joined_room').val();
    }else{
        var joined_room = true;
    }

    if (SETTINGS.is_authenticated == true && joined_room == true) {
        chat_actions = `<div class="chat-actions">
                            <div class="btn-group show-actions "
                                data-delete="`+ (msg_delete_btn ? true : false) + `"
                                data-reply="` + (msg_reply_btn ? true : false) + `"
                                data-report="` + (msg_report_btn ? true : false) +  `"
                                data-start-chat="` + start_chat + `"
                                data-chat-type="`+ obj.chat_type + `"
                                data-id="` + obj.id + `" >
                                <i class="fas fa-ellipsis-v " data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ></i>
                                <div class="dropdown-menu "></div>
                            </div>
                        </div>`;
    }
    var msg_content = `<li class="cht `+message_class_name+`" id="`+obj.id+`" data-random-id="`+obj.random_id+`" data-msg-type="`+obj.type+`" data-date="`+new_chat_date+`">
                            <img class="avatar " src="`+img_src+`"  />
                            <div class="message-data `+is_group+`">
                                `+sender_div+`
                                <div class="message-html">`+ msg +`</div>
                            </div>
                           `+chat_actions+`
                            <span class="message-meta">
                                <span class="message-time">`+ moment('Now').format('hh:mm A') +`</span>
                                <span class="message-status `+msg_status_class+`">`+ msg_status +`</span>
                            </span>
                        </li>`;

    if(direction=='up'){
        $(msg_content).prependTo($('.messages ul'));
    }else{
        $(msg_content).appendTo($('.messages ul'));
    }
    $(".messages  ul").find(`[data-printed-date='`+new_chat_date+`']`).remove();
    $(".messages  ul").find(`[data-date='`+new_chat_date+`']:first`).before(`<li class="new-date" data-printed-date="`+new_chat_date+`"><p>`+new_chat_date+`</p></li>`);

    var scrolled_size = $('.chat-scroll')[0].scrollHeight - $('.chat-scroll').scrollTop() - $('.chat-scroll').height();

    if(save_message){
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    }else if (direction=='up') {
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight - previous_height);
    }else if(direction=='down'){
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    }else if(direction=='none'){
        // no scroll
    }else if(scrolled_size < 350){
        $('.chat-scroll').scrollTop($('.chat-scroll')[0].scrollHeight);
    }
    chat_date = new_chat_date;
    if(isMobile==false){
        $('#message_content').data("emojioneArea").editor.focus();
    }
}


function messageHtml(obj, decode=true){
    var msg = "";
    if(obj.type == 1){
//        msg = (window.emojione.shortnameToImage(linkParse(htmlDecode(obj.message, decode))));
        msg = linkParse(htmlDecode(obj.message, decode));
        msg = `<div class="chat-txt">`+msg+`</div>`;
    }else if(obj.type == 2){
        var images = JSON.parse(obj.message);
        if (images.length > 2) {
            msg = `<div class="chat-img-grp chat-gallery" data-pswp-uid="1">`;
            var n = 1;
            var more_overlay = "";
            var each_img = "";
            $.each(JSON.parse(obj.message), function(img_idx, img_obj) {
                var image_size_str = img_obj.split('_');
                var image_size = "600x600";
                if (image_size_str[1] !== undefined) {
                    image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                }
                if (n > 3) {
                    var cls = "chat-img d-none";
                }else if (n == 3) {
                    if (images.length - 2 != 1)  {
                        var cls = "chat-img more";
                        more_overlay = `<span class="more-ovrlay">+`+(images.length - 3).toString()+`</span>`;
                    }else{
                        var cls = "chat-img";
                    }
                }else{
                    var cls = "chat-img";
                }
                each_img = `<figure class="`+cls+`">
                                <a href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                    <img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" />
                                    `+more_overlay+`
                                </a>
                            </figure>`;
                msg = msg + each_img;
                n++;
            });
            msg = msg + "</div>";
        }else if (images.length == 2) {
            msg = `<div class="chat-img-duo chat-gallery" data-pswp-uid="1"">`;
            $.each(JSON.parse(obj.message), function(img_idx, img_obj) {
                var image_size_str = img_obj.split('_');
                var image_size = "600x600";
                if (image_size_str[1] !== undefined) {
                    image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                }
                each_img = `<figure >
                                <a href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                    <img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" />
                                </a>
                            </figure>`;
                msg = msg + each_img;
            });
            msg = msg + "</div>";
        }else{
            msg = `<div class="chat-img-sgl chat-gallery" data-pswp-uid="1"">`;
            $.each(JSON.parse(obj.message), function(img_idx, img_obj) {
                var image_size_str = img_obj.split('_');
                var image_size = "600x600";
                if (image_size_str[1] !== undefined) {
                    image_size = image_size_str[1].substring(0, image_size_str[1].indexOf("."))
                }
                var image_size_px = image_size.split('x');
                if(image_size_px[0] >= 150){
                    var thumb_width = '150px';
                }else{
                    var thumb_width = image_size_px[0]+'px';
                }
                if(image_size_px[1] >= 150){
                    var thumb_height = '150px';
                }else{
                    var thumb_height = image_size_px[0]+'px';
                }
                each_img = `<figure>
                                <a href="{{MEDIA_URL}}/chats/images/large/`+img_obj+`" data-size="`+image_size+`">
                                    <img width="`+thumb_width+`" height="`+thumb_height+`" class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/chats/images/thumb/`+img_obj+`" src="" />
                                </a>
                            </figure>`;
                msg = msg + each_img;
            });
            msg = msg + "</div>";
        }

    }else if(obj.type == 3){
        msg = `<div class="chat-gif"> <img class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="`+obj.message+`" /> </div>`;
    }else if (obj.type == 4){
        msg = `<div class="chat-sticker"> <img  class="lazy" src="{{STATIC_URL}}/img/loading.gif" data-src="{{MEDIA_URL}}/stickers/`+encodeURI(obj.message)+`" /> </div>`;
    }else if(obj.type == 5){
        var json_msg = JSON.parse(obj.message);

//        var original_msg = (window.emojione.shortnameToImage(linkParse(htmlDecode(json_msg.message))));
        var original_msg = linkParse(htmlDecode(json_msg.message));
        msg =`<div class="chat-txt">`+original_msg+`</div>`;
        msg =  msg + getLinkPreview(json_msg);
    }else if(obj.type == 6){
        $.each(JSON.parse(obj.message), function(file_idx, file_obj) {
            try {
                var file_name  = file_obj.name.split('.')[0]+'.'+file_obj.extenstion;
            } catch (error) {
                var file_name  = file_obj.name;
            }
            var file_icon = getFileIcon(file_obj.extenstion, 'file-icon');
            var each_file = `<div class="chat-files-block">
                <div class="file-section">
                    <a href="javascript:void(0)" class="file-header">
                        `+file_icon+`
                        <div class="file-description">
                            <span class="file-title" dir="auto">`+file_name+`</span>
                            <div class="file-meta">
                                <div class="file-meta-entry">
                                    <div class="file-meta-swap">`+file_obj.size+` `+file_obj.extenstion+` {{_('file')}}</div>
                                </div>
                            </div>
                        </div>

                    </a>
                    <div class="file-actions">
                        <a href="{{MEDIA_URL}}/chats/files/`+file_obj.name+`" download="`+file_name+`" class="file-action-buttons">
                            <i class="fas fa-download file-download-icon"  aria-hidden="true"></i>
                        </a>
                    </div>

                </div>
            </div>`;
            msg = msg + each_file;
        });

    }else if(obj.type == 7){
        var json_msg = JSON.parse(obj.message);
        msg =
           `<div class="chat-audio">
                <i class="fa fa-microphone-alt audio-icon"></i>
                <div class="cn-player">
                    <audio crossorigin>
                        <source src="{{MEDIA_URL}}/chats/audio/`+json_msg.name+`" type="audio/mpeg">
                    </audio>
                </div>
            </div>`;
    }else if(obj.type == 8){
        var json_msg = JSON.parse(obj.message);
        var msg_obj = {};
        msg_obj['type'] = json_msg.new_message.new_type;
        if(json_msg.new_message.new_type == 5 || json_msg.new_message.new_type == 10){
            msg_obj['message'] = JSON.stringify(json_msg.new_message.new_content);
        }else{
            msg_obj['message'] = json_msg.new_message.new_content;
        }

        msg_obj['id'] = "";
        var new_msg = messageHtml(msg_obj, decode);

        var replied_data = JSON.parse(repliedMessage(json_msg.reply_message.reply_content, json_msg.reply_message.reply_type));

        var current_message = replied_data['current_message'];
        var current_preview = replied_data['current_preview'];

        if(json_msg.reply_message.reply_from_id == USER.id){
            var replied_to = "{{_('Your chat')}}";
        }else{
            var replied_to = json_msg.reply_message.reply_from + "'s {{_('chat')}}";
        }
        var reply_msg = `<div class="replied-to" data-chat-id="`+json_msg.reply_message.reply_id+`">
            <span class="replied-border"></span>
            <div class="replied-content">
                <div class="replied-content-data">
                    <div class="replied-user" >`+replied_to+`</div>
                    <div class="replied-html">
                        `+ htmlDecode(current_message)+`
                    </div>
                </div>
            </div>
            <div class="replied-preview">
                `+current_preview+`
            </div>
        </div>`;

        msg = `<div class="chat-replied-bubble">`+ reply_msg + new_msg + `</div>`;
    }else if(obj.type == 9){
        var json_msg = JSON.parse(obj.message);
        var msg_obj = {};
        msg_obj['type'] = json_msg.type;
        if(json_msg.type == 10){
            msg_obj['message'] = JSON.stringify(json_msg.message);
        }else{
            msg_obj['message'] = json_msg.message;
        }

        var new_msg = messageHtml(msg_obj);
    }else if(obj.type == 10){

        try {
            var json_msg = JSON.parse(obj.message);
            msg = '<div class="chat-code line-numbers"><pre class="language-'+json_msg['lang']+'">' +
            '<code>'+json_msg['code']+'</code></pre><div class="code-caption"><div class="code-lang">'+json_msg['lang']+'</div><div class="code-title">'+json_msg['caption']+'</div></div></div>';
        } catch (error) {
            console.log(error);
            msg = '<div class="chat-code">#FAILED</div>';
        }

    }

    return msg;
}

// Functions to run when document is ready
$( document ).ready(function() {
    var url = new URL(window.location.href);
    var view_as = url.searchParams.get("view-as");
    if(view_as){
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            if(options.url.includes("?")){
                options.url = options.url + '&view-as='+view_as;
            }else{
                options.url = options.url + '?view-as='+view_as;
            }
        });
    }

    var view_chat = url.searchParams.get("view-chat");
    var view_chat_with = url.searchParams.get("chat-with");

//    // loader display when message loading
//    loading(".messages ","show");

    var active_user = "";
    var active_group = $("#active_group").val();
    var active_room = $("#active_room").val();

    $('a.list-section, .mobile-sidebar-toggle').on('shown.bs.tab', function (e) {
        localStorage.setItem('activeTab', $(e.target).attr('href'));
    });

    var activeTab = localStorage.getItem('activeTab');
    if(activeTab){
        $('.nav-pills a[href="' + activeTab + '"]').tab('show');
    }

    //Init lazy Load
    $(function() {
        $('.lazy').Lazy();
    });

    $(function () {
        $('[data-toggle="popover"]').popover()
    });

    // click link on chat message
    $(document).on('click', '.chat-link-block a', function(e) {
        var clicked_link = $(this).attr('href');
        var code = $(this).attr('data-code');
        var a = document.createElement('a');
        a.href = clicked_link;
        var hostname = a.hostname;
        if (hostname == 'www.youtube.com' || hostname == 'youtube.com' || hostname == 'youtu.be') {
            var videoid = youtube_parser(clicked_link);
            if(videoid) {
                e.preventDefault();
                var embedlink = "https://www.youtube.com/embed/" + videoid + '?autoplay=1';
                $("#video-iframe").attr('src', embedlink);
                $("#video-modal").modal();
            }
        }else if(code){
            e.preventDefault();
            $('#video-embed-content').html(urldecode(code));
            $("#video-modal-2").modal();
        }

    });

     // video modal hide function
     $("#video-modal-2").on('hide.bs.modal', function(){
        $('#video-embed-content').empty();
     });

    // video modal hide function
    $("#video-modal").on('hide.bs.modal', function(){
       $("#video-iframe").attr('src', "{{STATIC_URL}}/img/loading-video.gif");
    });

    // favourite or unfavourite the selected chat user
    $(document).on('click', '.active-user-favourite', function(e) {
        var current_status = $(this).attr("data-is-favourite");
        changeActiveUserRestriction('is_favourite', current_status);
    });

    // block or unblock the selected chat user
    $(document).on('click', '.active-user-block', function(e) {
        var current_status = $(this).attr("data-is-blocked");
        changeActiveUserRestriction('is_blocked', current_status);
    });

    // mute or unmute the selected chat user
    $(document).on('click', '.active-user-mute', function(e) {
        var current_status = $(this).attr("data-is-muted");
        changeActiveUserRestriction('is_muted', current_status);
    });


    // delete message
    $(document).on('click', '.message-delete', function(e) {
        var message_id = $(this).parent().parent().attr('id');
        var message_id = $(this).closest('.cht').attr('id');
        var chat_type = $(this).data("chat-type");
        $.ajax({
            url: "{{ url('ajax-delete-message') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                message_id: message_id,
                chat_type: chat_type
            },
            beforeSend: function() {
//                loading(".messages","show");
            },
            success: function(data) {
                if(data.success){
                    $('#'+message_id).find('.message-html').html(`<div class="chat-txt deleted"><i class="fa fa-ban"></i> {{_('This message was deleted')}}</div>`);
                    $('#'+message_id).find('.chat-actions').html(``);
                    $('#'+message_id).find('.message-status').html(``);
                }else{
                    toastr.error(
                        data.message, '',
                        {
                            timeOut: 1500,
                            fadeOut: 1500,
                            onHidden: function () {
                                window.location.reload();
                            }
                        }
                    );
                }
            },complete: function(){
//                loading(".messages","hide");
            }

        });
    });

    // reply message
    $(document).on('click', '.message-reply', function(e) {
        var reply_msg_id = $(this).closest('.cht').attr('id');
        var chat_type = $(this).data("chat-type");

        $.ajax({
            url: "{{ url('ajax-get-message') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                chat_id: reply_msg_id,
                chat_type:chat_type
            },
            beforeSend: function() {
//                loading(".messages","show");
            },
            success: function(data) {
                if(data.type == 8){
                    var replied_type = JSON.parse(data.message)['new_message']['new_type'];
                    if(replied_type == 5 || replied_type == 10){
                        var replied_content = JSON.stringify(JSON.parse(data.message)['new_message']['new_content']);
                    }else{
                        var replied_content = JSON.parse(data.message)['new_message']['new_content'];
                    }
                }else if(data.type == 9){
                    var replied_type = JSON.parse(data.message)['type'];
                    if(replied_type == 5 || replied_type == 10){
                        var replied_content = JSON.stringify(JSON.parse(data.message)['message']);
                    }else{
                        var replied_content = JSON.parse(data.message)['message'];
                    }
                }else{
                    var replied_content = data.message;
                    var replied_type = data.type;
                }

                var replied_data = JSON.parse(repliedMessage(replied_content, replied_type));
                var replied_html = replied_data['current_message'];
                var replied_preview = replied_data['current_preview'];

                var replied_to_id = data.sender_id;
                if (SETTINGS.display_name_format == 'username') {
                	var display_name = data.user_name;
                    var replied_to_short = data.user_name;
                }else{
                	var display_name = data.first_name + ' ' + data.last_name;
                    var replied_to_short = data.first_name;
                }
                if(data.sender_id ==  USER.id ){
                    var replied_to = "{{_('Reply to your chat')}}";
                }else{
                    var replied_to = "{{_('Reply to')}} "+ display_name +"'s {{_('chat')}}";
                }

                var reply_data = {};
                reply_data['reply_id'] = reply_msg_id;
                reply_data['reply_content'] = replied_content;
                reply_data['reply_type'] = replied_type;
                reply_data['reply_from'] = replied_to_short;
                reply_data['reply_from_id'] = replied_to_id;
                $('.reply-msg-row').data('reply-content', JSON.stringify(reply_data));

                $('.reply-msg-row .replied-user').html(replied_to);
                $('.reply-msg-row .replied-html').html(htmlDecode(replied_html));
                $('.reply-msg-row .replied-preview').html(replied_preview);


                $('.reply-msg-row').addClass('reply-msg-row-show');
                $('.reply-msg-row').removeClass('reply-msg-row-hide');


            },complete: function(){
//                loading(".messages","hide");
                if(isMobile==false){
                    $('#message_content').data("emojioneArea").editor.focus();
                }
            }

        });
    });

    // close reply message
    $(document).on('click', '.close-reply-msg', function(e) {
        $('.reply-msg-row').addClass('reply-msg-row-hide');
        $('.reply-msg-row').removeClass('reply-msg-row-show');

        $('.reply-msg-row .replied-user').html("");
        $('.reply-msg-row .replied-html').html("");
        $('.reply-msg-row .replied-preview').html("");

        $('.reply-msg-row').data('reply-content', "");
        if(isMobile==false){
            $('#message_content').data("emojioneArea").editor.focus();
        }
    });

    // chat area scroll
    $('.chat-scroll').on('scroll', function() {
        if ($(this).scrollTop() == 0 && can_scroll_up == true){
            previous_height = $(this)[0].scrollHeight;
            console.log("load_more_chats('up')");
            load_more_chats('up');
        }
        if(($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && can_scroll_down == true) {
            console.log("load_more_chats('down')");
            load_more_chats('down');
        }
    });


    // init emoji with chat area
    var emo_dir = 'ltr';
    if($('html').hasClass('rtl')){
        var emo_dir = 'rtl';
    }

    $("#message_content").emojioneArea({
        pickerPosition: "top",
        tonesStyle: "radio",
        inline: true,
        tones: false,
        search: false,
        saveEmojisAs: "shortname", // unicode, shortname, image
        hidePickerOnBlur: true,
        attributes:{
            dir: emo_dir,
        },
        events: {
            keypress: function (editor, event) {
                if (isMobile==false && event.keyCode  == 13) {
                   var content = htmlEncode(this.getText());
                   if(event.shiftKey){
                       event.stopPropagation();
                   } else {
                        event.preventDefault();
                        if (this.getText() != "") {
                            if (content.length < SETTINGS.max_message_length) {
                                if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
                                    var new_msg_data = {}
                                    new_msg_data['new_content'] = content;
                                    new_msg_data['new_type'] = 1;

                                    var msg_data = {};
                                    msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
                                    msg_data['new_message'] = new_msg_data;
                                    $(".close-reply-msg").trigger("click");
                                    newMessage(JSON.stringify(msg_data), 8, false);

                                }else{
                                    newMessage(content, 1, false);
                                }
                            }else{
                                alert("{{_('Sorry, Your message is too long!')}}")
                            }
                        }
                   }
                }
                updateLastTypedTime();
            },
            click: function (editor, event) {
                if ($(window).width() < 425) {
                   $( ".buttons-showhide" ).trigger( "click" );
                }
            },
            blur: function (editor, event) {
                refreshTypingStatus();
                if ($(window).width() < 425) {
                   $( ".buttons-showhide" ).trigger( "click" );
                }
            },
            ready: function (editor, event) {
                if ($('#active_user').val() != "") {
                    var load_chat_user = $('#active_user').val();
                }else{
                    var load_chat_user = active_user;
                }
                if(view_chat){
                    var chat_id = view_chat;
                    if(view_chat_with){
                        var load_chat_user = view_chat_with;
                    }

                    chat_search_mode = true;
                }else{
                    var chat_id = false;
                }
//                loadChats(load_chat_user, active_group, active_room, chat_id);
                if(isMobile==false){
                    this.setFocus();
                }
            }
        }
    });

    // change user status
    $(document).on('click', '.change-status', function(e) {
        var icon_class = $(this).find('i').attr("class");
        icon_class = icon_class.replace('fa-fw mr-2','');
        $('.current-status > i').removeClass().addClass(icon_class);
        var new_status = $(this).attr("data-status");
        $.ajax({
            url: "{{ url('ajax-change-user-status') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                new_status: new_status,
            }
        });

    });

    // Send message
    $(document).on('click', '.btn-send', function(e) {
        var content_el = $('#message_content').data("emojioneArea");
        var content = htmlEncode(content_el.getText());
        if(e.shiftKey){
            e.stopPropagation();
        } else {
             e.preventDefault();
             if (content_el.getText() != "") {
                 if (content.length < SETTINGS.max_message_length) {

                    if ($('.reply-msg-row').hasClass('reply-msg-row-show')) {
                        var new_msg_data = {}
                        new_msg_data['new_content'] = content;
                        new_msg_data['new_type'] = 1;

                        var msg_data = {};
                        msg_data['reply_message'] = JSON.parse($('.reply-msg-row').data('reply-content'));
                        msg_data['new_message'] = new_msg_data;
                        $(".close-reply-msg").trigger("click");
                        newMessage(JSON.stringify(msg_data), 8, false);

                    }else{
                        newMessage(content, 1, false);
                    }

                    content_el.editor.focus();

                 }else{
                     alert("{{_('Sorry, Your message is too long!')}}");
                 }
             }
        }
    });

    if (SETTINGS.push_notifications){
        if (SETTINGS.push_provider == 'firebase'){
        //FireBase Init
        var config = {
            'messagingSenderId': '{{SETTINGS.firebase_messaging_sender_id}}',
            'apiKey': '{{SETTINGS.firebase_api_key}}',
            'projectId': '{{SETTINGS.firebase_project_id}}',
            'appId': '{{SETTINGS.firebase_app_id}}',
        };
        firebase.initializeApp(config);
            if('serviceWorker' in navigator) {
                navigator.serviceWorker.register("{{ url('firebase-messaging-sw') }}")
                    .then((registration) => {
                        const messaging = firebase.messaging();
                        messaging.useServiceWorker(registration);
                        messaging
                            .requestPermission()
                            .then(function() {
                                console.log("Notification permission granted.");
                                return messaging.getToken();
                            })
                            .then(function(token) {
                                $.ajax({
                                    url: "{{ url('ajax-update-push-device') }}",
                                    type: "POST",
                                    dataType: 'json',
                                    data: {
                                        csrftoken: '{{ csrf_token_ajax() }}',
                                        token: token,
                                    }
                                });
                            })
                            .catch(function(err) {
                                console.log("Unable to get permission to notify.", err);
                            });

                        messaging.onMessage((payload) => {});
                    });
            }
        }else if (SETTINGS.push_provider == 'pushy'){
            //Init pushy
            Pushy.register({ appId: '{{SETTINGS.pushy_app_id}}' }).then(function (deviceToken) {
                console.log('Pushy device token: ' + deviceToken);
                $.ajax({
                    url: "{{ url('ajax-update-push-device') }}",
                    type: "POST",
                    dataType: 'json',
                    data: {
                        csrftoken: '{{ csrf_token_ajax() }}',
                        token: deviceToken,
                    }
                });
            }).catch(function (err) {
                // Handle registration errors
                console.log("Unable to get permission to notify.", err);
            });
        }
    }


    $(document).on('show.bs.dropdown', '.show-actions', function () {
        var ddmenu = $(this).find('.dropdown-menu');
        var ddhtml = ``;
        var chat_type = $(this).data('chat-type');
        if ($(this).data('delete') == true) {
            ddhtml += `<a class="dropdown-item message-delete" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-trash"></i> {{_('Delete')}}</a>`;
        }
        if ($(this).data('reply') == true) {
            ddhtml += `<a class="dropdown-item message-reply" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-reply"></i> {{_('Reply')}}</a>`;
        }
        if ($(this).data('start-chat') == true) {
            ddhtml += `<a class="dropdown-item message-start-chat" data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-comments"></i> {{_('Start Chat')}}</a>`;
        }
        if ($(this).data('report') == true) {
            var chat_id = $(this).data('id');
            ddhtml += `<a class="dropdown-item init-report" data-report-header="Chat id - `+chat_id+`" data-report-for="`+chat_id+`" data-report-type='1' data-chat-type="` + chat_type + `" href="javascript:void(0)"><i class="fas fa-flag"></i> {{_('Report')}}</a>`;
        }

        ddmenu.html(ddhtml);
        $(this).parent().addClass('active');
    });

    $(document).on('hidden.bs.dropdown', '.show-actions', function () {
        $(this).parent().removeClass('active');
    });

    $(document).on("click", ".init-report", function() {
        if (SETTINGS.is_authenticated == true) {
            var report_type = $(this).attr('data-report-type');
            var report_header = $(this).attr('data-report-header');
            var report_for = $(this).attr('data-report-for');
            var chat_type = $(this).attr('data-chat-type');
            if(chat_type == "group"){
                chat_type = 2;
            }else if(chat_type == "private"){
                chat_type = 1;
            }else{
                chat_type = 0;
            }
            $("#report_reason").empty();
            $("#report_comment").val("");
            $('#modalReportTitle').html("Report");
            $('#report_for').val("");
            $('#report_type').val("");
            $('#chat_type').val("");
            $.ajax({
                url: "{{ url('ajax-get-report-reasons') }}",
                type: "POST",
                dataType: 'json',
                data: {
                    csrftoken: '{{ csrf_token_ajax() }}',
                    report_type: report_type
                },
                beforeSend: function() {
//                    loading(".report-reasons","show");
                },
                success: function(data) {

                    $.each(data, function (i, item) {
                        var option = new Option();
                        $(option).html(item.title);
                        $(option).val(item.id);
                        $("#report_reason").append(option);
                    });
                    $('#modalReportTitle').html("Report : "+ report_header);
                    $('#report_for').val(report_for);
                    $('#report_type').val(report_type);
                    $('#chat_type').val(chat_type);
                    $('.report-modal').modal('show');
                },
                complete: function(){
//                    loading(".report-reasons","hide");
                }
            });
        }else{
            showAuthModal();
        }
    });


    $(document).on("click", ".submit-report", function() {
        var report_type = $("#report_type").val();
        var report_for = $("#report_for").val();
        var report_reason = $("#report_reason").val();
        var report_comment = $("#report_comment").val();
        var chat_type = $("#chat_type").val();
        $.ajax({
            url: "{{ url('ajax-submit-report') }}",
            type: "POST",
            dataType: 'json',
            data: {
                csrftoken: '{{ csrf_token_ajax() }}',
                report_type: report_type,
                report_for: report_for,
                report_reason: report_reason,
                report_comment: report_comment,
                chat_type: chat_type,
            },
            beforeSend: function() {
//                loading(".submit-report","show");
            },
            success: function(data) {
                toastr.success(
                    "{{_('Your report has been received')}}", '',
                    {
                        timeOut: 1500,
                        fadeOut: 1500,
                    }
                );
            },
            complete: function(){
                $('.report-modal').modal('hide');
//                loading(".submit-report","hide");
            }
        });
    });


});
// Doc ready end

// Heart Beat Functions
//$( document ).ready(function() {
//    // Main chat heartbeat
//    window.setInterval(function(){
//        var chat_access = true;
//        if(chat_search_mode==false){
//            if(heartbeat_status == 1){
//                var active_user = $("#active_user").val();
//                var active_group = $("#active_group").val();
//                var active_room = $("#active_room").val();
//                var last_chat_id = $("#last_chat_id").val();
//                var chat_meta_id = $("#chat_meta_id").val();
//                $.ajax({
//                    url: "{{ url('ajax-heartbeat') }}",
//                    type: "POST",
//                    dataType: 'json',
//                    data: {
//                        csrftoken: '{{ csrf_token_ajax() }}',
//                        active_group: active_group,
//                        active_room: active_room,
//                        active_user: active_user,
//                        last_chat_id: last_chat_id,
//                        chat_meta_id: chat_meta_id,
//                        is_typing: is_typing,
//                    },
//                    beforeSend: function() {
//                        heartbeat_status = 0; //working
//                    },
//                    success: function(data) {
//                        if(data.typing_user){
//                            $('.is-typing').show();
//                            $('.is-typing span').html(data.typing_user);
//                        }else{
//                            $('.is-typing').hide();
//                            $('.is-typing span').html("");
//                        }
//                        if (data.chats) {
//                            $.each(data.chats, function( index, obj ) {
//                                createMessage(obj,"");
//                                $("#last_chat_id").val(obj.id);
//                                if(!data.is_muted){
//                                    play_chat_sound();
//                                }
//                                if(obj.type == 10){
//                                    if(SETTINGS.enable_codes){
//                                        Prism.highlightAll();
//                                    }
//                                }
//                            });
//                        }
//
//                        if (data.unnotified_chats) {
//                            $.each(data.unnotified_chats, function( index, obj ) {
//                                var avatar_src = getUserAvatar(obj, obj.display_name);
//                                toastr.success(
//                                    '<div class="toast-avatar"><img src="'+avatar_src+'"></div>' +
//                                    '<div class="toast-brief">'+message_small_preview(obj.message, obj.type)+'</div>',
//                                    obj.display_name,
//                                    {
//                                        escapeHtml: false,
//                                        timeOut: 1500,
//                                        fadeOut: 1500,
//                                        tapToDismiss: false,
//                                        toastClass: "message-toast",
//                                        iconClass: 'message-icon',
//                                        showMethod: "slideDown",
//                                    }
//                                );
//                                // if(!data.is_muted){
//                                    play_chat_sound();
//                                // }
//                            });
//                        }
//
//
//                        if(data.chat_access.available_status == 2){
//                            restrictTypingArea(1, "{{_('User is deactivated')}}");
//                        }else if(data.chat_access.blocked_by_you){
//                            restrictTypingArea(data.chat_access.blocked_by_you, "{{_('Blocked by you')}}");
//                        }else if (data.chat_access.blocked_by_him) {
//                            restrictTypingArea(data.chat_access.blocked_by_him, "{{_('Blocked by user')}}");
//                        }else if ("room_access" in data.chat_access && data.chat_access.room_access == false){
//                            chat_access = false;
//                            toastr.error(
//                                "{{_('Access has been revoked')}}", '',
//                                {
//                                    timeOut: 1500,
//                                    fadeOut: 1500,
//                                    onHidden: function () {
//                                        window.location.href = "{{ url('index') }}";
//                                    }
//                                }
//                            );
//
//                        }else if ("user_deleted" in data.chat_access && data.chat_access.user_deleted == true){
//                            chat_access = false;
//                            toastr.error(
//                                "{{_('Your account has been deleted')}}", '',
//                                {
//                                    timeOut: 1500,
//                                    fadeOut: 1500,
//                                    onHidden: function () {
//                                        window.location.href = "{{ url('logout') }}";
//                                    }
//                                }
//                            );
//
//                        }else{
//                            restrictTypingArea(0, '');
//                        }
//
//                        if(data.chat_access.blocked_by_you){
//                            $('.active-user-block .icon').html('<i class="fas fa-ban"></i>');
//                            $('.active-user-block').attr('title', "{{_('Unblock')}}");
//                        }else{
//                            $('.active-user-block .icon').html('<i class="far fa-circle"></i>');
//                            $('.active-user-block').attr('title', "{{_('Block')}}");
//                        }
//                    },
//                    complete: function(){
//                        lazyLoad();
//                        GreenAudioPlayer.init({
//                            selector: '.cn-player',
//                            stopOthersOnPlay: true,
//                        });
//                        if(chat_access){
//                            heartbeat_status = 1; //complete
//                        }
//
//                    }
//                });
//            }
//        }
//    }, SETTINGS.chat_receive_seconds);
//
//
//    // Message read status heartbeat
//    window.setInterval(function(){
//        if(updated_chats_heartbeat_status == 1){
//            var active_user = $("#active_user").val();
//            var active_group = $("#active_group").val();
//            var active_room = $("#active_room").val();
//            var last_updated_chat_time = $("#last_updated_chat_time").val();
//            $.ajax({
//                url: "{{ url('ajax-updated-chats') }}",
//                type: "POST",
//                dataType: 'json',
//                data: {
//                    csrftoken: '{{ csrf_token_ajax() }}',
//                    active_group: active_group,
//                    active_room: active_room,
//                    active_user: active_user,
//                    last_updated_chat_time: last_updated_chat_time,
//                },
//                beforeSend: function() {
//                    updated_chats_heartbeat_status = 0; //working
//                },
//                success: function(data) {
//                    if (data.updated_chats.length > 0) {
//                        $.each(data.updated_chats, function( index, obj ) {
//                            var updated_li = $(".messages ul").find("li[id="+ obj.id +"]");
//                            if (obj.status == 2) {
//                                $(updated_li).find('.message-status').addClass('read');
//                            }else if (obj.status == 3) {
//                                $(updated_li).find('.message-html').html(`<div class="chat-txt deleted"><i class="fa fa-ban"></i> This message was deleted</div>`);
//                            }
//                        });
//                        $("#last_updated_chat_time").val(data.updated_chats[0].updated_at);
//                    }
//                },
//                complete: function(){
//                    updated_chats_heartbeat_status = 1; //complete
//                }
//            });
//        }
//    }, SETTINGS.chat_status_check_seconds);
//
//
//    setInterval(refreshTypingStatus, 1000);
//
//    $('#selected-lang-toggle').html($('.selected-lang').html());
//
//});

