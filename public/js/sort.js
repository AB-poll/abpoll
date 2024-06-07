var question_input = document.querySelector('input[name=question-select]')
var answer_input = document.querySelector('input[name=answer-select]')

var whitelist_questions = []
var whitelist_answers;
var whitelist_dict;
var get_post_id;
var get_answer_id;
var username;

document.addEventListener("DOMContentLoaded", function() {
    var username = document.getElementById("username").innerHTML;

	$.ajax({
		type: "POST",
		url: '/util/retrieve-questions-and-choices',
		dataType: 'json',
		data: {
			'username': username,
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
		},
		success: function(data){
			for (const [key, value] of Object.entries(data)){
                whitelist_questions.push(key)
			}
			whitelist_dict = data;
			initialize_question()
		},
	});
})

function initialize_question(){
    question_tag = new Tagify(question_input, {
        enforceWhitelist: true,
        mode : "select",
        whitelist: whitelist_questions,
        dropdown: {
            maxItems: 2,
            enabled: 0,
            classname: "form-control tagify-sort p-0"
        },
    })

    // bind events
    question_tag.on('add', question_selected)
    question_tag.on('remove', clear_answer)

    question_tag.DOM.input.addEventListener('focus', onSelectFocus)
}

function question_selected(e){
    //    console.log(e.detail)

    answer_input.disabled = false;
    get_post_id = whitelist_dict[e.detail.data.value][2]
    whitelist_answers = [whitelist_dict[e.detail.data.value][0], whitelist_dict[e.detail.data.value][1]]

    answer_tag = new Tagify(answer_input, {
        enforceWhitelist: true,
        mode : "select",
        whitelist: whitelist_answers,
        dropdown: {
            maxItems: 2,
            enabled: 0,
            classname: "form-control tagify-sort p-0"
        },
    })
    answer_tag.on('add', answer_selected)
    answer_tag.on('remove', hide_submit)
    answer_tag.DOM.input.addEventListener('focus', onSelectFocus)
}

function answer_selected(e){
    get_answer_id = whitelist_answers.indexOf(e.detail.data.value);
    document.querySelector('input[name=submit-sort]').disabled = false;
    document.querySelector('input[name=submit-sort]').classList.add('btn-primary');
}

function hide_submit(e){
    document.querySelector('input[name=submit-sort]').disabled = true;
    document.querySelector('input[name=submit-sort]').classList.remove('btn-primary');
}

function clear_answer(e){
    reset_attribute = true;
    answer_input.value = '';
    answer_input.disabled = true;
    document.getElementsByClassName('tagify--select')[1].remove()
    hide_submit()
}

function onSelectFocus(e){
    // console.log(e)
}

document.querySelector('input[name=submit-sort]').addEventListener('click', submit_sort)

function submit_sort(){
    window.location.href = '/u/'+username+'/sort-votes?poll_id='+get_post_id+'&choice='+get_answer_id;
}