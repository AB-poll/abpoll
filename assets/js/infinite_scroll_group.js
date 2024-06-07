var current_page = 1
let csrfToken = $('meta[name=csrf-token]').attr('content');

var ajaxRunning = false;
var noMorePosts = false;
var listElm = document.querySelector('#grid');

function urlPath(current_page){
    var path = window.location.pathname;
    var args = window.location.search;
    var pathNoArgs = path.slice(0, args.index);

    return `${pathNoArgs}/${current_page}`;
}

// load posts from db.
var loadMorePosts = function() {
    ajaxRunning = true;
    $.ajax({
        type: "GET",
        url: urlPath(current_page),
        success: function(data, textStatus, xhr) {
            if (xhr.status === 200) {
                if (data.includes("<!DOCTYPE html>")) {
                    return location.reload();
                };
                for (const element of data) {
                    listElm.insertAdjacentHTML('beforeend', renderPost(element));
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
