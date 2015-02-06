// Global vars
var restaurant_data = {}

var markers = {}

var infowindow = new google.maps.InfoWindow({
  content: '',
});

var view_port_dim;

var restaurant_item_template;

$(function() {
  $main_container = $('.main_container');
  $input_panel = $('#input_panel');
  $info_panel = $('#info_panel');
  $results = $('#results')
  $map_canvas = $('#map-canvas');
  $spinner = $('#spinner');
  $results_text = $('.results_text');

  $main_container.click(function(event) {
    event.stopPropagation();
    console.log('poo');
  })
  
  // Set container dimensions
  view_port_dim = {x: $(window).width(), y: $(window).height()};
  $main_container.height(view_port_dim.y);

  // Initialize google maps
  var map = initialize_map()
  var infowindow = new google.maps.InfoWindow({
    content: ''
  });

  var $selected_result = null;

  // ----------------- Handlebars -----------------

  // restaurant_item_template = Handlebars.compile($('#restaurant_item_template').html());

  // ----------------- Event handlers -----------------

  $('#loc_input_form').submit(function(event) {
    event.preventDefault();
    var input = $('#loc_input_field').val();
    console.log('finding nearest');
    find_nearest(input, map, infowindow);
  });

  $results.on('click', 'li', function(event) {
    // highlight this selection
    if($selected_result) {
      $selected_result.css({'bordesr': 'none'});
    }
    $(this).css({'borsder': '1px solid #ffcc66'});

    $selected_result = $(this);
    var name = $(this).data('name');
    open_info(markers[name], map, infowindow);

    $selected_result.find('.restaurant_item .details').slideToggle('fast');
  });

});

// ------------------------ Functions ------------------------

function initialize_map() {
  var mapOptions = {
    zoom: 15
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: google.maps.Animation.DROP,
        title: 'Your location',
      });

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: '<div class="marker_label">' + marker.title + '</div>'
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }

  return map;
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }
  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };
  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

function find_nearest(input, map, infowindow) {
  $spinner.show(500);
  $.ajax({
    type: 'POST',
    url: '/find_restaurants',
    data: {input_location: input},
  }).done(function(data) {
    $spinner.hide(500);
    console.log(data);
    if(data) {
      process_results(data);
      place_markers(data, map, infowindow);
    } else {
      console.log('Invalid response');
    }
  }).fail(function(error, status) {
  });
}

function process_results(data) {
  var results = data['results']

  $results.html('');
  for(var restaurant in results) {
    // restaurant_data[restaurant] = results[restaurant]
    restaurant_data = results[restaurant];

    var $entry = $('<li></li>')
      .addClass('list-group-item').data('name', restaurant);

    var $details = $('<div></div>').addClass('restaurant_item').html(
      '<span>' + restaurant + '</span>' +
      '<div class="details">' +
      '<div><b>Address:</b>' + restaurant_data['loc'] + '</div>' +
      '<div><b>Coordinates:</b>' + restaurant_data['latlng']['lat'] + ',' + restaurant_data['latlng']['lng'] + '</div>' +
      '<div><b>Distance:</b>' + restaurant_data['dist'] + '</div></div>')
    $entry.html($details);

    // $results.append(restaurant_item_template({
    //   name: restaurant,
    //   loc: restaurant_data['loc'],
    //   lat: restaurant_data['latlng']['lat'],
    //   lng: restaurant_data['latlng']['lng'],
    //   dist: restaurant_data['dist']
    // }));
    $results.append($entry);
  }

  // Display results
  $info_panel.css({opacity: 0}).show().animate({opacity: 1}, 500);
  $results.css({'max-height':
    (view_port_dim.y - $results_text.offset().top - $results_text.height() - 80) + 'px'})
}

function place_markers(data, map, infowindow) {
  var results = data['results'];
  for(var restaurant in results) {
    var restaurant_data = results[restaurant];

    // add to map
    var latlng = restaurant_data['latlng'];
    latlng = new google.maps.LatLng(latlng['lat'], latlng['lng']);

    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      animation: google.maps.Animation.DROP,
      title: restaurant,
    });

    google.maps.event.addListener(marker, 'click', function() {
      open_info(this, map, infowindow);
    });

    // Store markers for future reference
    markers[restaurant] = marker;

    // console.log('setting center');
    map.setCenter(latlng);
  }
}

function open_info(marker, map, infowindow) {
  infowindow.setContent('<div class="marker_label">' + marker.title + '</div>');
  infowindow.open(map, marker);
}
