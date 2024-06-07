var current_page = 1
let csrfToken = $('meta[name=csrf-token]').attr('content');

var ajaxRunning = false;
var noMorePosts = false;
var listElm = document.querySelector('#grid');

// load posts from db.
var loadMorePosts = function() {
    ajaxRunning = true;
    $.ajax({
        type: "POST",
        url: "/infinite_scroll_api/page/"+ current_page,
        success: function(data, textStatus, xhr) {
            if (xhr.status === 200) {
                if (data.includes("<!DOCTYPE html>")) {
                    return location.reload();
                };
                for (const element of data) {
                    listElm.insertAdjacentHTML('beforeend', element);
                }
                data = [];
                current_page += 1
                activatePolls();
                activateQuiz();
            };
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        error: function(data){
            noMorePosts = true;
            $( "#loadMore" ).addClass('d-none');
        },
        complete: function() {
            ajaxRunning = false;
        }
    });
}

function onScroll() {
    if (window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight - 200) {
        if (!ajaxRunning && !noMorePosts) {
            loadMorePosts();
        }
    }
}

window.addEventListener("scroll", onScroll);

// Initially load some items.
loadMorePosts();
