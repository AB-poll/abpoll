/* Author: Dorcy Shema
   E-mail: hello@dorcis.com
   Created: June 2022
   Version: 1.1.2
   Updated: June 2022
   File Description: This is where all the predictions will be handled from
*/

/************************************/
/*         INDEX                    */
/*==================================
 * 01.  Initialize Global Variables  *
 * 02.  Handle Predict Modal Open    *
 * 03.  Handle Predict Modal Close   *
 * 04.  Submit Prediction            *
 * 05.  Update The Modal Button      *
 * 06.  Initialize the Countdown     *
 * 07.  End Events                   *
 * 08.  Send Prediction To Server    *
 ====================================*/

//=========================================//
/*/*  01.  Initialize Global Variables    */
//=========================================//

var max_coins = parseInt(document.getElementsByClassName("balance")[0].innerHTML)
var spent_amount = 0
var voted_index, prediction_status;

//=========================================//
/*/*   02.  Handle Predict Modal Open      */
//=========================================//

$(document).on('show.bs.modal', '#prediction-modal', function (event) {
    clicked_element = $(event.relatedTarget); // Button that triggered

    a_amount = parseInt(clicked_element.data("a_amount"))
    b_amount = parseInt(clicked_element.data("b_amount"))

    total_amount =  a_amount + b_amount
    if (total_amount  === 0){
        a_percent = "0%"
        b_percent = "0%"
    } else {
        a_percent = String( ((a_amount/total_amount)*100).toFixed() ) + "%"
        b_percent = String( ((b_amount/total_amount)*100).toFixed() ) + "%"
    }

    document.getElementsByClassName("predict-title")[0].innerHTML = clicked_element.data("title");

    document.getElementsByClassName("predict-choice")[0].innerHTML = clicked_element.data("a_text")
    document.getElementsByClassName("predict-total")[0].setAttribute("abbreviate", a_amount);
    document.getElementsByClassName("predict-total")[0].innerHTML = abbreviateNumber(a_amount);
    document.getElementsByClassName("predict-percentage")[0].innerHTML = a_percent;
    document.getElementsByClassName("predict-progress-bar")[0].style.width = a_percent;

    document.getElementsByClassName("predict-choice")[1].innerHTML = clicked_element.data("b_text");
    document.getElementsByClassName("predict-total")[1].setAttribute("abbreviate", b_amount);
    document.getElementsByClassName("predict-total")[1].innerHTML = abbreviateNumber(b_amount);
    document.getElementsByClassName("predict-percentage")[1].innerHTML = b_percent;
    document.getElementsByClassName("predict-progress-bar")[1].style.width = b_percent;

    $("#prediction-modal").data("id", clicked_element.data("id"))

    predict_amount = parseInt($(`.trigger-${clicked_element.data("id")}`).first().data("spent_amount"))

    $(".predict-amount-input").each(function (){
        if (max_coins === 0 || parseInt($('meta[name=is_logged_in]').attr('content')) === 0){
            $(this).prop("disabled", true);
        } else {
            $(this).prop("disabled", false);
        }
    })

    if (predict_amount > 0){
        index = parseInt($(`.trigger-${clicked_element.data("id")}`).first().data("spent_index"))
        updateSpendAmount(index, predict_amount)
    }

    prediction_status = parseInt(clicked_element.data("status"))

    if (prediction_status === 0) {
        // this means the prediction is live

        $('.predict-countdown').each(function(){
            var y = $(clicked_element).data('year');
            var m = $(clicked_element).data('month');
            var d = $(clicked_element).data('day');
            var h = $(clicked_element).data('hour');
            var min = $(clicked_element).data('minute');

            function pad(number, length) {
                var str = "" + number
                return str
            }

            var liftoffTime = new Date(y, m - 1, d, h, min);
            var local_date = convertUTCDateToLocalDate(liftoffTime)

            $(this).countdown({
                until: local_date,
                compact: true,
                description: ''
            })
        });
    } else if (prediction_status === 1){
        $(".predict-submission-status").first().html($.parseHTML('Submission closed'))
        disable_inputs()
    } else if (prediction_status === 2){
        show_winner(clicked_element.data("winning_index"))
    }
});

//=========================================//
/*/*   03.  Handel Predict Modal Close    */
//=========================================//


$(document).on('hidden.bs.modal', '#prediction-modal', function (event) {
    enable_inputs()

    if (spent_amount > 0){
        clearSpentAmount(voted_index)
    }
    spent_amount = 0

    if (prediction_status === 0){
        $('.predict-countdown').each(function(){
            $(this).countdown('destroy')
        });
    } else if (prediction_status === 1){
        $(".predict-submission-status").first().html($.parseHTML('Submission closing in <div class="predict-countdown" data-year="2030" data-month="07" data-day="01" data-hour="11" data-minute="30"></div>'))
    } else if (prediction_status === 2){
        remove_winner()
    }

});

//=========================================//
/*/*   04.  Submit Prediction             */
//=========================================//


function submit_prediction(event, index){
    voted_index = index

    // index here represents the number being voted on
    var other_index = 1 - index
    // other index represents the number not being voted on
    var predict_amount = parseInt(event.predict_amount.value)

    if (predict_amount > 0 && predict_amount <= max_coins) {
        index_value = parseInt(document.getElementsByClassName("predict-total")[index].getAttribute("abbreviate"))
        var other_index_value = parseInt(document.getElementsByClassName("predict-total")[other_index].getAttribute("abbreviate"))

        max_coins -= predict_amount
        index_value += predict_amount


        document.getElementsByClassName("predict-total")[index].setAttribute("abbreviate", index_value)
        document.getElementsByClassName("predict-total")[index].innerHTML = abbreviateNumber(index_value)

        var all_index_total = index_value + other_index_value
        // disable the alternative input field
        document.getElementsByClassName("predict-amount-input")[index].setAttribute("max", max_coins)


        update_balance(max_coins)

        //document.getElementsByClassName("balance")[0].innerHTML = max_coins;
        // perform the display, and math
        sendPredictionToServer(predict_amount, index, $("#prediction-modal").data("id"))

        updatePercentages(index, index_value, all_index_total)
        updatePercentages(other_index, other_index_value, all_index_total)
        updateSpendAmount(index, predict_amount)
        updateClickedItem(index, index_value, other_index_value)

        // if balance is 0 remove the input field
        if (max_coins === 0){
            document.getElementsByClassName("predict-amount-input")[index].disabled = true;
        }

    }
}

//=========================================//
/*/*   05. Update The Modal Button        */
//=========================================//

function updateClickedItem(index, index_value, other_index_value){
    element_id = $("#prediction-modal").data("id")
    if (index === 0){
        $(`.trigger-${element_id}`).first().data("a_amount", index_value)
        $(`.trigger-${element_id}`).first().data("b_amount", other_index_value)
    } else {
        $(`.trigger-${element_id}`).first().data("a_amount", other_index_value)
        $(`.trigger-${element_id}`).first().data("b_amount", index_value)
    }
}


function clearSpentAmount(index){
    var other_index = 1 - index
    document.getElementsByClassName("predict-vote-section")[index].classList.replace("pt-0", "pt-2")
    document.getElementsByClassName("predict-vote-section")[other_index].querySelector("form").classList.remove("pt-2")
    document.getElementsByClassName("predict-amount-input")[other_index].disabled = false
    document.getElementsByClassName("predict-amount-input")[index].disabled = false
    document.getElementsByClassName("predict-vote-section")[index].querySelector("form").classList.replace("mt-2", "mt-4")
    document.getElementsByClassName("predict-spent-amount")[0].remove()

    document.getElementsByClassName("predict-amount-input")[index].value = ""
}


function updateSpendAmount(index,predict_amount){
    voted_index = index
    var other_index = 1 - index
    if (spent_amount === 0) {
        // make the voted item size smaller
        document.getElementsByClassName("predict-vote-section")[index].classList.replace("pt-2", "pt-0")
        // make the disabled item size bigger and disable it
        document.getElementsByClassName("predict-vote-section")[other_index].querySelector("form").classList.add("pt-2")
        document.getElementsByClassName("predict-amount-input")[other_index].disabled = true
        // make the enabled item size bigger
        document.getElementsByClassName("predict-vote-section")[index].querySelector("form").classList.replace("mt-4", "mt-2")
        // initialize the spent amount
        new_div = document.createElement("div");
        new_div.classList.add("mt-2",  "predict-spent-amount")

        if (index === 0){
            new_div.classList.add("text-end")
        } else {
            new_div.classList.add("text-start")
        }
        new_div.innerHTML =  `<i class="uil uil-coins text-secondary"></i> <span class="spent-ammount abnum" abbreviate="${predict_amount}">${abbreviateNumber(predict_amount)}</span> Spent`
        document.getElementsByClassName("predict-vote-section")[index].prepend(new_div)
        spent_amount += predict_amount

        element_id = $("#prediction-modal").data("id")
        $(`.trigger-${element_id}`).first().data("spent_amount", spent_amount)
        $(`.trigger-${element_id}`).first().data("spent_index", index)
    } else {
        spent_amount += predict_amount
        // update the spent amount
        document.getElementsByClassName("spent-ammount")[0].setAttribute("abbreviate", spent_amount)
        document.getElementsByClassName("spent-ammount")[0].innerHTML = abbreviateNumber(spent_amount)
        $(`.trigger-${element_id}`).first().data("spent_amount", spent_amount)
    }
    if (max_coins ===  0){
        document.getElementsByClassName("predict-amount-input")[other_index].disabled = true
        document.getElementsByClassName("predict-amount-input")[index].disabled = true
    }

}


function updatePercentages(index, index_value, all_index_total) {
    var index_percentage = String( ((index_value/all_index_total)*100).toFixed() ) + "%"
    document.getElementsByClassName("predict-percentage")[index].innerHTML = index_percentage
    document.getElementsByClassName("predict-progress-bar")[index].style.width = index_percentage
}


//=========================================//
/*/* 06. Initialize the Countdown         */
//=========================================//
function convertUTCDateToLocalDate(date) {
	var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
	return newDate;
}


function de_countdown() {
	let csrfToken = $('meta[name=csrf-token]').attr('content');
	$('.de_countdown').each(function() {
		var y = $(this).data('year');
		var m = $(this).data('month');
		var d = $(this).data('day');
		var h = $(this).data('hour');
		var min = $(this).data('minute');

		function pad(number, length) {
			var str = "" + number
			return str
		}

		var liftoffTime = new Date(y, m - 1, d, h, min);
		var local_date = convertUTCDateToLocalDate(liftoffTime)

		$(this).countdown({
			until: local_date,
			onExpiry: liftOff
		})

		function liftOff() {
		    event_id = this.id.replace("de_count_", "")
		    event_ended(event_id)

			$.ajax({
				type: "PUT",
				url: "/v1/predict/live-event",
				data: {
					"event_id": event_id,
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-CSRFToken', csrfToken);
				},
			});
		}

	});



}

de_countdown()

//=========================================//
/*/* 07. End Events                       */
//=========================================//


function event_ended(event_id){
    disable_inputs()
    prediction_status = 1
    $(`.trigger-${event_id}`).first().data("status", 1)
    opened_id = $("#prediction-modal").data("id")
    if (opened_id === event_id){
        $(".predict-countdown").each(function(){
            $(this).countdown('destroy')
        })
    }

    $(`#de_count_${event_id}`).each(function(){
        $(this).countdown('destroy')
    });
    $(".predict-submission-status").first().html($.parseHTML('Submission closed'))
    var live_display = '<div class="predict-live-display col-6 m-0 h6 text-center d-flex justify-content-center align-items-center"> <span class="blob red"></span> <span class="ms-1 align-middle">Live</span> </div>'
    $(`#de_count_${event_id}`).replaceWith(live_display)

}

function disable_inputs() {
    $('.predict-amount-input').each(function(){
        $(this).prop("disabled", true)
    })
}

function enable_inputs(){
    $('.predict-amount-input').each(function(){
        $(this).prop("disabled", false)
    })
}

//=========================================//
/*/* 08. Send Prediction To Server        */
//=========================================//

function sendPredictionToServer(amount, index, event_id){
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    $.ajax({
        type: "POST",
        url: "/v1/predict/new-prediction",
        data: {
            "event_id": event_id,
            "amount": amount,
            "index": index,
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
    });
}

//=========================================//
/*/* 09. Event Ended                       */
//=========================================//

function show_winner(winning_index){
    other_index = 1 - winning_index
    prediction_status = 2

    $(".predict-submission-status").first().html($.parseHTML('Submission closed'))
    disable_inputs()
    new_div = document.createElement("div");
    new_div.classList.add("predict-winner", "text-dark")

    if (winning_index === 0){
        new_div.classList.add("text-end")
    } else {
        new_div.classList.add("text-start")
    }

    new_div.innerHTML =  '<i class="mdi mdi-check-circle text-secondary"></i> Winner'
    document.getElementsByClassName("predict-voting-panel")[winning_index].prepend(new_div)
    document.getElementsByClassName("predict-choice")[other_index].classList.add("mt-4")
}

function remove_winner(){
    $(".predict-submission-status").first().html($.parseHTML('Submission closing in <div class="predict-countdown" data-year="2030" data-month="07" data-day="01" data-hour="11" data-minute="30"></div>'))
    document.getElementsByClassName("predict-winner")[0].remove()
    document.getElementsByClassName("predict-choice")[other_index].classList.remove("mt-4")
    enable_inputs()
}
