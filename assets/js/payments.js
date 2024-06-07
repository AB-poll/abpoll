/* Author: Dorcy Shema
   Website: https://dorcis.com/
   Version: 0.0.1
   Updated: Sep 2022
   File Description: Handles payments and the subscribe modal
*/

/***********************************/
/*            INDEX                */
/*===================================
 *     01.  Subscribe Modal         *
 *     02.  Subscribe Modal Steps   *
  ==================================*/

var subscribeSelectedPrice;

//=========================================//
/*/* 01. Subscribe Modal Popup             */
//=========================================//

var subscribeModal = document.getElementById('abpoll-plus-popup')
if (subscribeModal){
    subscribeModal.addEventListener('show.bs.modal', function () {
      document.getElementsByClassName("page-wrapper")[0].classList.add("page-blur")
    })

    subscribeModal.addEventListener('hidden.bs.modal', function () {
      document.getElementsByClassName("page-wrapper")[0].classList.remove("page-blur")
    })
}

//=========================================//
/*/* 02. Subscribe Modal Steps             */
//=========================================//

function subscribeModalUpgrade(){
    var element = document.getElementsByClassName("call-to-action")[0];
    element.innerHTML = "<i class='mdi mdi-loading mdi-spin'></i>";
    var formElement = document.getElementsByClassName("upgrade-form");
    formElement[0].classList.add("d-none");
    formElement[1].classList.remove("d-none");
    element.innerHTML = "Upgrade";
}

function subscribeModalBack(){
    var forms = document.getElementsByClassName("upgrade-form");
    for(var i = forms.length - 1; i >= 0; i--){
        var form = forms[i];
        if(form.classList.contains("d-none")){
            continue;
        }
        form.classList.add("d-none");
        var nextForm = forms[i-1];
        nextForm.classList.remove("d-none");
        break;
    }
}

function subscribeModalNext(){
    //var element = document.getElementsByClassName("call-to-action")[1];
    //element.innerHTML = "<i class='mdi mdi-loading mdi-spin'></i>";
}

function subscribeSelectedPriceChange(price){
    subscribeSelectedPrice = price;
    document.getElementById("subscribeSelectedPrice").innerHTML = price;
}

var cardNumber = document.getElementById("card-number")
if (cardNumber){
    cardNumber.addEventListener('input', function(event) {
        var value = event.target.value;
        // Strip all non-digits from the input
        value = value.replace(/\D/g, '');
        // Trim the remaining input to the maximum length.
        value = value.slice(0, 16);

        // Add spaces every 4 characters.
        value = value.match(/.{1,4}/g).join(' ');
        event.target.value = value;
    });
}
