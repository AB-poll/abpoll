
/*********************************/
/*         INDEX                 */
/*================================
 *     01.  Tiny Slider          *
 *     02.  Countdown Js         * (For Comingsoon pages)
 *     03.  Maintenance js       * (For Maintenance page)
 *     04.  Data Counter         *
 *     05.  Gallery filter js    * (For Portfolio pages)
 *     06.  Tobii lightbox       * (For Portfolio pages)
 *     07.  CK Editor            * (For Compose mail)
 *     08.  Validation Form      *
 *     09.  Switcher Pricing Plan*
 *     10.  Charts               *
 ================================*/

//=========================================//
/*/*            04) Data Counter           */
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
/*/*      10) Charts                       */
//=========================================//
//Chart One
function analytics_render_charts(){

    $.ajax({
        type: "GET",
        url: "/v1/vote-statistics/calendar",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {
            try{
                var options = {
                    chart: {
                        height: 360,
                        type: 'area',
                        width: '100%',
                        stacked: true,
                        toolbar: {
                          show: false,
                          autoSelected: 'zoom'
                        },
                    },
                    colors: ['#2f55d4', '#2eca8b'],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'smooth',
                        width: [1.5, 1.5],
                        dashArray: [0, 4],
                        lineCap: 'round',
                    },
                    grid: {
                      padding: {
                        left: 0,
                        right: 0
                      },
                      strokeDashArray: 3,
                    },
                    markers: {
                      size: 0,
                      hover: {
                        size: 0
                      }
                    },
                    series: [
                    {
                        name: 'Votes',
                        data: data.values,
                    },
    //                {
    //                    name: 'Revenue',
    //                    data: [0, 45, 10, 75, 35, 94, 40, 115, 30, 105, 65, 110],
    //                }
                    ],
                    xaxis: {
                        type: 'month',
                        categories: data.keys,
                        axisBorder: {
                          show: true,
                        },
                        axisTicks: {
                          show: true,
                        },
                    },
                    fill: {
                      type: "gradient",
                      gradient: {
                        shadeIntensity: .8,
                        opacityFrom: 0.3,
                        opacityTo: 0.2,
                        stops: [0, 80, 100]
                      }
                    },

                    tooltip: {
                        x: {
                            format: 'dd/MM/yy HH:mm'
                        },
                    },
                    legend: {
                      position: 'bottom',
                      offsetY: 0,
                    },
                  }

                  var chart = new ApexCharts(
                    document.querySelector("#dashboard-display"),
                    options
                  );

                  chart.render();

            } catch (error) {

            }
        },
        error: function(data) {
            window.location.href = data.responseJSON;
        }
    });

    $.ajax({
        type: "GET",
        url: "/v1/vote-statistics/month",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {

            //Chart two
            try {
                var options2 = {
                    chart: {
                        type: 'bar',
                        height: 100,
                        sparkline: {
                            enabled: true
                        }
                    },
                    colors: ["#2f55d4"],
                    plotOptions: {
                        bar: {
                            columnWidth: '30%'
                        }
                    },
                    series: [{
                        data: data.values
                    }],
                    xaxis: {
                        crosshairs: {
                            width: 1
                        },
                    },
                    tooltip: {
                        fixed: {
                            enabled: false
                        },
                        x: {
                            show: false
                        },
                        y: {
                            title: {
                                formatter: function (seriesName) {
                                    return ''
                                }
                            }
                        },
                        marker: {
                            show: false
                        }
                    }
                }
                new ApexCharts(document.querySelector("#sale-chart"), options2).render();
            } catch (error) {

            }

            document.getElementsByClassName("total-votes-30-days")[0].innerHTML = data.total;
        },
        error: function(data) {
            window.location.href = data.responseJSON;
        }
    });

    $.ajax({
        type: "GET",
        url: "/v1/vote-statistics/topics",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {

            //Chart Three
            try {
                var options = {
                    chart: {
                        height: 320,
                        type: 'donut',
                    },
                    series: data.values,
                    labels: data.keys,
                    legend: {
                        show: true,
                        position: 'bottom',
                        offsetY: 0,
                    },
                    dataLabels: {
                        enabled: true,
                        dropShadow: {
                            enabled: false,
                        }
                    },
                    stroke: {
                        show: true,
                        colors: ['transparent'],
                    },
                    // dataLabels: {
                    //     enabled: false,
                    // },
                    theme: {
                        monochrome: {
                            enabled: true,
                            color: '#2f55d4',
                        }
                    },
                    responsive: [{
                        breakpoint: 768,
                        options: {
                            chart: {
                                height: 400,
                            },
                        }
                    }]
                }
                var chart = new ApexCharts(document.querySelector("#top-product-chart"), options);
                chart.render();
            } catch (error) {

            }
        },
        error: function(data) {
            window.location.href = data.responseJSON;
        }
    });

}

if (document.getElementsByClassName("total-votes-30-days")[0]){
    analytics_render_charts()
}

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
/*/*   18) Submit Prediction Winner        */
//=========================================//


function submit_winner(element, index){
    var winner_event_id = parseInt($("#prediction-modal").first().data("id"))
    var winner_index_id = parseInt(index)
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    if ( winner_event_id !== NaN && winner_event_id > 0 && winner_index_id !== NaN){

        $.ajax({
            type: "PUT",
            url: "/v1/predict/end-event",
            data: {
                "event_id": winner_event_id,
                "index": winner_index_id
            },
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
            },
            success: function(response){
                show_winner(winner_index_id);
                document.getElementsByClassName("predict-live-display")[0].innerHTML = "Ended";
                $(`.trigger-${event.id}`).first().data("status", 2);
                $(`.trigger-${event.id}`).first().data("winning_index", index);
                update_balance(response.balance);
            }
        });
    }
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
