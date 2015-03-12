function initialize() {

    var styles = [
        {
            stylers: [
                { hue: "#00a651" },
                { saturation: -40 }
            ]
        },{
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [
                { lightness: 100 },
                { visibility: "simplified" }
            ]
        },{
            featureType: "road",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];


    var mapOptions = {
        center: new google.maps.LatLng(-21.7941667, -48.1743202),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);

    map.setOptions({
        panControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false
    });

    map.setOptions({styles: styles});

}

jQuery(document).ready(function() {
    initialize();
});

