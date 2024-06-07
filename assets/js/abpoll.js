/****************************/
/*    Variables              */
/*    Util                   */
/*    Document Ready         */
/*    Auto Scroll            */
/*    Handle Post            */
/*    Notifications          */
/*    Load Right Sidebar     */
/*    Recommend Users        */
/*    Share                  */
/*    Render Post            */
/*    Activate Posts         */
/*    Resize Post            */
/*    Vote                   */
/*    Group JS               */
/*    Comment                */
/*****************************/

/*******************/
/*    Variables    */
/*******************/

var sidebar_loaded = false
var scroll_enabled = false;
var letters = ["a", "b", "c", "d"];
var is_logged_in = ($('meta[name=is_logged_in]').attr('content') === '1')

/*******************/
/*       util      */
/*******************/

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function copyLinkToClipboard(post_link) {
	navigator.clipboard.writeText(post_link)
}

function convertTextToSafeText(inputText){
	try{
		return inputText.replace(/[&<>"']/g, function($0) {
			return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
		});

	} catch (error) {
		console.error(error);
	}
}

function makePercentage(number, total){
	return Math.round((number/total) * 100);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/************************/
/*    Document Ready    */
/************************/

window.addEventListener('load', (event) =>{
	groupsParameterLoad()
	displayCommentDropdown();
	load_right_sidebar();
	activatePolls();
	activateQuiz();
});

document.addEventListener('DOMContentLoaded', (event) => {
	setTimeout(function(){
		trigger_animations();
	}, 1500);
})

/********************/
/*    Auto Scroll   */
/********************/

// if the scroll_enabled is set to false we will not auto scroll to the next post
function auto_scroll_next_post(element){
    try{
        if (scroll_enabled) {
            var parent_element = element.parentElement;
            while(!parent_element.classList.contains('picture-item')){
                parent_element = parent_element.parentElement;
            }
            next_element = parent_element.nextElementSibling;
            setTimeout(function(){
                next_element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                option_buttons = next_element.querySelectorAll(".i-amphtml-story-interactive-option, .i-amphtml-story-poll-option");
                setTimeout(function(){
                    animate_these_buttons(option_buttons);
                }, 1000)
            },1200);
        }
    } catch(e){}
}

/*************************/
/*      Handle Post      */
/*************************/

function deletePost(post_id) {
	let csrfToken = $('meta[name=csrf-token]').attr('content');
	$.ajax({
		type: "POST",
		url: '/delete-post',
		data: {
			"post_id": post_id,
		},
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', csrfToken);
		},
		success: function(data) {
			window.location.href = data.responseJSON;
		},
		error: function(data){
			window.location.href = data.responseJSON;
		},
	});
}

function reportPost(post_id, report_reason){
	let csrfToken = $('meta[name=csrf-token]').attr('content');
	$('#view-post-report-options').addClass('d-none');
	$('#view-post-success').removeClass('d-none');
	$('#view-post-report-toggle').addClass('d-none');

	$.ajax({
		type: "POST",
		url: '/report-poll-api',
		data: {
			"post_id": post_id,
			"report_reason": report_reason,
		},
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', csrfToken);
		},
		error: function(data){
			// Do something if report fails
		},
	});
};

/***************************/
/*      Notifications      */
/***************************/

function load_notifications(){
	// if current user is logged in detect when they press the notification toggle
	$.ajax({
		type: "POST",
		url: "/notifications",
		beforeSend: function(xhr) {
			xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
		},
		success: function(data) {
			var unread_notifications = 0;
			for (let i=0; i < data.length; i++){
				if (i === 0){
					if (data[i]['notification_type'] === "post_comments"){
						document.getElementById('notifications-holder').innerHTML += '<a href="'+data[i]["action_target"]+'" class="dropdown-item features feature-primary key-feature p-0"><div class="d-flex align-items-center"><div class="icon text-center rounded-circle me-2"><i class="uil uil-comment-lines"></i></div><div class="flex-1"><h6 class="mb-0 text-dark title text-truncate" style="width:200px">'+data[i]["body"]+'</h6><small class="text-muted">'+moment(data[i]["timestamp"]).fromNow();+'</small></div></div></a>'
					} else {
						document.getElementById('notifications-holder').innerHTML += '<a href="'+data[i]["action_target"]+'" class="dropdown-item features feature-primary key-feature p-0"><div class="d-flex align-items-center"><div class="icon text-center rounded-circle me-2"><i class="uil uil-message"></i></div><div class="flex-1"><h6 class="mb-0 text-dark title text-truncate" style="width:200px">'+data[i]["body"]+'</h6><small class="text-muted">'+moment(data[i]["timestamp"]).fromNow();+'</small></div></div></a>'
					}
					if (data[i]['read'] === false){
						unread_notifications += 1
					}
				} else {
					if (data[i]['notification_type'] === "post_comments"){
						document.getElementById('notifications-holder').innerHTML += '<a href="'+data[i]["action_target"]+'" class="dropdown-item features feature-primary key-feature p-0 mt-3"><div class="d-flex align-items-center"><div class="icon text-center rounded-circle me-2"><i class="uil uil-comment-lines"></i></div><div class="flex-1"><h6 class="mb-0 text-dark title text-truncate" style="width:200px">'+data[i]["body"]+'</h6><small class="text-muted">'+moment(data[i]["timestamp"]).fromNow();+'</small></div></div></a>'
					} else {
						document.getElementById('notifications-holder').innerHTML += '<a href="'+data[i]["action_target"]+'" class="dropdown-item features feature-primary key-feature p-0 mt-3"><div class="d-flex align-items-center"><div class="icon text-center rounded-circle me-2"><i class="uil uil-message"></i></div><div class="flex-1"><h6 class="mb-0 text-dark title text-truncate" style="width:200px">'+data[i]["body"]+'</h6><small class="text-muted">'+moment(data[i]["timestamp"]).fromNow();+'</small></div></div></a>'
					}
					if (data[i]['read'] === false){
						unread_notifications += 1
					}
				}
			}
			if (unread_notifications > 0)  {
				document.getElementById('number_of_unread').innerHTML += '<span class="badge bg-soft-danger rounded-pill">'+ unread_notifications +'</span>'
				document.getElementById('notifications_alert').classList.remove('d-none')
			}
		}
	});
}

/*******************************/
/*     Load Right Sidebar     */
/*******************************/

function load_right_sidebar(){
    if (parseInt($('meta[name=is_logged_in]').attr('content')) === 1){
        if (sidebar_loaded === false){
            load_notifications()

            Notification.requestPermission().then(function (permission) {
                subscribe_user_notification()
            });
            if (document.getElementById('right-sidebar') && sidebar_loaded === false){
                sidebar_recommended_users()
            }
            sidebar_loaded = true
        }
    } else if (parseInt($('meta[name=is_logged_in]').attr('content')) === 0){
        if (document.getElementById('right-sidebar') && sidebar_loaded === false){
            sidebar_recommended_users()
            sidebar_loaded = true
        }
    }
}

/*************************/
/*    Recommend Users    */
/*************************/

function sidebar_recommended_users(){

	$.ajax({
		type: "POST",
		url: '/util/render-recommended-users',
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
		},
		success: function(data){
		    for (i = 0; i < data.length; i++ ){
                var append_to_sidebar = '<div class="d-flex justify-content-between align-items-center"><a href="'+data[i]["url"]+'" class="d-flex my-2"><img src="'+data[i]["profile-picture"]+'" class="avatar avatar-md-sm rounded-circle border shadow" alt=""><div class="ms-3"><h6 class="mb-0 text-dark">'+data[i]["display-username"]+'</h6><p class="text-muted small mb-0">'+data[i]["username"]+'</p></div></a></div>'
                document.getElementById('recommended-user').innerHTML += append_to_sidebar
		    }
		},
	});
}


/*****************/
/*     Share     */
/*****************/

function triggerShare(input_url, input_title, input_description){
	if (navigator.share) {
		navigator.share({
				title: input_title,
				url: input_url,
                text: input_description,
		}).then(() => {
				// console.log('Thanks for sharing!');
			})
		.catch(console.error);
	} else {
		// document.getElementsByClassName('share-button')[1].click();
        var safe_description = convertTextToSafeText(input_description);
		var safe_title = convertTextToSafeText(input_title)
        create_chare_modal(input_url, safe_title, safe_description)
        $("#ShareForm").modal("show");
	}
}

function copy_lick_to_clipboard(url){
    if (url){
        copyLinkToClipboard(url);
    } else {
        copyLinkToClipboard(window.location.href.split(/[?#]/)[0]);
    }
	document.getElementsByClassName('copy-link')[0].classList.remove('btn-light');
	document.getElementsByClassName('copy-link')[0].classList.add('btn-soft-success');
	document.getElementsByClassName('copy-link')[0].innerHTML = '<i class="mdi mdi-check"></i>';
}

function copy_votes_link(){
    $.ajax({
		type: "GET",
		url: "/v1/retrieve/vote-link",
		beforeSend: function(xhr) {
			xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
		},
		success: function(data) {
			triggerShare(data.link, "Here are some of my preferences, and choices ", "")
		},
		error: function(data) {
			console.log("no id assigned");
		}
	});
}

function create_chare_modal(url, title, description){
    var output = `
    <div class="modal fade" id="ShareForm" tabindex="-1" aria-labelledby="EditFormLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded shadow border-0">
                <div class="modal-header px-4 border-0">
                    <h5 class="modal-title">Share</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="shareon targets text-center" data-via="abpoll" data-title="${title}" data-text="${description}" data-url="${url}">
                    <a class="btn btn-pills facebook">
                        <span>Facebook</span>
                    </a>
                    <a class="btn btn-pills twitter">
                        <span>Twitter</span>
                    </a>
                    <a class="btn btn-pills linkedin">
                        <span>LinkedIn</span>
                    </a>
                    <a class="btn btn-pills reddit">
                        <span>Reddit</span>
                    </a>
                </div>
                <div class="share-link d-flex justify-content-between px-4">
                    <div class="share-modal-url">${url}</div>
                    <button onclick="copy_lick_to_clipboard('${url}')" class="copy-link btn btn-light searchbtn">Copy</button>
                </div>
            </div>
        </div>
    </div>`

    if($("#ShareForm")){
        $("#ShareForm").remove()
    }

    $("body").append(output)
    Shareon.init();

}

/********************/
/*    Render Post   */
/********************/

$(function () {
    // page is loaded, it is safe to hide loading animation
    $('#pre-loader').remove();

    $(window).on('beforeunload', function () {
        // user has triggered a navigation, show the loading animation
        $( 'body' ).append( '<i class="pre-loader mdi mdi-loading text-primary mdi-spin h4 mb-0 align-middle"></i>' );
    });
});


function trigger_animations(){
	var buttons = document.querySelectorAll(".i-amphtml-story-interactive-option, .i-amphtml-story-poll-option")

	for (let i = 0; i < buttons.length; i++) {
		setTimeout(function () {
			buttons[i].classList.add("btn-animation");
		}, 400 * i);
	if (i == 6){
		break;
	}
	}
}

function animate_these_buttons(custom_buttons){
  for (let i = 0; i < custom_buttons.length; i++) {
    setTimeout(function () {
      custom_buttons[i].classList.remove("btn-animation");
      custom_buttons[i].classList.add("btn-animation");
    }, 400 * i);
  }
}

function clear_animations(){
  buttons = document.querySelectorAll(".i-amphtml-story-interactive-option, .i-amphtml-story-poll-option")
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("btn-animation");
  }
}

function renderPost(post){
    return `
    <div class="col-12 spacing picture-item pt-0 pb-4">
        <div class="card border-0 work-container position-relative d-block overflow-hidden rounded rounded-0">
            <div class="card-body p-0">
				<a href="${post.url}">
                    <img src="${post.image_1}" class="img-fluid w-100" alt="work-image">
				</a>

                ${post.format == 'Trivia' ?
                `
                <div class="center-interactive ${post.image_2 != null ? 'top-50' : 'top-75'} i-amphtml-element i-amphtml-layout-container i-amphtml-story-interactive-component i-amphtml-built i-amphtml-layout ">
                    <h1 class="amp-poll-title w-100 text-center m-0 fst-normal fs-4 lh-sm fw-bolder">${convertTextToSafeText(post.title)}</h1>
                    ${post.did_user_vote ?
                    `
                    <div id="${post.id}" class="i-amphtml-story-interactive-quiz-container i-amphtml-story-interactive-post-selection i-amphtml-story-interactive-container i-amphtml-story-interactive-has-data">
                        <div class="i-amphtml-story-interactive-quiz-option-container">
                            ${post.options.map((option, index) => `
                            <button data-current="${post.options_vote[index]}" data-option="${letters[index]}" style="--option-percentage:${makePercentage(post.options_vote[index], post.total_votes)}%;" ${index == post.selected_option ? 'correct="correct"' : ''} class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option ${post.voted_index() == index ? 'i-amphtml-story-interactive-option-selected' : ''} "><span class="i-amphtml-story-interactive-quiz-answer-choice">${letters[index].toUpperCase()}</span><span class="i-amphtml-story-interactive-quiz-option-text">${convertTextToSafeText(option)}</span><span class="i-amphtml-story-interactive-quiz-percentage-text">${makePercentage(post.options_vote[index], post.total_votes)}%</span></button>
                            `).join('')}
                        </div>
                    </div>
                    ` :
                    `
                    <div id="${post.id}" class="i-amphtml-story-interactive-quiz-container i-amphtml-story-interactive-container i-amphtml-story-interactive-has-data">
                        <div class="i-amphtml-story-interactive-quiz-option-container">
                            ${post.options.map((option, index) => `
                            <button data-current="${post.options_vote[index]}" data-option="${letters[index]}" ${index == post.selected_option ? 'correct="correct"' : ''} class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option"><span class="i-amphtml-story-interactive-quiz-answer-choice">${letters[index].toUpperCase()}</span><span class="i-amphtml-story-interactive-quiz-option-text">${convertTextToSafeText(option)}</span><span class="i-amphtml-story-interactive-quiz-percentage-text"></span></button>
                            `).join('')}
                        </div>
                    </div>
                    `}
                </div>
                ` :
                `
                <!-- voting mechanism -->
                ${post.did_user_vote ?
                `
                <div class="position-absolute ${post.image_2 == null ? 'top-75' : 'top-50'} start-50 translate-middle w-60">
                    <h1 class="amp-poll-title w-100 text-center m-0 fst-normal fs-4 lh-sm fw-bolder">${post.title}</h1>
                    <div id="${post.id}" class="i-amphtml-story-poll-quad blue-dark i-amphtml-story-poll-responded" data-total="${post.options_vote[0] + post.options_vote[1]}">
                        <span style="--percentage:${makePercentage(post.options_vote[0], post.total_votes)}%;" class="i-amphtml-story-poll-option bg-light mt-2 btn btn-pills btn-vote border-0 ${post.voted_index == 0 ? 'i-amphtml-story-poll-option-selected' : ''}" data-current="${post.options_vote[0]}" data-option="a">
                            <span class="i-amphtml-story-poll-option-title text-truncate">${convertTextToSafeText(post.a_text)}</span>
                            <span class="i-amphtml-story-poll-option-percentage">${makePercentage(post.options_vote[0], post.total_votes)}%</span>
                        </span>
                        <span style="--percentage:${makePercentage(post.options_vote[1], post.total_votes)}%;" class="i-amphtml-story-poll-option bg-light mt-2 btn btn-pills btn-vote border-0 ${post.voted_index == 1 ? 'i-amphtml-story-poll-option-selected' : ''}" data-current="${post.options_vote[1]}" data-option="b">
                            <span class="i-amphtml-story-poll-option-title text-truncate">${convertTextToSafeText(post.b_text)}</span>
                            <span class="i-amphtml-story-poll-option-percentage">${makePercentage(post.options_vote[1], post.total_votes)}%</span>
                        </span>
                    </div>
                </div>
                ` :
                `
                <div class="position-absolute ${post.image_2 == null ? 'top-75' : 'top-50'} w-60 start-50 translate-middle">
                    <h1 class="amp-poll-title w-100 text-center m-0 fst-normal fs-4 lh-sm fw-bolder">${post.title}</h1>
                    <div id="${post.id}" class="${post.status == 'ended' ? 'i-amphtml-story-poll-responded' : ''} i-amphtml-story-poll-quad blue-dark" data-total="${post.options_vote[0] + post.options_vote[1]}">
                        <span style="--percentage:${makePercentage(post.options_vote[0], post.total_votes)}%" class="i-amphtml-story-poll-option bg-light mt-2 btn btn-pills btn-vote border-0 btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote btn btn-pills btn-vote" data-current="${post.options_vote[0]}" data-option="a">
                            <span class="i-amphtml-story-poll-option-title text-truncate">${convertTextToSafeText(post.a_text)}</span>
                            <span class="i-amphtml-story-poll-option-percentage">${post.status == "ended" ? `${makePercentage(post.options_vote[0], post.total_votes)}%` : ''}</span>
                        </span>
                        <span style="--percentage:${makePercentage(post.options_vote[1], post.total_votes)}%" class="i-amphtml-story-poll-option bg-light mt-2 btn btn-pills btn-vote border-0" data-current="${post.options_vote[1]}" data-option="b">
                            <span class="i-amphtml-story-poll-option-title text-truncate">${convertTextToSafeText(post.b_text)}</span>
                            <span class="i-amphtml-story-poll-option-percentage">${post.status == "ended" ? `${makePercentage(post.options_vote[1], post.total_votes)}%` : ''}</span>
                        </span>
                    </div>
                </div>
                `}
                <!-- end Voting mechanism -->
                `}
            </div>
        </div>
        <div class="post-meta d-flex justify-content-between text-muted p-2">
            <ul class="list-unstyled mb-0">
				<li class="list-inline-item me-2 mb-0">
					<i class="uil uil-user"></i> <a href="/u/${post.author.username}"><span class="author text-muted">${post.author.username}</span></a>
				</li>
                <li class="list-inline-item me-2 mb-0">
                    <i class="uil uil-check-circle"></i> <span class="total-votes">${post.options_vote[0] + post.options_vote[1]}</span>
                </li>
                <li class="list-inline-item">
					<a href="javascript:postGetComments('${post.id}', 1)" class="text-muted comments">
						<i class="uil uil-comment"></i> <span id="${post.id}-number" class="total-comments">${post.comments}</span>
					</a>
                </li>
            </ul>
            <a onclick='triggerShare("${post.external_url}", "${convertTextToSafeText(post.title)}", "")' class="text-muted cursor-pointer"><i class="uil uil-share-alt"></i></a>
        </div>
    </div><!--end col-->
    `
}

/*************************/
/*    Activate Posts     */
/*************************/


function activatePolls(){
	var buttons = document.getElementsByClassName("i-amphtml-story-poll-option");
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() {
			var pollNode = this.parentElement;
			selected = pollNode.classList.contains("i-amphtml-story-poll-responded");

			total_votes = parseInt(this.parentElement.dataset.total);
			a_element = this.parentElement.getElementsByClassName("i-amphtml-story-poll-option")[0];
			b_element = this.parentElement.getElementsByClassName("i-amphtml-story-poll-option")[1];

			if (!selected) {
				a_votes = parseInt(a_element.dataset.current);
				b_votes = parseInt(b_element.dataset.current);
				total_votes += 1;

				total_votes_element = a_element.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("total-votes")[0]

				if (total_votes_element){
					a_element.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("total-votes")[0].innerHTML= total_votes;
					auto_scroll_next_post(a_element)
				} else {
					auto_scroll_next_post(a_element)
				}


				if (this.dataset.option === "a"){
					a_votes += 1;
					if (this.parentElement.id){
						saveVote(this.parentElement.id, 'a')
					}
				} else {
					b_votes += 1;
					if (this.parentElement.id){
						saveVote(this.parentElement.id, 'b')
					}
				}

				a_percent = Math.round((a_votes / total_votes) * 100).toString() + "%";
				b_percent = Math.round((b_votes / total_votes) * 100).toString() + "%";

				a_element.getElementsByClassName("i-amphtml-story-poll-option-percentage")[0].innerHTML = a_percent;
				b_element.getElementsByClassName("i-amphtml-story-poll-option-percentage")[0].innerHTML = b_percent;

				a_element.style.setProperty("--percentage", a_percent);
				b_element.style.setProperty("--percentage", b_percent);


				pollNode.classList.add("i-amphtml-story-poll-responded");
				this.classList.add("i-amphtml-story-poll-option-selected");
			}
		});
	}
};

function activateQuiz(){
	var buttons = document.getElementsByClassName("i-amphtml-story-interactive-quiz-option");
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() {
			var pollNode = this.parentElement.parentElement;
			selected = pollNode.classList.contains("i-amphtml-story-interactive-post-selection");

			a_element = this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[0];
			b_element = this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[1];

			if (!selected) {
				a_votes = parseInt(a_element.dataset.current);
				b_votes = parseInt(b_element.dataset.current);
				total_votes = 1 + a_votes + b_votes;

				if (this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[2]){
					c_element = this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[2];
					c_votes = parseInt(c_element.dataset.current);
					total_votes += c_votes
				};

				if (this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[3]){
					d_element = this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[3];
					d_votes = parseInt(d_element.dataset.current);
					total_votes += d_votes;
				};

				if (this.dataset.option === "a"){
					a_votes += 1;
					a_element.classList.add("i-amphtml-story-interactive-option-selected")
				} else if(this.dataset.option === "b"){
					b_votes += 1;
					b_element.classList.add("i-amphtml-story-interactive-option-selected")
				} else if(this.dataset.option === "c"){
					c_votes += 1;
					c_element.classList.add("i-amphtml-story-interactive-option-selected")
				} else {
					d_votes += 1;
					d_element.classList.add("i-amphtml-story-interactive-option-selected")
				}

				a_percent = Math.round((a_votes / total_votes) * 100).toString() + "%";
				a_element.style.setProperty("--option-percentage", a_percent);

				b_percent = Math.round((b_votes / total_votes) * 100).toString() + "%";
				b_element.style.setProperty("--option-percentage", b_percent);

				if (this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[2]){
					c_percent = Math.round((c_votes / total_votes) * 100).toString() + "%";
					c_element.style.setProperty("--option-percentage", c_percent);
				};

				if (this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[3]){
					d_percent = Math.round((d_votes / total_votes) * 100).toString() + "%";
					d_element.style.setProperty("--option-percentage", d_percent);
				};

				if (total_votes !== 1){
					a_element.getElementsByClassName("i-amphtml-story-interactive-quiz-percentage-text")[0].innerHTML = a_percent;
					b_element.getElementsByClassName("i-amphtml-story-interactive-quiz-percentage-text")[0].innerHTML = b_percent;

					if (this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[2]){
						c_element.getElementsByClassName("i-amphtml-story-interactive-quiz-percentage-text")[0].innerHTML = c_percent;
					};

					if (this.parentElement.getElementsByClassName("i-amphtml-story-interactive-quiz-option")[3]){
						d_element.getElementsByClassName("i-amphtml-story-interactive-quiz-percentage-text")[0].innerHTML = d_percent;
					};

				}

				total_votes_element = a_element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("total-votes")[0]

				if (total_votes_element){
					total_votes_element.innerHTML= total_votes;
					auto_scroll_next_post(a_element)
				} else {
					auto_scroll_next_post(a_element)
				}


				pollNode.classList.add("i-amphtml-story-interactive-post-selection");
				if (this.parentElement.parentElement.id){
					saveVote(this.parentElement.parentElement.id, this.dataset.option);
				}

			}
		});
	}
}

/***************/
/*    Vote     */
/***************/


function saveVote(post_id, vote_letter){
	let csrfToken = $('meta[name=csrf-token]').attr('content');
	$.ajax({
		type: "POST",
		url: '/post_answered',
		data: {
			'post_id': post_id,
			'vote_letter': vote_letter,
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader('X-CSRFToken', csrfToken);
		},
		success: function(data) {
			// console.log("success");
			update_balance(data.balance)
		},
		error: function(data) {
			// console.log("not logged in");
		}
	});
}

/*****************/
/*    Group JS   */
/*****************/

var joinGroupId = document.getElementById('join_group_id');

if (joinGroupId){
    joinGroupId.addEventListener('input', function(event) {
        var value = event.target.value;
        // Strip all non-digits from the input
        value = value.replace(/\D/g, '');
        // Trim any leading zeros
        value = value.replace(/^0+/, '');
        // Insert a space after the first 3 digits
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        // Limit to only 7 digits
        value = value.substring(0, 8);
        event.target.value = value;

        // Enable the submit button if there are 7 digits
        if (value.length === 8) {
            document.getElementById('join_group_submit').disabled = false;

        } else {
            document.getElementById('join_group_submit').disabled = true;
            document.getElementById("joinGroupForm-feedback").innerHTML = "";
        }
    });
}

function submitJoinGroupId(){
    var group_id = joinGroupId.value;
    group_id = group_id.replace(/\D/g, '');

    $.ajax({
        type: "POST",
        url: "/groups/join",
        data: {
            "group_id": group_id,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {
            window.location.href = data;
        },
        error: function(data){
            document.getElementById("joinGroupForm-feedback").innerHTML = data.responseJSON;
            document.getElementById("joinGroupForm").classList.add("was-validated")
        }
    });
}

function groupsParameterLoad(){
    var joinGroupInputElement = $("#join_group_id");
    if (joinGroupInputElement){
        var url = window.location.href;
        var join = getParameterByName('join', url);
        if (join) {
            if (isValidJoin(join)) {
                // console.log($("#CreateGroupForm"))
                $("#CreateGroupForm").modal("show");
                var value = join.replace(/(\d{4})(?=\d)/g, '$1 ');
                joinGroupInputElement.val(value);
                document.getElementById('join_group_submit').disabled = false;
            }
        }
    }
}

function isValidJoin(join) {
    if (join.length === 7 && !isNaN(join)) {
        return true;
    }
    return false;
}

/*********************/
/*      Comment      */
/*********************/

function postComment(post_id){
	var comment_text = $($('#comment_text')).val();
	let csrfToken = $('meta[name=csrf-token]').attr('content');

	$.ajax({
		type: "POST",
		url: "/comment_webhook/post_comment",
		data: {
			"post_id": post_id,
			"comment_text": comment_text,
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', csrfToken);
		},
		success: function(data) {
			$('#commentSection').append(
			'<div id="'+data.comment_id+'" class="parent-element comment-parent-element">\
				<div class="d-flex justify-content-between">\
					<div class="d-flex align-items-top">\
						<a class="pe-3" href="/u/'+data.username+'">\
							<img src="'+data.profile_picture+'" class="img-fluid avatar avatar-md-sm rounded-circle shadow" alt="img">\
						</a>\
						<div class="flex-1 commentor-detail">\
							<p class="text-dark mb-0"><a href="/u/'+data.username+'" class="text-dark fw-bold">'+data.username+' </a>'+comment_text+'</p>\
							<small class="text-muted">1s ago - <span id="like-count-'+data.comment_id+'" class="abnum" data-abbreviate="0">0</span> <span id="pluralize-'+data.comment_id+'">likes</span>\
								<span class="dropdown-primary dropdown-comment-select child-display">\
									<a href="javascript:void(0)" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
										<i class="mdi mdi-dots-horizontal text-secondary align-middle icons"></i>\
									</a>\
									<span class="dropdown-menu  dropdown-menu-end">\
										<a href="javascript:void(0)" onclick="deleteComment(\''+data.comment_id+'\')" class="dropdown-item text-danger"><i class="mdi mdi-delete-outline align-middle"></i> Delete</a>\
										<a href="javascript:void(0)" class="dropdown-item text-dark"><i class="mdi mdi-close align-middle"></i> close </a>\
									</span>\
								</span>\
							</small>\
						</div>\
					</div>\
					<a href="javascript:void(0)" onclick="likeComment(this, \''+data.comment_id+'\')" class="pt-2 like"><i class="mdi mdi-heart text-secondary align-middle icons"></i></a>\
				</div>\
			</div>'
			);
			$($('#comment_text')).val('');
		},
		error: function(data){
			location.reload();
		}
	});
}

function displayCommentDropdown(){
    if (isMobile()) {
        $('.comment-parent-element .dropdown-comment-select').css('display', 'block');
    } else {
        $('.comment-parent-element').hover(function() {
            $(this).find('.dropdown-comment-select').css('display', 'block');
        }, function() {
            $(this).find('.dropdown-comment-select').css('display', 'none');
        });
    }
}

function createCommentHTML(comment){
	var commentCreatedOn = comment.created_on;
	var commentLikes = comment.likes;
	var commentDidLike = comment.did_like;
	if (typeof comment.text === 'undefined' || comment.text === null){
		location.reload()
	}

	return `
	<div id="${comment.id}" class="pb-2 mb-2 parent-element comment-parent-element">
		<div class="d-flex justify-content-between">
			<div class="d-flex align-items-top">
				<a class="pe-3" href="/u/${comment.username}">
					<img src="${comment.profile_picture}" class="img-fluid avatar avatar-md-sm rounded-circle shadow" alt="img">
				</a>
				<div class="flex-1 commentor-detail">
					<p class="mb-0"><a href="/u/${comment.username}" class="h6 text-dark media-heading">${comment.display_username}</a> <span class="text-muted small">• ${moment(commentCreatedOn).fromNow(no_suffix = false)}</span></p>
					<small class="">${convertTextToSafeText(comment.text)}</small>
					<div><a href="javascript:void(0)" onclick="likeComment(this, '${comment.id}')" class="text-dark mdi small ${commentDidLike ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'}"></a><span class="px-3"><span id="like-count-${comment.id}" class="abnum text-muted small" data-abbreviate="${commentLikes}">${commentLikes}</span></span></div>
				</div>
			</div>
			<span class="dropdown-primary dropdown-comment-select child-display">
				<a href="javascript:void(0)" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<i class="mdi mdi-dots-vertical text-secondary align-middle icons"></i>
				</a>
				<span class="dropdown-menu  dropdown-menu-end">
					${comment.can_delete ? `<a href="javascript:void(0)" onclick="deleteComment('${comment.id}')" class="dropdown-item text-danger"><i class="mdi mdi-delete-outline align-middle"></i> Delete</a>` : `<a href="javascript:void(0)" onclick="reportComment('${comment.id}')" class="dropdown-item text-danger"><i class="mdi mdi-flag-variant-outline align-middle"></i> Report</a>`}
					<a href="javascript:void(0)" class="dropdown-item text-dark"><i class="mdi mdi-close align-middle"></i> close </a>
				</span>
			</span>
		</div>
	</div>
	`;
}

function postAddComments(data){
    var commentHtml = '';

    for (var i = 0; i < data.length; i++) {
        var comment = data[i];
        commentHtml += createCommentHTML(comment);
    }
	document.getElementById("commentContainer").innerHTML = commentHtml;
	$('#commentModal').modal('show');
	commentFormResetInput();
	postActivatePostCommentSection()
}

function postGetComments(post_id, page){
	let csrfToken = $('meta[name=csrf-token]').attr('content');
	// console.log(post_id)

	$.ajax({
		type: "POST",
		url: "/comment_webhook/retrieve-comments",
		data: {
			"post_id": post_id,
			"page": page,
		},
		success: function(data) {
			// console.log(data)
		    $('#commentModal').attr('post_id' , post_id);
			postAddComments(data[0]);
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', csrfToken);
		},
		error: function(data){
			// console.log(data);
			// window.location.href=data.responseJSON;
		}
	});
}

function postActivatePostCommentSection(){
	if (document.querySelector('[name="commentInput"]')){
		// 1. add an event listener to the commentInput so that on click you remove "d-none" class from commentInputSubmit
		document.querySelector('[name="commentInput"]').addEventListener('click', function(){
			document.querySelector('[name="commentInputSubmit"]').classList.remove('d-none');
			document.querySelector('[name="commentInputCancel"]').classList.remove('d-none');
		});

		// 2. add an event listener to the commentInput so that if there is some text inside commentInput you make commentInputSubmit disabled=False and vice versa
		document.querySelector('[name="commentInput"]').addEventListener('keyup', function(){
			if(this.value.length > 0){
				document.querySelector('[name="commentInputSubmit"]').disabled = false;
			}else{
				document.querySelector('[name="commentInputSubmit"]').disabled = true;
			}
		});

		// 3. auto resize the textarea so that if text overflows increase the rows
		document.querySelector('[name="commentInput"]').addEventListener('keyup', function(){
			this.style.height = "1px";
			this.style.height = (this.scrollHeight)+"px";
		});
	}
	if (document.querySelector('[name="commentFormRedirectInput"]')){
		document.querySelector('[name="commentFormRedirectInput"]').addEventListener('click', function(){
			$.ajax({
				type: "POST",
				url: "/comment_webhook/redirect-login",
				data: {
					"post_id": $('#commentModal').attr('post_id'),
				},
				success: function(data) {
					window.location.href=data.responseJSON;
				},
				beforeSend: function (xhr) {
					xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
				},
				error: function(data){
					window.location.href=data.responseJSON;
				}
			});
		});
	}

}

function likeComment(element, comment_id) {
	let csrfToken = $('meta[name=csrf-token]').attr('content');
	$.ajax({
		type: "POST",
		url: "/comment_webhook/like-comment",
		data: {
			"comment_id": comment_id,
		},
		success: function(data) {
			var like_count = parseInt(document.getElementById(`like-count-${comment_id}`).dataset.abbreviate);
			if (element.classList.contains('mdi-thumb-up-outline')){
				element.classList.remove('mdi-thumb-up-outline');
				element.classList.add('mdi-thumb-up');
				like_count = parseInt(like_count + 1);
			} else {
				element.classList.remove('mdi-thumb-up');
				element.classList.add('mdi-thumb-up-outline');
				like_count = parseInt(like_count - 1);
			}

			document.getElementById(`like-count-${comment_id}`).dataset.abbreviate = like_count;
			document.getElementById(`like-count-${comment_id}`).innerHTML = abbreviateNumber(like_count);

		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', csrfToken);
		},
		error: function(data){
			window.location.href=data.responseJSON;
		}
	});
}

function deleteComment(comment_id) {
	$.ajax({
		type: "POST",
		url: '/comment_webhook/delete-comment',
		data: {
			"comment_id": comment_id,
		},
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
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

function reportComment(comment_id) {
	var element = "#" + comment_id;
	$(element).addClass("d-none");
}

function commentFormSubmit(element){
	var commentText = $("textarea[name=commentInput]").val();
	var post_id = $('#commentModal').attr('post_id')
    $.ajax({
		type: "POST",
		url: "/comment_webhook/add-comment",
		data: {
			"post_id": post_id,
			"comment_text": commentText,
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
		},
		success: function(data) {
            document.getElementById("commentContainer").innerHTML = createCommentHTML(data[0]) + document.getElementById("commentContainer").innerHTML;
			commentFormResetInput();
			// increase the number of commments
			document.getElementById(post_id+"-number").innerHTML = parseInt(document.getElementById(post_id+"-number").innerHTML) + 1;
		},
		error: function(data){
			location.reload();
		}
	});
}

function commentFormResetInput(){
	if (document.querySelector('[name="commentInput"]')){
		document.querySelector('[name="commentInput"]').value = "";
		document.querySelector('[name="commentInputSubmit"]').classList.add("d-none");
		document.querySelector('[name="commentInputCancel"]').classList.add("d-none");	
	}
}