// Render map
mapboxgl.accessToken = 'pk.eyJ1IjoiZG9yY3kiLCJhIjoiY2w2azV4c3Z4MWI2MTNicnA3ZTJiY3Y4NiJ9.Z0uQ34TubqmQxKJkYSj6ow';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/dorcy/cl6l4ks3y007416p9zl8r9jh5', // style URL
    center: [-97.2, 32.8], // starting position [lng, lat]
    zoom: 1, // starting zoom
    projection: 'mercator' // display the map as a 3D globe https://docs.mapbox.com/mapbox-gl-js/example/projections/
});
map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

// Render topics
function insights_render_topics_dropdown() {
    $.ajax({
        type: "GET",
        url: "/util/analytics/api/v1/topic/list",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {
            for(var i = 0; i < data.length; i++){
                var newOption = document.createElement("option");
                var newOptionValue = document.createTextNode(data[i]);
                newOption.appendChild(newOptionValue);
                var topicDropdown = document.querySelector("select[name=topic]");
                topicDropdown.appendChild(newOption);
            }
        },
        error: function(data) {
            location.reload();
        }
    });
}

// render question
function insights_clear_location_input(){
    var input = $("select[name=location]")

    input.children().each(function(){
        if($(this).prop("value") != "disabled"){
            $(this).remove();
        } else {
            $(this).prop("selected", true);
        }
    })
    input.prop("disabled", true);
}

function insights_clear_question_input(input){
    // loop through each option and delete it
    input.children().each(function(){
        if($(this).prop("value") != "disabled"){
            $(this).remove();
        } else {
            $(this).prop("selected", true);
        }

    })
    insights_clear_location_input()
    // reset the go button
    insights_render_go_button(true)
}

function insights_render_questions(selected_topic){
    $.ajax({
        type: "POST",
        url: "/util/analytics/api/v1/questions/list",
        data: {
            "topic": selected_topic,
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {
            for(var i = 0; i < data.length; i++){
                var newOption = document.createElement("option");
                var newOptionValue = document.createTextNode(data[i]["title"]);
                newOption.value = data[i]["id"]
                newOption.dataset.question = data[i]["question"]
                newOption.dataset.a_text = data[i]["a_text"]
                newOption.dataset.b_text = data[i]["b_text"]
                newOption.appendChild(newOptionValue);
                var topicDropdown = document.querySelector("select[name=question]");
                topicDropdown.appendChild(newOption);
            }
        },
        error: function(data) {
            location.reload();
        }
    });
}

function insights_render_questions_input() {
    // retrieve the value of the selected topic
    var selected_topic = $("select[name=topic]").val();

    // display the url and change the href of the view topic
    var view_topic = document.getElementById('insights-link-topic');
    view_topic.classList.remove('d-none');
    view_topic.href = "/u/" + selected_topic;
    //    view_topic.parentNode.classList.remove('mb-3');

    // get the question element and change from disabled to enabled
    var input = $("select[name=question]")
    input.prop("disabled", false);

    insights_clear_question_input(input)
    insights_render_questions(selected_topic)
}

// Location portion
function post_request_locations(question_id){
    let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});

    $.ajax({
        type: "POST",
        url: "/util/analytics/api/v1/locations",
        data: {
            "question_id": question_id,
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {
            var newOption = document.createElement("option");
            var newOptionValue = document.createTextNode("All locations");
            newOption.value = "all"
            newOption.appendChild(newOptionValue);
            var topicDropdown = document.querySelector("select[name=location]");
            topicDropdown.appendChild(newOption);

            for(var i = 0; i < data.length; i++){
                try {
                    var newOption = document.createElement("option");
                    var newOptionValue = document.createTextNode(regionNames.of(data[i]));
                    newOption.value = data[i]
                    newOption.appendChild(newOptionValue);
                    var topicDropdown = document.querySelector("select[name=location]");
                    topicDropdown.appendChild(newOption);
                } catch (error){}
            }
        },
        error: function(data) {
            location.reload();
        }
    });
}

function insights_render_location_input(element){
    insights_clear_location_input()

    var input = $("select[name=location]")
    input.prop("disabled", false);
    // render the locations input
    insights_render_go_button(false)
    // get the question_id
    //    var question_id = element.value
    post_request_locations(element.value)
}

// submit button portion
function insights_render_go_button(status) {
    // status = false, means enabled. status = true means disabled
    var go_button = $("#go_button")
    go_button.prop("disabled", status)
}

// render explainers
function insights_sidebar_percentages(a_votes, b_votes){
    var total_votes = parseInt(a_votes) + parseInt(b_votes)
    var a_percentage = Math.round((parseInt(a_votes) / total_votes) * 100)
    var b_percentage = Math.round((parseInt(b_votes) / total_votes) * 100)

    document.getElementById("insights-sidebar-a-percentage").innerHTML = a_percentage;
    document.getElementById("insights-sidebar-b-percentage").innerHTML = b_percentage;
    document.getElementById("insights-sidebar-total-votes").innerHTML = total_votes;

    document.getElementById("insights_info_section").classList.remove("d-none");
    document.getElementById("insights_resources_section").classList.remove("d-none");
}

function insights_sidebar_text(title, a_option, b_option, post_id){
    document.getElementById("insights-sidebar-question").innerHTML = title;
    document.getElementById("insights-sidebar-a-option").innerHTML = a_option;
    document.getElementById("insights-sidebar-b-option").innerHTML = b_option;

    var selected_topic = $("select[name=topic]").val();
    document.getElementById("topic-name").innerHTML = selected_topic;

    var url_part_one = "/u/" + selected_topic + "/sort-votes?poll_id=" + post_id;
    document.getElementById("insights-sidebar-a-link").href = url_part_one + "&choice=0";
    document.getElementById("insights-sidebar-b-link").href = url_part_one + "&choice=1";
}

// retrieve votes


function getVotes(post_id, location) {
    var url = "/util/analytics/api/v1/votes/pins";
    var insights_data;
    $.ajax({
        url: url,
        type: "POST",
        data: {
            "post_id": post_id,
            "location": location
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(response) {
            insights_data = response;
            plotVotes(insights_data);
        },
        error: function(xhr, status, error) {
            location.reload();
        }
    });
    return insights_data
}

function plotVotes(data) {
    insights_sidebar_percentages(data["a_votes"], data["b_votes"])

    var voteData = data["output"];
    var points = [];
    for (var i = 0; i < voteData.length; i++) {
        var lat = voteData[i].lat;
        var lng = voteData[i].long;
        var vote = voteData[i].vote_id;
        var user = voteData[i].user_id;
        var url = voteData[i].url;

        var point = {
            "type": "Feature",
            "properties": {
                "vote": vote,
                "user": user,
                "url": url
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            }
        };
        points.push(point);
    }

    map.addLayer({
        "id": "votes",
        "type": "circle",
        "source": {
            "type": "geojson",
            "data": {
            "type": "FeatureCollection",
            "features": points
            }
        },
        "paint": {
            "circle-radius": 10,
            "circle-opacity": 0.6,
            "circle-color": {
                "property": "vote",
                "type": "categorical",
                "stops": [
                    [0, "#47AD9F"],
                    [1, "#E13E2D"]
                ]
            }
        }
    });

    map.on('click', 'votes', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var user_id = e.features[0].properties.user;
        var vote_id = e.features[0].properties.vote;
        var url = e.features[0].properties.url;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('User ID: <a href="'+ url +'" target="_blank">View Other votes</a><br>Vote: ' + vote_id)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'votes', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'votes', function () {
        map.getCanvas().style.cursor = '';
    });

}


// catch form submission

function insights_form_submission(form) {
    if (map.getLayer("votes")) {
      map.removeLayer("votes");
      map.removeSource('votes');
    }

    try {
        var questionDropdown = document.querySelector("select[name=question]");
        var selectedOption = questionDropdown.options[questionDropdown.selectedIndex];
        var question = selectedOption.dataset.question;
        var a_text = selectedOption.dataset.a_text;
        var b_text = selectedOption.dataset.b_text;
        var post_id = selectedOption.value;
        var location = document.querySelector("select[name=location]").value;

        insights_sidebar_text(question, a_text, b_text, post_id)

        getVotes(post_id, location)
    }
    catch(err){
        console.log(err)
    }
    return false;
}

// run the functions when the window loads
insights_render_topics_dropdown()

function toggle_analytics(){
    if (document.getElementsByClassName("body-height")[0].classList.contains("d-none")) {
        document.getElementsByClassName("body-height")[0].classList.remove("d-none");
        document.getElementById("toggle_analytics").classList.remove("mdi-chevron-right");
        document.getElementById("toggle_analytics").classList.add("mdi-chevron-left");
        document.getElementsByClassName("switcher-btn")[0].classList.add("m-300");

        if ($(window).width() > 1024){
            resizeMapMapBox(600);
        } else {
            resizeMapMapBox(300);
        }
        console.log("unclicked");
    } else {
        document.getElementsByClassName("body-height")[0].classList.add("d-none");
        document.getElementById("toggle_analytics").classList.remove("mdi-chevron-left");
        document.getElementById("toggle_analytics").classList.add("mdi-chevron-right");
        document.getElementsByClassName("switcher-btn")[0].classList.remove("m-300");

        if ($(window).width() > 1024){
            resizeMapMapBox(300);
        } else {
            resizeMapMapBox(0);
        }
        console.log("clicked");
    }
}

function resizeMapMapBox(subWid){
    var newWidth = `calc(100% - ${subWid}px)`;
    console.log(newWidth)
    var mapBox = document.getElementById("map");
    mapBox.style.width = newWidth;
    document.getElementsByClassName("maps-wrapper")[0].style.width = newWidth;
    map.resize()
}
