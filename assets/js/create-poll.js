// The DOM element you wish to replace with Tagify
var cat_input = document.querySelector('input[name=tags]');

// initialize Tagify on the above input node reference
new Tagify(cat_input, {
    maxTags: 5,
    duplicates: false,
    delimiters: "`",
    classname: "form-control",
});

// Manipulate options
function add_new_post_options(){
    if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[2].classList.contains('d-none')){
        document.getElementById('remove_post_option').classList.remove('d-none');
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[2].classList.remove('d-none');
    } else if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[3].classList.contains('d-none')){
        document.getElementById('add_post_option').classList.add('d-none');
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[3].classList.remove('d-none');
    }
};

function remove_new_post_options(){
    if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[3].classList.contains('d-none') == false){
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[3].classList.add('d-none');
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[3].innerHTML = "Option 4";
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-answer-choice')[3].checked = false;
        document.getElementById('add_post_option').classList.remove('d-none');
    } else if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[2].classList.contains('d-none') == false){
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[2].classList.add('d-none');
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[2].innerHTML = "Option 3";
        document.getElementsByClassName('i-amphtml-story-interactive-quiz-answer-choice')[2].checked = false;
        document.getElementById('remove_post_option').classList.add('d-none');
    }
};

var trivia_section = '<div id="option-1" class="i-amphtml-story-interactive-quiz-container i-amphtml-story-interactive-container i-amphtml-story-interactive-has-data"> <div class="i-amphtml-story-interactive-quiz-option-container"> <button type="button" class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option bg-light"><input optionId="0" class="i-amphtml-story-interactive-quiz-answer-choice form-check-input text-primary rounded-circle my-0" value="a" type="checkbox"><input class="i-amphtml-story-interactive-quiz-option-text w-100 border-0 bg-light" placeholder="Option A" contenteditable=""></button> <button type="button" class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option bg-light"><input optionId="1" class="i-amphtml-story-interactive-quiz-answer-choice form-check-input text-primary rounded-circle my-0" value="b" type="checkbox"><input class="i-amphtml-story-interactive-quiz-option-text w-100 border-0 bg-light" placeholder="Option B" contenteditable=""></button> <button type="button" class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option bg-light d-none"><input optionId="2" class="i-amphtml-story-interactive-quiz-answer-choice form-check-input text-primary rounded-circle my-0" value="c" type="checkbox"><input class="i-amphtml-story-interactive-quiz-option-text w-100 border-0 bg-light" placeholder="Option C" contenteditable=""></button> <button type="button" class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option bg-light d-none"><input optionId="3" class="i-amphtml-story-interactive-quiz-answer-choice form-check-input text-primary rounded-circle my-0" value="d" type="checkbox"><input class="i-amphtml-story-interactive-quiz-option-text w-100 border-0 bg-light" placeholder="Option D" contenteditable=""></button> <div class="text-center w-100"> <button type="button" id="add_post_option" onclick="add_new_post_options()" class="btn btn-pills btn-light p-1 border-0 mx-2 btn-sm">+</button> <button type="button" id="remove_post_option" onclick="remove_new_post_options()" class="btn btn-pills btn-light  border-0 btn-sm p-1 mx-2 d-none">-</button> </div> </div> </div>';
var poll_section = '<div id="option-1" class="i-amphtml-story-interactive-quiz-container i-amphtml-story-interactive-container i-amphtml-story-interactive-has-data"> <div class="i-amphtml-story-interactive-quiz-option-container"> <button type="button" class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option bg-light"><span class="i-amphtml-story-interactive-quiz-answer-choice text-primary">A</span><input class="i-amphtml-story-interactive-quiz-option-text w-100 border-0 bg-light" placeholder="Option A" contenteditable=""></button> <button type="button" class="i-amphtml-story-interactive-quiz-option i-amphtml-story-interactive-option bg-light"><span class="i-amphtml-story-interactive-quiz-answer-choice text-primary">B</span><input class="i-amphtml-story-interactive-quiz-option-text w-100 border-0 bg-light" placeholder="Option B" contenteditable=""></button></div> </div>';

// Manupulate post options
var current_format = 'Poll';
function clear_center_interactive(inputted_format){
    current_format = inputted_format;
    if(document.getElementById('option-1')){
        document.getElementById('option-1').remove();
    }
}

function change_format(object, option_name){
    // If the format didn't change do nothing
    if (current_format == option_name){
        return null
    } else if (option_name === 'Trivia'){
        clear_center_interactive(option_name)

        // Make sure only one checkbox get's checked
        document.getElementsByClassName('center-interactive')[0].insertAdjacentHTML('beforeend', trivia_section);
        $('.i-amphtml-story-interactive-quiz-answer-choice').click(function() {
            $('.i-amphtml-story-interactive-quiz-answer-choice').not(this).prop('checked', false);
        });

    } else if (option_name === 'Question'){
        clear_center_interactive(option_name)
    } else {
        clear_center_interactive('Poll')
        document.getElementsByClassName('center-interactive')[0].insertAdjacentHTML('beforeend', poll_section);
    }

    var buttons = document.getElementsByClassName("new-post-format-option");
    // check the selected button label
    for (var i = 0; i < buttons.length; i++) {
        // If the format didn't change do nothing
        if (buttons[i].innerHTML == option_name){
            buttons[i].classList.add("btn-dark")
            buttons[i].classList.remove("btn-outline-dark")
        // Remove previous selected buttons
        } else {
            buttons[i].classList.remove("btn-dark")
            buttons[i].classList.add("btn-outline-dark")
        }
    }
};

// check if uploaded file is image
function isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
}

function alert_user(alert_message){
    clear_alerts();
    var default_alert_message = '<div class="alert alert-danger alert-dismissible fade show mb-0 mb-3" role="alert"> <strong>Oh snap! </strong> '+ alert_message +'<p class="btn-close text-light" data-bs-dismiss="alert" aria-label="Close"></p> </div>';
    document.getElementById('alert_placeholder').insertAdjacentHTML('beforeend', default_alert_message)
}
function clear_alerts(){
    document.getElementById('alert_placeholder').innerHTML = '';
}
// Manipulate background
var added_images = 0;
function new_post_add_image(input, image_number) {
    // image number inputted to keep track of inputted images
    if (image_number === 1){
        if (input.files && input.files[0]) {
            if (isFileImage(input.files[0])){
                var reader = new FileReader();


                reader.onload = function (e) {
                    $('#display_image_1').attr('src', e.target.result);
                    document.getElementById('display_image_1').classList.remove('d-none');
                    // change the title display css (change latter)
                    document.getElementsByClassName('title-component')[0].classList.remove('text-dark');
                    document.getElementsByClassName('title-component')[0].classList.add('amp-poll-title');
                    // change center interactive position
                    document.getElementsByClassName('center-interactive')[0].classList.remove('top-50')
                    document.getElementsByClassName('center-interactive')[0].classList.add('top-75');
                    // change the add label to image 2
                    document.getElementsByClassName('new-post-image-label')[0].classList.add('d-none');
                    document.getElementsByClassName('new-post-image-label')[1].classList.remove('d-none')
                };
                added_images += 1;
                reader.readAsDataURL(input.files[0]);
            } else  {
                $("#image_1_id").replaceWith($("#image_1_id").val('').clone(true));
                alert_user('Please insert an image format');
            }
        }
    } else {
        if (input.files && input.files[0]) {
            if (isFileImage(input.files[0])){
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#display_image_2').attr('src', e.target.result);
                    document.getElementById('display_image_2').classList.remove('d-none');
                    // change center interactive position
                    document.getElementsByClassName('center-interactive')[0].classList.add('top-50')
                    document.getElementsByClassName('center-interactive')[0].classList.remove('top-75');

                    document.getElementById("display_image_1").style.aspectRatio = 4/2.5;
                };
                added_images += 1;

                reader.readAsDataURL(input.files[0]);
            } else {
                $("#image_2_id").replaceWith($("#image_2_id").val('').clone(true));
                alert_user('Please insert an image format');
            }
        }
    }
}

function new_post_remove_image(){
    if (added_images !== 0){
        if(added_images === 2){
            // clear image 2 input
            $("#image_2_id").replaceWith($("#image_2_id").val('').clone(true));
            // remove the image 2 displat
            document.getElementById('display_image_2').classList.add('d-none');
            // reposistion the center interactive the center
            document.getElementsByClassName('center-interactive')[0].classList.remove('top-50')
            document.getElementsByClassName('center-interactive')[0].classList.add('top-75');
            // change the image 1 aspect ratio
            document.getElementById('display_image_1').style.aspectRatio = 0;
            // signal image removed to other functions
            added_images -= 1;
        } else {
            // Clear image 1 input
            $("#image_1_id").replaceWith($("#image_1_id").val('').clone(true));
            // remove image 2 label and add image 1 label
            document.getElementsByClassName('new-post-image-label')[0].classList.remove('d-none');
            document.getElementsByClassName('new-post-image-label')[1].classList.add('d-none');
            // hide the image 1 display
            document.getElementById('display_image_1').classList.add('d-none');
            // change the title display css (change latter)
            document.getElementsByClassName('title-component')[0].classList.remove('amp-poll-title');
            document.getElementsByClassName('title-component')[0].classList.add('text-dark');
            // reposition the center interractive
            document.getElementsByClassName('center-interactive')[0].classList.add('top-50')
            document.getElementsByClassName('center-interactive')[0].classList.remove('top-75');
            // signal removed image
            added_images -= 1;
        };
    };
};

var current_section = 1;
var selected_correct_answer = ""

const ab_options = [];
function add_new_options(id){
    ab_options.push(document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[id].value);
}
function clear_new_options(){
    ab_options.length = 0;
}


function next_section(){

    if (current_section === 1){
        // if title is not edited raise the issue
        if (document.getElementsByClassName('title-component')[0].innerHTML === 'Question?'){
            return alert_user('Edit the question to continue')
        }

        // raise any errors before going to the next section
        if (current_format === 'Poll'){
            clear_new_options()
            if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[0].value === '' || document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[1].value === ''){
                return alert_user('Edit the options to continue')
            } else {
                add_new_options(0);
                add_new_options(1);
            }
        } else if (current_format === 'Trivia'){
            clear_new_options()
            // if options are propelly filled send them to server que
            if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[0].innerHTML === 'Option 1' || document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[1].innerHTML === 'Option 2'){
                return alert_user('Edit the options to continue')
            } else {
                add_new_options(0)
                add_new_options(1)
            }
            // if option 3 is properly filled send them to server que
            if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[2].classList.contains('d-none') === false && document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[2].innerHTML === 'Option 3'){
                return alert_user('Edit the options to continue')
            } else if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[2].classList.contains('d-none') === false && document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[2].innerHTML !== 'Option 3'){
                add_new_options(2)
            }
            // if option 4 is properly filled send them to server que
            if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[3].classList.contains('d-none') === false && document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[3].innerHTML === 'Option 4'){
                return alert_user('Edit the options to continue')
            } else if (document.getElementsByClassName('i-amphtml-story-interactive-quiz-option')[3].classList.contains('d-none') === false && document.getElementsByClassName('i-amphtml-story-interactive-quiz-option-text')[3].innerHTML !== 'Option 4'){
                add_new_options(3)
            }
            // check if one checkbox is checked
            var checked = $("input:checked").length > 0;
            if (!checked){
                return alert_user('Select the correct answer');
            }

            $("input:checkbox").each(function(){
                var $this = $(this);
                if($this.is(":checked")){
                    selected_correct_answer = $this.attr("optionId");
                }
            });
        } else if (current_format === 'Question'){
            clear_new_options()
        };

        document.getElementById('section-1').classList.add('d-none')
        document.getElementById('section-2').classList.remove('d-none')
        current_section += 1;
        return clear_alerts();
    } else {
        document.getElementById('new_post_submit').innerHTML = '';
        document.getElementById('new_post_submit').insertAdjacentHTML('beforeend', '<i class="mdi mdi-loading mdi-spin"></i>')

//        document.querySelector('input[name="title"]').value = document.getElementsByClassName('title-component')[0].textContent;
        document.querySelector('input[name="format"]').value = current_format;
        document.querySelector('input[name="selected_option"]').value = selected_correct_answer;
        document.querySelector('input[name="options"]').value = JSON.stringify(ab_options);
        document.getElementById("discreteSubmit").click();
    }
}

function previous_section(){
    if (current_section === 2){
        current_section -= 1;
        document.getElementById('section-1').classList.remove('d-none')
        document.getElementById('section-2').classList.add('d-none')
    } else if (current_section === 1) {
        history.back()
    }
}

$('.title-component').on({input: function(){
    var totalHeight = $(this).prop('scrollHeight') - parseInt($(this).css('padding-top')) - parseInt($(this).css('padding-bottom'));
    $(this).css({'height':totalHeight});
}
});

function tagTemplate(tagData){
    return `
        <tag title="${tagData.email}"
                contenteditable='false'
                spellcheck='false'
                tabIndex="-1"
                class="tagify__tag ${tagData.class ? tagData.class : ""}"
                ${this.getAttributes(tagData)}>
            <x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
            <div>
                <div class='pe-3 tagify__dropdown__item__avatar-wrap'>
                    <img onerror="this.style.visibility='hidden'" class="img-fluid avatar avatar-sm-sm rounded-circle shadow" src="${tagData.avatar}">
                </div>
                <span>${tagData.name}</span>
            </div>
        </tag>
    `
}

function suggestionItemTemplate(tagData){
    return `
        <div ${this.getAttributes(tagData)}
            class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}'
            tabindex="0"
            role="option">
            ${ tagData.avatar ? `
            <div class='tagify__dropdown__item__avatar-wrap'>
                <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
            </div>` : ''
            }
            <span>${tagData.name}</span>
        </div>
    `
}

function dropdownHeaderTemplate(suggestions){
    return `
        <div class="${this.settings.classNames.dropdownItem} ${this.settings.classNames.dropdownItem}__addAll">
            <strong>${this.value.length ? `Add remaning ${suggestions.length}` : 'Add All'}</strong>
            <span>${suggestions.length} members</span>
        </div>
    `
}


if (document.querySelector('input[name=users-list-tags]')){
    var inputElm = document.querySelector('input[name=users-list-tags]');

    // initialize Tagify on the above input node reference
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    $.ajax({
        type: "GET",
        url: "/util/retrieve_topics",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        success: function(data) {
            var tagify = new Tagify(inputElm, {
                tagTextProp: 'name', // very important since a custom template is used with this property as text
                enforceWhitelist: true,
                skipInvalid: true, // do not remporarily add invalid tags
                maxTags: 1,
                dropdown: {
                    closeOnSelect: false,
                    enabled: 0,
                    classname: 'users-list',
                    searchKeys: ['name']  // very important to set by which keys to search for suggesttions when typing
                },
                templates: {
                    tag: tagTemplate,
                    dropdownItem: suggestionItemTemplate,
                    dropdownHeader: dropdownHeaderTemplate
                },
                whitelist: data,
            })

            // listen to dropdown suggestion items selection
            tagify.on('dropdown:select', onSelectSuggestion)
        }
    });
}


function onSelectSuggestion(e){
    // console.log(this)
    // console.log(e.detail.elm.className,  e.detail.elm.classList.contains(`${tagify.settings.classNames.dropdownItem}__addAll`)  )

    if( e.detail.elm.classList.contains(`${tagify.settings.classNames.dropdownItem}__addAll`) )
        tagify.dropdown.selectAll();
}