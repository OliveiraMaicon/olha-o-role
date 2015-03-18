var app = angular.module('app', ['uiGmapgoogle-maps']).config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDRVpqN5PTvDQmC26pX5yQtBv2t3YGCUcs',
            v: '3.17',
            libraries: 'visualization'
        });
    }
);

app.controller("homeController", function($scope) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []

    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
   /* uiGmapGoogleMapApi.then(function(maps) {

    });*/

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

    $scope.map = {center: {latitude: -21.7941667, longitude: -48.1743202 }, zoom: 14 };
    $scope.options = {scrollwheel: false,
        panControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        styles: styles};
});

