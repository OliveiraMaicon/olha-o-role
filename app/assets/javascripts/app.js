'use strict';

var app = angular.module('app', ['uiGmapgoogle-maps']).config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDRVpqN5PTvDQmC26pX5yQtBv2t3YGCUcs',
            v: '3.17',
            libraries: 'visualization'
        });
    }
);

app.controller("HomeController", function($scope, uiGmapGoogleMapApi) {





    $scope.map = {
        center: {latitude : -14.604862277915656, longitude : -46.93356874999995 },
        zoom: 5

    };

    uiGmapGoogleMapApi.then(function(maps) {

        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(showPosition)
        }

    });

    var styles = mapStyleConfig();

    $scope.options = {
        panControl: false,
        scrollWheel: false,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        styles:styles
    };


    function showPosition(position) {
        $scope.map = { center : {latitude : position.coords.latitude, longitude : position.coords.longitude}, zoom: 12};
    }



});


function mapStyleConfig() {
    return [
        {
            stylers: [
                {hue: "#00a651"},
                {saturation: -40}
            ]
        }, {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [
                {lightness: 100},
                {visibility: "simplified"}
            ]
        }, {
            featureType: "road",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        }
    ];
}

