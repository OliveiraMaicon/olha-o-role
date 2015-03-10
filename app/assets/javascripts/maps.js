function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(-21.7941667, -48.1743202),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);
}