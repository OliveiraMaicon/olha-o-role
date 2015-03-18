var app = angular.module('app', ['uiGmapgoogle-maps']).config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDRVpqN5PTvDQmC26pX5yQtBv2t3YGCUcs',
            v: '3.17',
            libraries: 'weather,geometry,visualization'
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
    $scope.map = {center: {latitude: 51.219053, longitude: 4.404418 }, zoom: 14 };
    $scope.options = {scrollwheel: false};
    console.log($scope.map);
});

