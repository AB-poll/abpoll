
$(".comment-reply").each(function () {
  this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
}).on("input", function () {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

function reply_to_comment(comment_id, profile_picture, username){
    var comment_text = $($('.'+comment_id)[1]).val();
    let csrfToken = $('meta[name=csrf-token]').attr('content');

    $.ajax({
        type: "POST",
        url: "/reply_to_question",
        data: {
            "comment_id": comment_id,
            "comment_text": comment_text,
        },
        success: function(data) {
            $('#'+comment_id+' .question-div:first').append("<div id='"+data.reply_id+"' class='mt-3 bg-light rounded'> \
                <div class='d-flex p-3 align-items-center justify-content-between'> \
                    <div class='d-flex'> \
                        <a class='pe-3' href='/u/"+ username +"'> \
                            <img src='"+ profile_picture +"' class='img-fluid lazy avatar avatar-md-sm rounded-circle shadow' alt='img'> \
                        </a> \
                        <div class='flex-1 commentor-detail'> \
                            <h6 class='mb-0'> \
                                <a href='javascript:void(0)' class='text-dark media-heading'> \
                                    "+username+" \
                                </a> \
                            </h6> \
                            <small class='text-muted'>just now</small> \
                        </div> \
                    </div> \
                    <div class='dropdown-dark'> \
                        <button type='button' class='btn h5 p-0 text-muted' data-bs-toggle='dropdown' aria-haspopup='true' aria-expanded='false'> \
                            <i class='mdi ps-2 mdi-dots-horizontal align-middle'></i> \
                        </button> \
                        <div class='dropdown-menu bg-white dropdown-menu-end'> \
                            <a href='javascript:void(0)' onclick='delete_reply(\""+data.reply_id+"\")' class='dropdown-item text-danger'><i class='mdi mdi-delete-outline align-middle'></i> Delete</a> \
                            <a href='javascript:void(0)' class='dropdown-item text-muted'><i class='mdi mdi-close align-middle'></i> close </a> \
                        </div> \
                    </div> \
                </div> \
                <p class='text-dark ps-3 pb-1 mb-1'>"+comment_text+"</p> \
            </div>");

            $($('.'+comment_id)[1]).val('')
            $($('.'+comment_id)[2]).removeClass('d-none');
            $($('.'+comment_id)[0]).addClass('d-none');
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        error: function(data){
          window.location.href=data.responseJSON;
        }
    });

}

function delete_reply(reply_id) {
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    $.ajax({
        type: "POST",
        url: '/comment_webhook/delete-reply',
        data: {
            "reply_id": reply_id,
        },
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        success: function(data) {
            element = "#" + reply_id;
            $(element).addClass("d-none");
        },
        error: function(data){
            window.location.href=data.responseJSON;
        },
    });
}

function toggleReply(comment_class){
    element = $(comment_class);
    $(element[0]).removeClass('d-none');
    $(element[1]).focus();
    $(element[2]).addClass('d-none');
}

function commentReply(comment_id){
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    url_link = ('/u/' + username + '/' + product_id + '/' + comment_id);
    $.ajax({
        type: "POST",
        url: url_link,
        data: {
            "comment_id": comment_id,
        },
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        success: function(data) {
            // console.log('great success');
        },
        error: function(data){
            // console.log('great fail');
            // window.location.href=data.responseJSON;
        },
    });
}

function deleteQuestion(comment_id) {
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    $.ajax({
        type: "POST",
        url: '/delete_question',
        data: {
            "comment_id": comment_id,
        },
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        success: function(data) {
            element = "#" + comment_id;
            $(element).addClass("d-none");
        },
        error: function(data){
            window.location.href=data.responseJSON;
        },
    });
}

function clear_down(comment_id, csrfToken){
    $.ajax({
        type: "POST",
        url: "/down-vote",
        data: {
            "comment_id": comment_id,
            "un_down_vote": "Yes",
        },
        success: function(data) {
            $('#' + comment_id + ' .down-vote svg:first').removeClass('text-danger');
            $('#' + comment_id + ' .down-vote svg:first path:first').attr('d', 'M22,11L12,21L2,11H8V3H16V11H22M12,18L17,13H14V5H10V13H7L12,18Z');
            $('#' + comment_id + ' .vote-count').text(abbreviateNumber(parseInt($('#' + comment_id + ' .vote-count').html()) + 1));
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        error: function(data){
          window.location.href=data.responseJSON;
        }
    });
}

function down_vote(comment_id, csrfToken){
    $.ajax({
        type: "POST",
        url: "/down-vote",
        data: {
            "comment_id": comment_id,
        },
        success: function(data) {
            $('#' + comment_id + ' .down-vote svg:first').addClass('text-danger');
            $('#' + comment_id + ' .down-vote svg:first path:first').attr('d', 'M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z');
            $('#' + comment_id + ' .vote-count').text(abbreviateNumber(parseInt($('#' + comment_id + ' .vote-count').html()) - 1));
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        error: function(data){
          window.location.href=data.responseJSON;
        }
    });
}

function clear_up(comment_id, csrfToken) {
    $.ajax({
        type: "POST",
        url: "/up-vote",
        data: {
            "comment_id": comment_id,
            "un_up_vote": "Yes",
        },
        success: function(data) {
            $('#' + comment_id + ' .up-vote svg:first').removeClass('text-success');
            $('#' + comment_id + ' .up-vote svg:first path:first').attr('d', 'M16,13V21H8V13H2L12,3L22,13H16M7,11H10V19H14V11H17L12,6L7,11Z');
            $('#' + comment_id + ' .vote-count').text(abbreviateNumber(parseInt($('#' + comment_id + ' .vote-count').html()) - 1));
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        error: function(data){
          window.location.href=data.responseJSON;
        }
    });
}

function up_vote(comment_id, csrfToken) {
    $.ajax({
        type: "POST",
        url: "/up-vote",
        data: {
            "comment_id": comment_id,
        },
        success: function(data) {
            $('#' + comment_id + ' .up-vote svg:first').addClass('text-success');
            $('#' + comment_id + ' .up-vote svg:first path:first').attr('d', 'M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z');
            $('#' + comment_id + ' .vote-count').text(abbreviateNumber(parseInt($('#' + comment_id + ' .vote-count').html()) + 1));
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        error: function(data){
          window.location.href=data.responseJSON;
        }
    });
}

function comment_vote(direction, comment_id) {
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    if(direction == 'up'){
        // if the upvote element is not already selected
        if ($('#' + comment_id + ' .up-vote svg:first').hasClass('text-success') == false){
            // if the down vote element is already selected unselect it before selecting the upvote
            if ($('#' + comment_id + ' .down-vote svg:first').hasClass('text-danger') == true){
                clear_down(comment_id, csrfToken)
            }
            up_vote(comment_id, csrfToken)
        }
        // If the upvote comment is already selected unselect it
        else {
            clear_up(comment_id, csrfToken)
        }
    }
    else if(direction == 'down') {
        // if the down vote element is not already selected
        if ($('#' + comment_id + ' .down-vote svg:first').hasClass('text-danger') == false){
            if ($('#' + comment_id + ' .up-vote svg:first').hasClass('text-success') == true){
                clear_up(comment_id, csrfToken)
            }
            down_vote(comment_id, csrfToken)
        }
        // if the down vote element is already selected unselect it
        else {
            clear_down(comment_id, csrfToken)
        }
    }
}