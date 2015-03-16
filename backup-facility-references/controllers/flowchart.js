'use strict';

function flowchartController($scope, $http, $filter, ServiceUtils) {

    var fullScreenEnable = false;
    var canvas = document.getElementById('fullScreen');

    $scope.goFullScreen = function(){

        fullScreenEnable = !fullScreenEnable;

        if(fullScreenEnable) {
            if (canvas.requestFullscreen)
                if (document.fullScreenElement) {
                    document.cancelFullScreen();
                } else {
                    canvas.requestFullscreen();
                }
            else if (canvas.msRequestFullscreen)
                if (document.msFullscreenElement) {
                    document.msExitFullscreen();
                } else {
                    canvas.msRequestFullscreen();
                }
            else if (canvas.mozRequestFullScreen)
                if (document.mozFullScreenElement) {
                    document.mozCancelFullScreen();
                } else {
                    canvas.mozRequestFullScreen();
                }
            else if (canvas.webkitRequestFullscreen)
                if (document.webkitFullscreenElement) {
                    document.webkitCancelFullScreen();
                } else {
                    canvas.webkitRequestFullscreen();
                }
            evt.stopPropagation();
        }else{
            if (document.exitFullscreen)
                document.exitFullscreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen)
                document.webkitCancelFullScreen();
            else if (document.msExitFullscreen)
                document.msExitFullscreen();
        }


    }

    var graphDidio = null;



    $scope.listFlowChart = {
        nodes: [],
        edges: []
    };

    $scope.autoComplete = [];

    $http({
        method  : 'GET',
        url     : '/concurrences/demands/',
        headers : { 'Content-Type': 'application/json' }
    }).success(function(data) {

        console.log(data);

        var cutString = $filter('cutstring');
        angular.forEach(data.demands, function(item) {

            var description = cutString(item.description != null ? item.description : "", true, 36);
            var rdm = "RDM: " + (item.rdm != null ? item.rdm : "") ;
            var point = "Ponto: " + (item.point != null ? item.point.name : "") ;
            var dtDev = "Dev.: " + ServiceUtils.convertDateToString(item.dtIniDev) + " - " + ServiceUtils.convertDateToString(item.dtFinDev);
            var dtHom = "Hom.: " + ServiceUtils.convertDateToString(item.dtIniHom) + " - " + ServiceUtils.convertDateToString(item.dtFinHom);
            var dtProd = "Prod.: " + ServiceUtils.convertDateToString(item.dtIniProd);
            var obs = "Obs: " + (item.observations != null ? item.observations : "");
            $scope.listFlowChart.nodes.push({ id: item.id, text: [description, "",rdm, point, dtDev, dtHom, dtProd, obs], color: "#000000", bgColor: item.point.color ? item.point.color : "#1a75ce", order: item.orderAscent });
            $scope.autoComplete.push(description)
        });

        angular.forEach(data.orphanDemands, function(item) {
            var haveDemand = false;
            angular.forEach($scope.listFlowChart.nodes, function(item2) {
                if(item2.id == item.id){
                    haveDemand = true;
                }
            });

            if(!haveDemand){
                var description = cutString(item.description != null ? item.description : "", true, 36);
                var rdm = "RDM: " + (item.rdm != null ? item.rdm : "") ;
                var point = "Ponto: " + (item.point != null ? item.point.name : "") ;
                var dtDev = "Dev.: " + ServiceUtils.convertDateToString(item.dtIniDev) + " - " + ServiceUtils.convertDateToString(item.dtFinDev);
                var dtHom = "Hom.: " + ServiceUtils.convertDateToString(item.dtIniHom) + " - " + ServiceUtils.convertDateToString(item.dtFinHom);
                var dtProd = "Prod.: " + ServiceUtils.convertDateToString(item.dtIniProd);
                var obs = "Obs: " + (item.observations != null ? item.observations : "");
                $scope.listFlowChart.nodes.push({ id: item.id, text: [description, "",rdm, point, dtDev, dtHom, dtProd, obs], color: "#ffffff", bgColor: item.point.color ? item.point.color : "#1a75ce"});
            }
        });

        angular.forEach(data.links, function(item) {
            $scope.listFlowChart.edges.push(item);
        });

        graphDidio = didioChart($scope.listFlowChart ,{ width: 300, height: 170, margin: 300, padding: 12, lineWidth: 1.2, arrowWidth: 16, fullScreen: true});
    });
    //


    //
    //
    //$scope.listFlowChart = {
    //    nodes:[
    //        { id: 1, text: ["Demanda"], bgColor: "#FF0000"},
    //        { id: 2, text: ["Demanda"], bgColor: "#FFFF00"},
    //        { id: 3, text: ["Demanda"], bgColor: "#00FFFF"},
    //        { id: 4, text: ["Demanda"], bgColor: "#FF6699"},
    //        { id: 5, text: ["Demanda"], bgColor: "#00FF00"},
    //        { id: 6, text: ["Demanda"], bgColor: "#0000FF"},
    //        { id: 7, text: ["Demanda"], bgColor: "#FF00FF"},
    //        { id: 8, text: ["Demanda"], bgColor: "#F0F0F0"},
    //        { id: 9, text: ["Demanda"], bgColor: "#0F0F0F"},
    //    ],
    //    edges:[
    //        { source: 2, parent:1},
    //        { source: 3, parent:1},
    //        { source: 3, parent:2},
    //        { source: 3, parent:6},
    //        { source: 3, parent:7},
    //        { source: 5, parent:2},
    //        { source: 6, parent:1},
    //    ]
    //}
    //
    //graphDidio = didioChart($scope.listFlowChart ,{ width: 300, height: 170, margin: 100, padding: 12, lineWidth: 1.2, arrowWidth: 12, fullScreen: true});

    $scope.showChildrens = true;

    $scope.changeChildrens = function(){
        $scope.showChildrens = !$scope.showChildrens;
        graphDidio != null ? graphDidio.IS_SEARCH_CHILDRENS = $scope.showChildrens : void(0);
        $scope.searchField != null ? $scope.searchDemand($scope.searchField) : void(0);

    }

    $scope.goSaveImage = function(){
        graphDidio != null ? graphDidio.saveCanvasArea() : void(0);

    }

    $scope.showParents = true;

    $scope.changeParents = function(){
        $scope.showParents = !$scope.showParents;
        graphDidio != null ? graphDidio.IS_SEARCH_PARENTS = $scope.showParents : void(0);
        $scope.searchField != null ? $scope.searchDemand($scope.searchField) : void(0);

    }

    $scope.zoomIn = function(){
        graphDidio != null ? graphDidio.changeZoom(1) : void(0)
    }

    $scope.zoomOut = function(){
        graphDidio != null ? graphDidio.changeZoom(-1) : void(0)
    }

    $scope.reset = function(){
        //var dataList = { nodes: [], edges:[]};
        //dataList.nodes.push({ id: 1, text: ["TESTE 1"], color: "#ffffff", bgColor: "#1a75ce" });
        //dataList.nodes.push({ id: 2, text: ["TESTE 2"], color: "#ffffff", bgColor: "#1a75ce" });
        //dataList.nodes.push({ id: 3, text: ["TESTE 3"], color: "#ffffff", bgColor: "#1a75ce" });
        //dataList.nodes.push({ id: 4, text: ["TESTE 4"], color: "#ffffff", bgColor: "#1a75ce" });
        //dataList.nodes.push({ id: 5, text: ["TESTE 5"], color: "#ffffff", bgColor: "#1a75ce" });
        //dataList.edges.push({ source: 2, parent: 1 });
        //dataList.edges.push({ source: 3, parent: 1 });
        //dataList.edges.push({ source: 4, parent: 2 });
        //dataList.edges.push({ source: 5, parent: 3 });
        //console.clear();
        //console.log(dataList);
        //graphDidio.changeDataObjects(dataList);
        //graphDidio.search("");
        graphDidio.update();
        graphDidio.draw();
        graphDidio != null ? graphDidio.resetZoom() : void(0);
        graphDidio != null ? graphDidio.resetZoom() : void(0);

    }

    $scope.searchDemand =  function(text){
        if(text != null && text.length >= 3) {
            graphDidio.search(text);
            graphDidio.update();
            graphDidio.draw();
        }
        else{
            graphDidio.search("");
            graphDidio.update();
            graphDidio.draw();
        }
    }


}