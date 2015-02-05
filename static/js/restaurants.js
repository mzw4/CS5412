
$(function() {
  $main_container = $('.main_container');
  $input_panel = $('.input_panel');
  $info_panel = $('.info_panel');
  $map_canvas = $('#map-canvas');

  // Set container dimensions
  var view_port_dim = {x: $(window).width(), y: $(window).height()};
  $main_container.height(view_port_dim.y);
  // $map_canvas.height(view_port_dim.y - $input_panel.offset().top - $input_panel.height() - 60);

  // Initialize google maps
  // google.maps.event.addDomListener(window, 'load', initialize);
  var map = initialize_map()

  // ----------------- Event handlers -----------------

  $('#loc_input_form').submit(function(event) {
    event.preventDefault();
    var input = $('#loc_input_field').val();
    find_nearest(input, map);
  });

});

// ------------------------ Functions ------------------------

function initialize_map() {
  var mapOptions = {
    zoom: 15
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
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

function find_nearest(input, map) {
  $.ajax({
    type: 'POST',
    url: '/find_restaurants',
    data: {input_location: input},
  }).done(function(data) {
    console.log(data)
    if(data) {
      display_results(data);
      place_markers(data);
    } else {
      console.log('Invalid response');
    }
  }).fail(function(error, status) {
  });
}

function display_results(data) {
  for(var restaurant in data) {
    
  }
}

function place_markers(data) {
  var infowindow = new google.maps.InfoWindow({
    content: 'placeholder',
    maxWidth: 500
  });

  for(var restaurant in data) {
    console.log(restaurant);
    // add to map
    var latlng = data[restaurant];
    latlng = new google.maps.LatLng(latlng['lat'], latlng['lng']);

    var marker = new google.maps.Marker({
      position: latlng,
      animation: google.maps.Animation.DROP,
      title: restaurant,
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent('<div class="marker_label">' + this.title + '</div>');
      infowindow.open(map, this);
    });

    // To add the marker to the map, call setMap();
    marker.setMap(map);

    // console.log('setting center');
    map.setCenter(latlng);
  }
}
