/* Author: Dorcy Shema
   E-mail: dorcy@skedo.tech
   Created: July 2021
   Version: 1.1.1
   Updated: April 2021
   File Description: Common JS file of the template(plugins.init.js)
*/

/*********************************/
/*         INDEX                 */
/*================================
 *     01.  Tiny Slider          *
 *     02.  Swiper slider        *
 *     03.  Countdown Js         * (For Comingsoon pages)
 *     04.  Maintenance js       * (For Maintenance page)
 *     05.  Data Counter         *
 *     06.  Datepicker js        *
 *     07.  Gallery filter js    * (For Portfolio pages)
 *     08.  Tobii lightbox       * (For Portfolio pages)
 *     09.  CK Editor            * (For Compose mail)
 *     10.  Fade Animation       *
 *     11.  Typed Text animation (animation) *
 *     12.  Like Input  *
 *     13.  Currency Input *
 *     14.  Read more *
 *     15.  Lazy Load *
 *     16.  Abbreviate Number *
 *     17.  Follow and Unfollow *
 *     19.  Comment On Input *
 *     20.  Pluralize *
 *     21.  Feather *
 *     22.  Notification Loader *
 *     23.  Username Availability Checker *
 *     24.  Field Validation *
 *     25.  Disable Form If No Change *
 *     26.  Cookies Policy *
 *     25.  Post Tags Input *


 ================================*/

//  Auto add active
breakOut = true;
$(function(){
    var current = location.pathname;
    $('#footerNav li a').each(function(){
        var $this = $(this);
        // if the current path is like this link, make it active
        if($this.attr('href').indexOf(current) !== -1){
            if(breakOut) {
                breakOut = false;
                return $this.parents().addClass('active')
            }
        }
    })
})

//=========================================//
/*            01) Tiny slider              */
//=========================================//

if (document.getElementsByClassName('tiny-single-item').length > 0) {
	var slider = tns({
		container: '.tiny-single-item',
		items: 1,
		controls: false,
		mouseDrag: true,
		loop: true,
		rewind: true,
		autoplay: false,
		autoplayButtonOutput: false,
		autoplayTimeout: 3000,
		navPosition: "bottom",
		speed: 400,
		gutter: 16,
	});
};

if (document.getElementsByClassName('tiny-two-item').length > 0) {
	var slider = tns({
		container: '.tiny-two-item',
		controls: false,
		mouseDrag: true,
		loop: true,
		rewind: true,
		autoplay: false,
		autoplayButtonOutput: false,
		autoplayTimeout: 3000,
		navPosition: "bottom",
		speed: 400,
		gutter: 12,
		responsive: {
			992: {
				items: 2
			},

			767: {
				items: 2
			},

			320: {
				items: 1
			},
		},
	});
};

if (document.getElementsByClassName('tiny-three-item').length > 0) {
	var slider = tns({
		container: '.tiny-three-item',
		controls: false,
		mouseDrag: true,
		loop: true,
		rewind: true,
		autoplay: false,
		autoplayButtonOutput: false,
		autoplayTimeout: 3000,
		navPosition: "bottom",
		speed: 400,
		gutter: 12,
		responsive: {
			992: {
				items: 3
			},

			767: {
				items: 2
			},

			320: {
				items: 1
			},
		},
	});
};

if (document.getElementsByClassName('tiny-four-item').length > 0) {
	var slider = tns({
		container: '.tiny-four-item',
		controls: false,
		mouseDrag: true,
		loop: true,
		rewind: true,
		autoplay: false,
		autoplayButtonOutput: false,
		autoplayTimeout: 3000,
		navPosition: "bottom",
		speed: 400,
		gutter: 12,
		responsive: {
			992: {
				items: 4
			},

			767: {
				items: 2
			},

			320: {
				items: 1
			},
		},
	});
};

if (document.getElementsByClassName('tiny-six-item').length > 0) {
	var slider = tns({
		container: '.tiny-six-item',
		controls: false,
		mouseDrag: true,
		loop: true,
		rewind: true,
		autoplay: false,
		autoplayButtonOutput: false,
		autoplayTimeout: 3000,
		navPosition: "bottom",
		speed: 400,
		gutter: 12,
		responsive: {
			992: {
				items: 6
			},

			767: {
				items: 3
			},

			320: {
				items: 1
			},
		},
	});
};

//=========================================//
/*            02) Swiper slider            */
//=========================================//

try {
	var menu = [];
	var interleaveOffset = 0.5;
	var swiperOptions = {
		loop: true,
		speed: 1000,
		parallax: true,
		autoplay: {
			delay: 6500,
			disableOnInteraction: false,
		},
		watchSlidesProgress: true,
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
			renderBullet: function(index, className) {
				return '<span class="' + className + '">' + 0 + (index + 1) + '</span>';
			},
		},

		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},

		on: {
			progress: function() {
				var swiper = this;
				for (var i = 0; i < swiper.slides.length; i++) {
					var slideProgress = swiper.slides[i].progress;
					var innerOffset = swiper.width * interleaveOffset;
					var innerTranslate = slideProgress * innerOffset;
					swiper.slides[i].querySelector(".slide-inner").style.transform =
						"translate3d(" + innerTranslate + "px, 0, 0)";
				}
			},

			touchStart: function() {
				var swiper = this;
				for (var i = 0; i < swiper.slides.length; i++) {
					swiper.slides[i].style.transition = "";
				}
			},

			setTransition: function(speed) {
				var swiper = this;
				for (var i = 0; i < swiper.slides.length; i++) {
					swiper.slides[i].style.transition = speed + "ms";
					swiper.slides[i].querySelector(".slide-inner").style.transition =
						speed + "ms";
				}
			}
		}
	};

	// DATA BACKGROUND IMAGE
	var swiper = new Swiper(".swiper-container", swiperOptions);

	let data = document.querySelectorAll(".slide-bg-image")
	data.forEach((e) => {
		e.style.backgroundImage =
			`url(${e.getAttribute('data-background')})`;
	})
} catch (err) {

}

//=========================================//
/*/*            03) Countdown js           */
//=========================================//

try {
	if (document.getElementById("days")) {
		// The data/time we want to countdown to
		var eventCountDown = new Date("June 1, 2022 16:37:52").getTime();

		// Run myfunc every second
		var myfunc = setInterval(function() {

			var now = new Date().getTime();
			var timeleft = eventCountDown - now;

			// Calculating the days, hours, minutes and seconds left
			var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
			var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

			// Result is output to the specific element
			document.getElementById("days").innerHTML = days + "<p class='count-head'>Days</p> "
			document.getElementById("hours").innerHTML = hours + "<p class='count-head'>Hours</p> "
			document.getElementById("mins").innerHTML = minutes + "<p class='count-head'>Mins</p> "
			document.getElementById("secs").innerHTML = seconds + "<p class='count-head'>Secs</p> "

			// Display the message when countdown is over
			if (timeleft < 0) {
				clearInterval(myfunc);
				document.getElementById("days").innerHTML = ""
				document.getElementById("hours").innerHTML = ""
				document.getElementById("mins").innerHTML = ""
				document.getElementById("secs").innerHTML = ""
				document.getElementById("end").innerHTML = "00:00:00:00";
			}
		}, 1000);
	}
} catch (err) {

}

//=========================================//
/*/*            04) Maintenance js         */
//=========================================//

try {
	if (document.getElementById("maintenance")) {
		var seconds = 3599;

		function secondPassed() {
			var minutes = Math.round((seconds - 30) / 60);
			var remainingSeconds = seconds % 60;
			if (remainingSeconds < 10) {
				remainingSeconds = "0" + remainingSeconds;
			}
			document.getElementById('maintenance').innerHTML = minutes + ":" + remainingSeconds;
			if (seconds == 0) {
				clearInterval(countdownTimer);
				document.getElementById('maintenance').innerHTML = "Buzz Buzz";
			} else {
				seconds--;
			}
		}
		var countdownTimer = setInterval('secondPassed()', 1000);
	}
} catch (err) {

}

//=========================================//
/*/*            05) Data Counter          */
//=========================================//

try {
	const counter = document.querySelectorAll('.counter-value');
	const speed = 2500; // The lower the slower

	counter.forEach(counter_value => {
		const updateCount = () => {
			const target = +counter_value.getAttribute('data-target');
			const count = +counter_value.innerText;

			// Lower inc to slow and higher to slow
			var inc = target / speed;

			if (inc < 1) {
				inc = 1;
			}

			// Check if target is reached
			if (count < target) {
				// Add inc to count and output in counter_value
				counter_value.innerText = (count + inc).toFixed(0);
				// Call function every ms
				setTimeout(updateCount, 1);
			} else {
				counter_value.innerText = target;
			}
		};

		updateCount();
	});
} catch (err) {

}

//=========================================//
/*/*            06) Datepicker js         */
//=========================================//

try {
	const start = datepicker('.start', {
		id: 1
	})
	const end = datepicker('.end', {
		id: 1
	})
} catch (err) {

}

//=========================================//
/*/*            07) Gallery filter js      */
//=========================================//

//try {
//   var Shuffle = window.Shuffle;
//
//   class Demo {
//       constructor(element) {
//           if(element){
//               this.element = element;
//               this.shuffle = new Shuffle(element, {
//                   itemSelector: '.picture-item',
//                   sizer: element.querySelector('.my-sizer-element'),
//               });
//
//               // Log events.
//               this.addShuffleEventListeners();
//               this._activeFilters = [];
//               this.addFilterButtons();
//           }
//       }
//
//       /**
//        * Shuffle uses the CustomEvent constructor to dispatch events. You can listen
//        * for them like you normally would (with jQuery for example).
//        */
//       addShuffleEventListeners() {
//           this.shuffle.on(Shuffle.EventType.LAYOUT, (data) => {
//               console.log('layout. data:', data);
//           });
//           this.shuffle.on(Shuffle.EventType.REMOVED, (data) => {
//               console.log('removed. data:', data);
//           });
//       }
//
//       addFilterButtons() {
//           const options = document.querySelector('.filter-options');
//           if (!options) {
//               return;
//           }
//
//           const filterButtons = Array.from(options.children);
//           const onClick = this._handleFilterClick.bind(this);
//           filterButtons.forEach((button) => {
//               button.addEventListener('click', onClick, false);
//           });
//       }
//
//       _handleFilterClick(evt) {
//           const btn = evt.currentTarget;
//           const isActive = btn.classList.contains('active');
//           const btnGroup = btn.getAttribute('data-group');
//
//           this._removeActiveClassFromChildren(btn.parentNode);
//
//           let filterGroup;
//           if (isActive) {
//               btn.classList.remove('active');
//               filterGroup = Shuffle.ALL_ITEMS;
//           } else {
//               btn.classList.add('active');
//               filterGroup = btnGroup;
//           }
//
//           this.shuffle.filter(filterGroup);
//       }
//
//       _removeActiveClassFromChildren(parent) {
//           const { children } = parent;
//           for (let i = children.length - 1; i >= 0; i--) {
//               children[i].classList.remove('active');
//           }
//       }
//   }
//
//   document.addEventListener('DOMContentLoaded', () => {
//       window.demo = new Demo(document.getElementById('grid'));
//   });
//} catch (err) {
//
//}

//=========================================//
/*/*            08) Tobii lightbox         */
//=========================================//

try {
	const tobii = new Tobii()
} catch (err) {

}

//=========================================//
/*/*            10) Fade Animation         */
//=========================================//

try {
	AOS.init({
		easing: 'ease-in-out-sine',
		duration: 1000
	});
} catch (err) {

}

//=========================================//
/*/* 11) Typed Text animation (animation) */
//=========================================//

try {
	var TxtType = function(el, toRotate, period) {
		this.toRotate = toRotate;
		this.el = el;
		this.loopNum = 0;
		this.period = parseInt(period, 10) || 2000;
		this.txt = '';
		this.tick();
		this.isDeleting = false;
	};

	TxtType.prototype.tick = function() {
		var i = this.loopNum % this.toRotate.length;
		var fullTxt = this.toRotate[i];
		if (this.isDeleting) {
			this.txt = fullTxt.substring(0, this.txt.length - 1);
		} else {
			this.txt = fullTxt.substring(0, this.txt.length + 1);
		}
		this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';
		var that = this;
		var delta = 200 - Math.random() * 100;
		if (this.isDeleting) {
			delta /= 2;
		}
		if (!this.isDeleting && this.txt === fullTxt) {
			delta = this.period;
			this.isDeleting = true;
		} else if (this.isDeleting && this.txt === '') {
			this.isDeleting = false;
			this.loopNum++;
			delta = 500;
		}
		setTimeout(function() {
			that.tick();
		}, delta);
	};

	function typewrite() {
		if (toRotate === 'undefined') {
			changeText()
		} else
			var elements = document.getElementsByClassName('typewrite');
		for (var i = 0; i < elements.length; i++) {
			var toRotate = elements[i].getAttribute('data-type');
			var period = elements[i].getAttribute('data-period');
			if (toRotate) {
				new TxtType(elements[i], JSON.parse(toRotate), period);
			}
		}
		// INJECT CSS
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid transparent}";
		document.body.appendChild(css);
	};
	window.onload(typewrite());
} catch (err) {

}

//=========================================//

//=========================================//
/*/*           14) Read More              */
//=========================================//

const ReadMore = (() => {
	let s;

	return {

		settings() {
			return {
				content: document.querySelectorAll('.js-read-more'),
				originalContentArr: [],
				truncatedContentArr: [],
				moreLink: "Read More",
				lessLink: "Read Less",
			}
		},

		init() {
			s = this.settings();
			this.bindEvents();
		},

		bindEvents() {
			ReadMore.truncateText();
		},

		/**
		 * Count Words
		 * Helper to handle word count.
		 * @param {string} str - Target content string.
		 */
		countWords(str) {
			return str.split(/\s+/).length;
		},

		/**
		 * Ellpise Content
		 * @param {string} str - content string.
		 * @param {number} wordsNum - Number of words to show before truncation.
		 */
		ellipseContent(str, wordsNum) {
			return str.split(/\s+/).slice(0, wordsNum).join(' ') + '...';
		},

		/**
		 * Truncate Text
		 * Truncate and ellipses contented content
		 * based on specified word count.
		 * Calls createLink() and handleClick() methods.
		 */
		truncateText() {

			for (let i = 0; i < s.content.length; i++) {
				//console.log(s.content)
				const originalContent = s.content[i].innerHTML;
				const numberOfWords = s.content[i].dataset.rmWords;
				const truncateContent = ReadMore.ellipseContent(originalContent, numberOfWords);
				const originalContentWords = ReadMore.countWords(originalContent);

				s.originalContentArr.push(originalContent);
				s.truncatedContentArr.push(truncateContent);

				if (numberOfWords < originalContentWords) {
					s.content[i].innerHTML = s.truncatedContentArr[i];
					let self = i;
					ReadMore.createLink(self)
				}
			}
			ReadMore.handleClick(s.content);
		},

		/**
		 * Create Link
		 * Creates and Inserts Read More Link
		 * @param {number} index - index reference of looped item
		 */
		createLink(index) {
			const linkWrap = document.createElement('span');

			linkWrap.className = 'read-more__link-wrap';

			linkWrap.innerHTML = `<a id="read-more_${index}"
                            class="read-more__link badge rounded-pill bg-primary mb-3"
                            style="cursor:pointer;">
                            ${s.moreLink}
                        </a>`;

			// Inset created link
			s.content[index].parentNode.insertBefore(linkWrap, s.content[index].nextSibling);

		},

		/**
		 * Handle Click
		 * Toggle Click eve
		 */
		handleClick(el) {
			const readMoreLink = document.querySelectorAll('.read-more__link');

			for (let j = 0, l = readMoreLink.length; j < l; j++) {

				readMoreLink[j].addEventListener('click', function() {

					const moreLinkID = this.getAttribute('id');
					let index = moreLinkID.split('_')[1];

					el[index].classList.toggle('is-expanded');

					if (this.dataset.clicked !== 'true') {
						el[index].innerHTML = s.originalContentArr[index];
						this.innerHTML = s.lessLink;
						this.dataset.clicked = true;
					} else {
						el[index].innerHTML = s.truncatedContentArr[index];
						this.innerHTML = s.moreLink;
						this.dataset.clicked = false;
					}
				});
			}
		},

		/**
		 * Open All
		 * Method to expand all instances on the page.
		 * Will probably be useful with a destroy method.
		 */
		openAll() {
			const instances = document.querySelectorAll('.read-more__link');
			for (let i = 0; i < instances.length; i++) {
				content[i].innerHTML = s.truncatedContentArr[i];
				instances[i].innerHTML = s.moreLink;
			}
		}
	}
})();


//export default ReadMore;

ReadMore.init();

//=========================================//
/*/*           15) Lazy Load              */
//=========================================//

$(function() {
    $('.lazy').Lazy();
});

//=========================================//
/*/*        16) Abbreviate Number          */
//=========================================//

function abbreviateNumber(num) {
	num = parseInt(num)
	var fixed = 0
	if (num === null) {
		return null;
	} // terminate early
	if (num === 0) {
		return '0';
	} // terminate early
	fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
	var b = (num).toPrecision(2).split("e"), // get power
		k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
		c = k < 1 ? (num).toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
		d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
		e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
	return e;
}

var abbreviatedNumberElement = document.getElementsByClassName('abnum');
for (let i = 0; i < abbreviatedNumberElement.length; i++) {
	var abbreviate = abbreviatedNumberElement[i].getAttribute("abbreviate")
	if (abbreviate == null) {
		var abbreviate = abbreviatedNumberElement[i].dataset.abbreviate;
	}
	abbreviatedNumber = abbreviateNumber(abbreviate);
	abbreviatedNumberElement[i].innerHTML = abbreviatedNumber;
}


//=========================================//
/*/*       17) Follow and Unfollow         */
//=========================================//

function followFunction(element, user_name) {
	let csrfToken_send = $('meta[name=csrf-token]').attr('content');
	var followerCountElement = element.parentNode.parentNode.parentNode.parentNode.getElementsByClassName("follower-count")[0];
	var followerCount = followerCountElement.dataset.abbreviate;

	if (element.innerHTML == "Follow") {
		$.ajax({
			type: "POST",
			url: "/util/follow",
			data: {
				"user_name": user_name,
			},
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-CSRFToken', csrfToken_send);
			},
			success: function(data) {
				followerCountElement.dataset.abbreviate = parseInt(followerCount) + 1
				followerCountElement.innerHTML = abbreviateNumber(parseInt(followerCount) + 1)

				element.classList.remove("btn-dark")
				element.innerHTML = 'Following';
				element.classList.add("btn-outline-light")
			},
			error: function(data) {
				window.location.href = data.responseJSON;
			}
		});
	} else {
		$.ajax({
			type: "POST",
			url: "/util/unfollow",
			data: {
				"user_name": user_name,
			},
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-CSRFToken', csrfToken_send);
			},
			success: function(data) {
				followerCountElement.dataset.abbreviate = parseInt(followerCount) - 1
				followerCountElement.innerHTML = abbreviateNumber(parseInt(followerCount) - 1)

				element.classList.remove("btn-outline-light")
				element.innerHTML = 'Follow';
				element.classList.add("btn-dark")
			},
		});
	}
}

//=========================================//
/*/*         18) Place Footer             */
//=========================================//

function placeFooter() {
	if ($(document.body).height() < $(window).height()) {
		$("#footer").css({
			position: "absolute",
			bottom: "0px"
		});
		$("#footer").removeClass("d-none")
	} else {
		$("#footer").css({
			position: ""
		});
		$("#footer").removeClass("d-none")
	}
}
placeFooter();

//=========================================//
/*/*       19) Comment On Input           */
//=========================================//

$('#product_comment_area').on('input', function() {
	if ($("#username_java").length === 0) {
		$('#submit_product_comment').trigger('click');
	}
});

//=========================================//
/*/*           20) Pluralize              */
//=========================================//

function pluralize(word, count) {
	if (count === 1) return word;

	return `${word}s`;
}

//=========================================//
/*/*            21) Feather               */
//=========================================//

//Feather icon
feather.replace();

//=========================================//
/*/*        22) Notification Loader       */
//=========================================//

//var theDropdown = document.getElementById('desktop_notification')
//if (typeof(theDropdown) != 'undefined' && theDropdown != null) {
//	theDropdown.addEventListener('show.bs.dropdown', function() {
//		let csrfToken = $('meta[name=csrf-token]').attr('content');
//
//		$.ajax({
//			type: "POST",
//			url: "/notifications",
//			beforeSend: function(xhr) {
//				xhr.setRequestHeader('X-CSRFToken', csrfToken);
//			},
//			success: function(data) {
//				$('#notification_display').empty();
//				$.each(data, function(index, value) {
//					var paragraph = '<a href="' + value.action_target + '" class="d-flex px-4 pb-4 align-items-center mt-4"> \
//                        <img src="' + value.image + '" class="rounded" style="max-height: 70px;" alt=""> \
//                        <div class="flex-1 text-start ms-3"> \
//                            <h6 class="text-muted mb-0">' + value.title + '</h6> \
//                            <p class="text-dark mb-0">' + value.description + '</p> \
//                            <small class="text-muted mb-0">' + moment(value.timestamp).fromNow() + '</small> \
//                        </div> \
//                    </a>';
//					$('#notification_display').append(paragraph);
//				});
//			},
//			error: function(data) {
//				window.location.href = data.responseJSON;
//			}
//		});
//
//	})
//
//	var mobileNotificationsDropdown = document.getElementById('mobile_notification')
//	mobileNotificationsDropdown.addEventListener('show.bs.dropdown', function() {
//		let csrfToken = $('meta[name=csrf-token]').attr('content');
//		$.ajax({
//			type: "POST",
//			url: "/notifications",
//			beforeSend: function(xhr) {
//				xhr.setRequestHeader('X-CSRFToken', csrfToken);
//			},
//			success: function(data) {
//				$('#mobile_notification_display').empty();
//				$.each(data, function(index, value) {
//					var paragraph = '<a href="' + value.action_target + '" class="d-flex align-items-center mt-4"> \
//                        <img src="' + value.image + '" class="rounded" style="max-height: 70px;" alt=""> \
//                        <div class="flex-1 text-start ms-3"> \
//                            <h6 class="text-muted mb-0">' + value.title + '</h6> \
//                            <p class="text-dark mb-0">' + value.description + '</p> \
//                            <small class="text-muted mb-0">' + moment(value.timestamp).fromNow() + '</small> \
//                        </div> \
//                    </a>';
//					$('#mobile_notification_display').append(paragraph);
//				});
//			},
//			error: function(data) {
//				window.location.href = data.responseJSON;
//			}
//		});
//
//	})
//}

//=========================================//
/*/*   23) Username Availability Checker   */
//=========================================//

$(document).ready(function(){
    $("#txt_username").keyup(function(){
        var username = $(this).val().trim();
        var usernameRegex = /^(?=.{4,20}$)(?:[a-zA-Z\d]+(?:(?:\|-|_)[a-zA-Z\d])*)+$/;
        let csrfToken = $('meta[name=csrf-token]').attr('content');
        if(username != ''){
            var validUsername = username.match(usernameRegex);
            if(validUsername == null){
                $('#uname_response').html("<span class='text-danger'>Invalid username.</span>");
            }else{
                $("#uname_response").html("");
            }
                // else {
                //    $.ajax({
                //        url: '/username-validation',
                //        type: 'post',
                //        data: {username: username},
                //        beforeSend: function (xhr) {
                //          xhr.setRequestHeader('X-CSRFToken', csrfToken);
                //        },
                //        success: function(response){
                //            $('#uname_response').html(response);
                //         }
                //    });
                //}
        }else{
            $("#uname_response").html("");
        }
    });
});

//=========================================//
/*/*         24) Field Validation         */
//=========================================//

(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

function needs_validation(){
	(function () {
	  'use strict'
	
	  // Fetch all the forms we want to apply custom Bootstrap validation styles to
	  var forms = document.querySelectorAll('.needs-validation')
	
	  // Loop over them and prevent submission
	  Array.prototype.slice.call(forms)
		.forEach(function (form) {
		  form.addEventListener('submit', function (event) {
			if (!form.checkValidity()) {
			  event.preventDefault()
			  event.stopPropagation()
			}
	
			form.classList.add('was-validated')
		  }, false)
		})
	})()
}

//=========================================//
/*/*    25) Disable Form If No Change      */
//=========================================//

$('#username_email_bio_form').each(function(){
  $(this).data('serialized', $(this).serialize());
}).on('change input', function(){
  $(this).find('input:submit').attr('disabled', $(this).serialize() == $(this).data('serialized'));
});

$('#password_reset_form').each(function(){
  $(this).data('serialized', $(this).serialize());
}).on('change input', function(){
  $(this).find('input:submit').attr('disabled', $(this).serialize() == $(this).data('serialized'));
});

//=========================================//
/*/*      26) Cookies Policy               */
//=========================================//

try {
    /* common fuctions */
    function el(selector) { return document.querySelector(selector) }
    function els(selector) { return document.querySelectorAll(selector) }
    function on(selector, event, action) { els(selector).forEach(e => e.addEventListener(event, action)) }
    function cookie(name) {
        let c = document.cookie.split('; ').find(cookie => cookie && cookie.startsWith(name+'='))
        return c ? c.split('=')[1] : false;
    }

    /* popup button hanler */
    on('.cookie-popup button', 'click', () => {
        el('.cookie-popup').classList.add('cookie-popup-accepted');
        window.localStorage.setItem('cookie-accepted', true)
        let csrfToken = $('meta[name=csrf-token]').attr('content');
        $.ajax({
			type: "POST",
			url: "/cookie-accepted",
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-CSRFToken', csrfToken);
			},
		});

    });

    /* popup init hanler */
    if (window.localStorage.getItem("cookie-accepted")){
        el('.cookie-popup').classList.add('cookie-popup-accepted');
    }

} catch (error) {

}

//=========================================//
/*/*      21) Format Time                 */
//=========================================//
if (document.getElementsByClassName('back-to-home').length === 0){
    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s:  '1s',
        ss: '%ss',
        m:  '1m',
        mm: '%dm',
        h:  '1h',
        hh: '%dh',
        d:  '1d',
        dd: '%dd',
        M:  '1M',
        MM: '%dM',
        y:  '1Y',
        yy: '%dY'
      }
    })
}

//=========================================//
/*/*      22) Read Notifications           */
//=========================================//
function read_notification(){
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    $.ajax({
        type: "POST",
        url: "/read_notifications",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
        },
        success: function(data) {
            $("#notifications_alert").addClass("d-none");
        },
        error: function(data) {
            if (data.status == 401 || data.status == 301){
                window.location.href = data.responseJSON;
            }
        }
    });
};

//=========================================//
/*/*      23) Delete Account               */
//=========================================//


function sendPassword(){
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    var password = $('input[name="password-field"]').val();
    if (password.length > 6) {
        $.ajax({
            type: "POST",
            url: '/delete-account-password-verification',
            data: {
                "password": password,
            },
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
                $('#password_failed').addClass('d-none');
            },
            success: function(data) {
                $("#password_verification").addClass("d-none");
                $("#opt_verification").removeClass("d-none");
            },
            error: function(data){
                if (data.status == 403) {
                    $('#password_failed').removeClass('d-none');
                    $('#password_failed').html("Invalid password!");
                } else {
                    window.location.href=data.responseJSON;
                }
            },
        });
    } else {
        $("#password_failed").removeClass("d-none");
        $('#password_failed').html("Invalid password!");
    };

}


function sendOTP(){
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    var otp_code = $('input[name="otp-field"]').val();
    if (otp_code.length > 4) {
        $.ajax({
            type: "POST",
            url: '/delete-account-code-verification',
            data: {
                "otp_key": otp_code,
            },
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
                $('#otp_failed').addClass('d-none');
            },
            success: function(data) {
                window.location.href=data.responseJSON;
            },
            error: function(data){
                if (data.status == 403) {
                    $('#otp_failed').removeClass('d-none');
                    $('#otp_failed').html("Invalid code!");
                } else {
                    window.location.href=data.responseJSON;
                }
            },
        });
    } else {
        $('#otp_failed').removeClass('d-none');
        $('#otp_failed').html("Invalid code!");
    };

}

//=========================================//
/*/*     23) Register Visitor             */
//=========================================//

// check if visitor session cookie is present
function register_visitor(){
    // Spam stopping code
    const fpPromise = import('https://fpcdn.io/v3/4iXxdEgocEd3iHnDxRxp')
        .then(FingerprintJS => FingerprintJS.load({apiKey: '4iXxdEgocEd3iHnDxRxp', endpoint: 'https://resources.abpoll.com'}))

    // Get the visitor identifier when you need it.
    fpPromise
        .then(fp => fp.get({extendedResult: true}))
        .then(result => {
            // This is the visitor identifier:
            const visitorId = result.visitorId

            $.ajax({
                type: "POST",
                url: "/util/register-user",
                data: JSON.stringify(result),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
                },
                success: function(data) {
                    window.localStorage.setItem('user-registered', true)
                    document.querySelector('meta[name="is_user_registered"').setAttribute("content", '1')
                },
                error: function(data) {
                    //console.log("error");
                }
            });
    })
}

if (parseInt($('meta[name=is_user_registered]').attr('content')) === 0) {
    register_visitor()
}

// 1.2 => Password Visibility

function activatePassVisibility() {
    var passWord = document.getElementById("password-visibility");

    if (passWord) {
        passWord.addEventListener('click', passwordFunction);
    }
}
activatePassVisibility()

function passwordFunction() {
    var passWord = document.getElementById("password-visibility");

    var passInput = document.getElementById("psw-input");
    passWord.classList.toggle("active");

    if (passInput.type === "password") {
        passInput.type = "text";
    } else {
        passInput.type = "password";
    }
}

function passwordStrengthMeter(e){const t=document.createElement("style");document.body.prepend(t),t.innerHTML=`\n\t\t${e.containerElement} {\n\t\t\theight: ${e.height||4}px;\n\t\t\tbackground-color: #e2e9fe;\n\t\t\tposition: relative;\n\t\t\toverflow: hidden;\n\t\t\tborder-radius: ${e.borderRadius.toString()||2}px;\n\t\t}\n    ${e.containerElement} .password-strength-meter-score {\n      height: inherit;\n      width: 0%;\n      transition: .5s ease;\n      background: ${e.colorScore1||"#ea4c62"};\n    }\n    ${e.containerElement} .password-strength-meter-score.psms-25 {width: 25%; background: ${e.colorScore1||"#ea4c62"};}\n    ${e.containerElement} .password-strength-meter-score.psms-50 {width: 50%; background: ${e.colorScore2||"#f1b10f"};}\n    ${e.containerElement} .password-strength-meter-score.psms-75 {width: 75%; background: ${e.colorScore3||"#1787b8"};}\n    ${e.containerElement} .password-strength-meter-score.psms-100 {width: 100%; background: ${e.colorScore4||"#2ecc4a"};}`;const n=document.getElementById(e.containerElement.slice(1));n.classList.add("password-strength-meter");let s=document.createElement("div");s.classList.add("password-strength-meter-score"),n.appendChild(s);const r=document.getElementById(e.passwordInput.slice(1));let o="";r.addEventListener("keyup",function(){o=this.value,function(e){switch(e){case 1:s.className="password-strength-meter-score psms-25",c&&(c.textContent=d[1]||"Too simple"),n.dispatchEvent(new Event("onScore1",{bubbles:!0}));break;case 2:s.className="password-strength-meter-score psms-50",c&&(c.textContent=d[2]||"Simple"),n.dispatchEvent(new Event("onScore2",{bubbles:!0}));break;case 3:s.className="password-strength-meter-score psms-75",c&&(c.textContent=d[3]||"That's OK"),n.dispatchEvent(new Event("onScore3",{bubbles:!0}));break;case 4:s.className="password-strength-meter-score psms-100",c&&(c.textContent=d[4]||"Great password!"),n.dispatchEvent(new Event("onScore4",{bubbles:!0}));break;default:s.className="password-strength-meter-score",c&&(c.textContent=d[0]||"No data"),n.dispatchEvent(new Event("onScore0",{bubbles:!0}))}}(i())});let a=e.pswMinLength||8,c=e.showMessage?document.getElementById(e.messageContainer.slice(1)):null,d=void 0===e.messagesList?["No data","Too simple","Simple","That's OK","Great password!"]:e.messagesList;function i(){let e=0,t=new RegExp("(?=.*[a-z])"),n=new RegExp("(?=.*[A-Z])"),s=new RegExp("(?=.*[0-9])"),r=new RegExp("(?=.{"+a+",})");return o.match(t)&&++e,o.match(n)&&++e,o.match(s)&&++e,o.match(r)&&++e,0===e&&o.length>0&&++e,e}return c&&(c.textContent=d[0]||"No data"),{containerElement:n,getScore:i}}

// => Password Meter Activation
function activatePassMeter(){
    var passwordInputId = document.getElementById("psw-input");
    var pswmeter = document.getElementById("pswmeter");
    if (pswmeter){
        pswmeter.style.display = "none";
        passwordInputId.addEventListener("keyup", function(){
            pswmeter.style.display = "block";
        });
        var passwordStrength = passwordStrengthMeter({
            containerElement: "#pswmeter",
            passwordInput: "#psw-input",
            height: 4,
            borderRadius: 4,
            pswMinLength: 10
        });

    }
}
activatePassMeter()

var intId = document.getElementById("internetStatus");
var sucText = "Your internet connection is back.";
var failText = "Oops! No internet connection.";
var sucCol = "#2eca8b";
var failCol = "#e43f52";

if(intId) {
    if(window.navigator.onLine) {
        intId.innerHTML = sucText;
        intId.style.display = "none";
        intId.style.backgroundColor = sucCol;
    } else {
        intId.innerHTML = failText;
        intId.style.display = "block";
        intId.style.backgroundColor = failCol;
    }

    window.addEventListener("online", function() {
        intId.innerHTML = sucText;
        intId.style.display = "block";
        intId.style.backgroundColor = sucCol;
        setTimeout(function() {
            var fade2Out = setInterval(function () {
                if (!intId.style.opacity) {
                    intId.style.opacity = 1;
                }
                if (intId.style.opacity > 0) {
                    intId.style.opacity -= 0.1;
                } else {
                    clearInterval(fade2Out);
                    intId.style.display = "none";
                }
            }, 20);
        }, 5000);
    });

    window.addEventListener("offline", function() {
        intId.innerHTML = failText;
        intId.style.display = "block";
        intId.style.backgroundColor = failCol;
    });
}


// Service Worker Register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
//                console.log('registration succeeded')
            })
            .catch(err => {
//                console.log('registration failed')
            });
    });
}

//=========================================//
/*/* 10. Update Balance                   */
//=========================================//
function update_balance(new_balance){
    new_balance = parseInt(new_balance)
    if (new_balance !== NaN){
        $(".balance").each(function(){
            $(this).html(new_balance)
        })
        max_coins = new_balance
    }
}