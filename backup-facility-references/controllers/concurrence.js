function concurrenceController($scope, $http, ServiceUtils, $anchorScroll, $location, $filter) {

    $scope.gotoAnchor = function(elementId) {
        var newHash = elementId;
        if ($location.hash() !== newHash) {
            $location.hash(elementId);
        } else {
            $anchorScroll();
        }
    };

    $scope.graphChartVisible = false;
    var graphDidio = null;

    $scope.refreshGraphChart = function () {

        var dataList = { nodes: [], edges:[]};

        var cutString = $filter('cutstring');
        angular.forEach($scope.concurenceTable.demands, function(item) {

            var description = cutString(item.description != null ? item.description : "", true, 36);
            var rdm = "RDM: " + (item.rdm != null ? item.rdm : "") ;
            var point = "Ponto: " + (item.point != null ? item.point.name : "") ;
            var dtDev = "Dev.: " + ServiceUtils.convertDateToString(item.dtIniDev) + " - " + ServiceUtils.convertDateToString(item.dtFinDev);
            var dtHom = "Hom.: " + ServiceUtils.convertDateToString(item.dtIniHom) + " - " + ServiceUtils.convertDateToString(item.dtFinHom);
            var dtProd = "Prod.: " + ServiceUtils.convertDateToString(item.dtIniProd);
            var obs = "Obs: " + (item.observations != null ? item.observations : "");
            dataList.nodes.push({ id: item.id, text: [description, "",rdm, point, dtDev, dtHom, dtProd, obs], color: "#ffffff", bgColor: item.point.color ? item.point.color : "#1a75ce", totalAssociations: item.qtdAssociations });
        });

        var associationClone = angular.copy($scope.concurenceTable.associations);

        angular.forEach($scope.concurenceTable.associations, function(association) {
            angular.forEach(associationClone, function(associationClone) {
                if (associationClone.artifact.id == association.artifact.id && association.demand.id != associationClone.demand.id) {
                    if (associationClone.artifactVersion != null && associationClone.artifactVersion != -1) {
                        if ((association.artifactVersion - 1) == associationClone.artifactVersion) {
                            var objEdgeTmp = { parent: associationClone.demand.id, source: association.demand.id};
                            var addToArray=true;
                            for(var i=0;i<dataList.edges.length;i++){
                                if(dataList.edges[i].parent===associationClone.demand.id && dataList.edges[i].source===association.demand.id){
                                    addToArray=false;
                                }
                            }
                            if(addToArray){
                                dataList.edges.push(objEdgeTmp);
                            }
                        }
                    }
                }

            });
        });

        $scope.graphChartVisible = true;
        if(graphDidio != null){
            graphDidio.changeDataObjects(dataList)
            graphDidio.update();
            graphDidio.draw();
            graphDidio.resetZoom();
            graphDidio.resetZoom();
        }else{
            graphDidio = didioChart(dataList ,{ width: 300, height: 170, margin: 120, padding: 12, fullScreen: true});
        }
    }

    $scope.updList = {
            demands: [],
            associations: [],
        };
    $scope.listDemands = [];
    var demandSubstring = "";
    $scope.getDemandList = function(item) {
        if(item != "" && item.length >= 3 && demandSubstring != item.substring(0, 3)){
          demandSubstring = item.substring(0, 3);
          $http({
              method  : 'GET',
              url     : '/demands/by_description/' + ServiceUtils.removeSymbols(item),
              headers : { 'Content-Type': 'application/json' }
          }).success(function(data) {
              $scope.listDemands = data;
          })
        }
    };

    $scope.selectedDemandsBlock = [];
    $scope.selectedDemands = [];
    $scope.selectedDemandsRemove = function(item) {
        var index = $scope.selectedDemands.indexOf(item)
        $scope.selectedDemands.splice(index, 1);
    };

    $scope.selectDemandStyle = 0;
    $scope.selectArtifactStyle = 0;

    $scope.selectDemandArtifactStyle = function(demandId, artifactId){
        $scope.selectDemandStyle = demandId;
        $scope.selectArtifactStyle = artifactId;

    }

    $scope.styleDemandArtifact = function(demandId, artifactId){

        var hasConflict = "N";
        var tmpVersion = -2;
        var tmpVersionLast = -2;

        var indexDemand = 0;

        var hasChangeConflict = false;
        angular.forEach($scope.concurenceTable.associations, function(associationItem) {
            if(associationItem.artifact.id == artifactId && associationItem.demand.id == demandId){
                angular.forEach($scope.concurenceTableBkp.associations, function(associationItem2) {
                    if(associationItem.artifact.id == associationItem2.artifact.id && associationItem.demand.id == associationItem2.demand.id && associationItem.artifactVersion != associationItem2.artifactVersion) {
                        hasChangeConflict = true;
                    }
                });
            }
        });

        for (var int = 0; int < $scope.concurenceTable.demands.length; int++) {
            if($scope.concurenceTable.demands[int].id == demandId){
                indexDemand = int;
            }
        }

        angular.forEach($scope.concurenceTable.associations, function(associationItem) {
            if(associationItem.artifact.id == artifactId && associationItem.demand.id == demandId){
                tmpVersion = associationItem.artifactVersion;
                hasConflict = associationItem.unexpectedArtifact;
            }
            else if(associationItem.artifact.id == artifactId){

                for (var i = 0; i < indexDemand; i++) {
                    if($scope.concurenceTable.demands[i].id == associationItem.demand.id && tmpVersionLast < associationItem.artifactVersion){
                        tmpVersionLast = associationItem.artifactVersion;
                    }
                }
            }
        });

        if (hasChangeConflict) {
            return {'background':'#ff0000'};
        }
        else if (tmpVersionLast > tmpVersion && tmpVersion >= 0 && tmpVersionLast >= 0) {
            return {'background':'#ffffcc'};
        }
        else if(hasConflict == "S" && tmpVersion == -1){
            return {'background':'#ffdddd'};
        }
        else if(hasConflict == "S"){
            return {'background':'#dddddd'};
        }
        else if($scope.selectDemandStyle == demandId && $scope.selectArtifactStyle == artifactId){
            return {'background':'#c7e0ff'};
        }
        else if($scope.selectDemandStyle == demandId){
            return {'background':'#f0f7ff'};
        }
        else if($scope.selectArtifactStyle == artifactId){
            return {'background':'#f0f7ff'};
        }else{
            return {'background':''};
        }


    }

    $scope.haveDemandInSearch = function(demandId){

        var returnBool = false;
        angular.forEach($scope.selectedDemands, function(item) {
            if(item.id == demandId){
                returnBool = true;
            }
        });

        if(returnBool){
            return {'background':'#f7b428'};
        }
        else{
            return '';
        }
    }

    $scope.listArtifacts = [];
    var artifactSubstring = "";
    $scope.getArtifactList = function(item) {
        if(item != null && item.length >= 3 && artifactSubstring != item.substring(0, 3)){
            artifactSubstring = item.substring(0, 3);
            $http({
              method  : 'GET',
              url     : '/artifact/by_name/' + ServiceUtils.removeSymbols(item),
              headers : { 'Content-Type': 'application/json' }
            })
            .success(function(data) {
              $scope.listArtifacts = data;
            })
        }
    };
    $scope.selectedArtifacts = [];
    $scope.selectedArtifactsRemove = function(item) {
          var index = $scope.selectedArtifacts.indexOf(item)
          $scope.selectedArtifacts.splice(index, 1);
    };
    $scope.haveArtifacInSearch = function(artifacId){
        var returnBool = false;
        angular.forEach($scope.selectedArtifacts, function(item) {
            if(item.id == artifacId){
                returnBool = true;
            }
        });
        if(returnBool){
            return {'background':'#f7b428'};
        }
        else{
            return '';
        }
    }

    //Attributes
    $scope.saveAssociationForm = function() {
        $scope.selectDemandStyle = 0;
        $scope.selectArtifactStyle = 0;
        $scope.updList.associations = [];
        angular.forEach($scope.concurenceTable.associations, function(item) {
            var associationAux = {};
            associationAux.id = item.id;
            associationAux.version = item.version;
            associationAux.artifactVersion = item.artifactVersion;
            $scope.updList.associations.push(associationAux);
        });

        $scope.updList.originalAssociations = [];
        angular.forEach($scope.concurenceTableBkp.associations, function(item) {
            var associationAux = {};
            associationAux.id = item.id;
            associationAux.version = item.version;
            associationAux.artifactVersion = item.artifactVersion;
            $scope.updList.originalAssociations.push(associationAux);
        });

        $http({
            method  : 'PUT',
            url     : '/concurrences',
            data    : $scope.updList,
            headers : { 'Content-Type': 'application/json' }
        })
        .success(function(data) {
            ServiceUtils.openMessageModal($scope, 'Operação realizada com sucesso.');
            $scope.updList = {
                demands: [],
                associations: [],
            };
            $scope.submitSchForm();
            $scope.refreshTable();
        })
        .error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal) {
                    ServiceUtils.openMessageModal($scope, data.message);
                } else {
                    $scope[data.id] = data.message;
                }
            });
        });
    };

    $scope.cancelAssociationForm = function() {
        ServiceUtils.partialModalBoolean($scope, "Atenção", "Todas as mudanças serão perdidas. Deseja continuar?", function() {
            $scope.concurenceTable = angular.copy($scope.concurenceTableBkp);
            $scope.refreshTable();
        });
    };

    $scope.submitSchForm = function() {

        $scope.selectDemandStyle = 0;
        $scope.selectArtifactStyle = 0;
        $("#freeze-row").css('left', 0);
        $("#freeze-col").css('top', 0);

        if ($scope.concurrenceSchForm.$valid && ((!angular.isUndefined($scope.selectedDemands) && $scope.selectedDemands.length > 0) || (!angular.isUndefined($scope.selectedArtifacts) && $scope.selectedArtifacts.length > 0))) {

            var filter = "?";

            if (!angular.isUndefined($scope.selectedDemands) && $scope.selectedDemands.length > 0) {

                $scope.demandsSel = "";

                angular.forEach($scope.selectedDemands, function(item) {
                    if ($scope.demandsSel.length > 0) {
                        $scope.demandsSel = $scope.demandsSel + "," + item.id;
                    } else {
                        $scope.demandsSel = '' + item.id + '';
                    }
                });

                filter += '&listDemandId=' + $scope.demandsSel;
            }

            if (!angular.isUndefined($scope.selectedArtifacts) && $scope.selectedArtifacts.length > 0) {

                $scope.artifactSel = "";

                angular.forEach($scope.selectedArtifacts, function(item) {
                    if ($scope.artifactSel.length > 0) {
                        $scope.artifactSel = $scope.artifactSel + "," + item.id;
                    } else {
                        $scope.artifactSel = '' + item.id + '';
                    }
                });
                filter += '&listArtifactId=' + $scope.artifactSel;
            }

            $scope.searchFilter = '/demands/artifact/association' + filter;

			$http.get($scope.searchFilter).success(function(data) {

                $scope.selectedDemandsBlock = $scope.selectedDemands.map(function(x) {
                  return x.id;
                });
			    $scope.showTableConcurrence = true;
			    $scope.concurenceTable = {};
				$scope.concurenceTable = data;
				$scope.concurenceTableBkp = angular.copy($scope.concurenceTable);

                $scope.gotoAnchor("concurrence-container");
                initFreezeCol();

			});

        } else {
            ServiceUtils.openMessageModal($scope, "Pelo menos um campo é obrigatório para realizar a pesquisa!");
        }
    };

    $scope.clearSchForm = function() {
        if ($scope.concurrenceSchForm.$valid && ((!angular.isUndefined($scope.selectedDemands) && $scope.selectedDemands.length > 0) || (!angular.isUndefined($scope.selectedArtifacts) && $scope.selectedArtifacts.length > 0))) {
            ServiceUtils.partialModalBoolean($scope, "Atenção", "Todos os dados serão perdidos. Deseja continuar?", function() {
                $scope.clearForms();
            });
        }
    };

    $scope.objIsEmpty = function(obj) {
        return Object.keys(obj).length === 0;
    };

    $scope.refreshTable = function() {
            var tableTmp = angular.copy($scope.concurenceTable);
            $scope.concurenceTable = tableTmp;
        };

    $scope.getObjDemandInTable = function(idDemand) {
            idDemand = parseInt(idDemand);
            var demandTmp = {};
            angular.forEach($scope.concurenceTable.demands, function(item) {
                if (item.id == idDemand) {
                    demandTmp = item;
                }
            });
            return demandTmp
    };

    $scope.getObjArtifactInTable = function(idArtifact) {
        idArtifact = parseInt(idArtifact);
        var artifactTmp = {};
        angular.forEach($scope.concurenceTable.artifacts, function(item) {
            if (item.id == idArtifact) {
                artifactTmp = item;
            }
        });
        return artifactTmp
    };

    $scope.getObjAssociationTable = function(idDemand, idArtifact) {
        var tmpReturn = null;

        angular.forEach($scope.concurenceTable.associations, function(item) {
            if (item.demand.id == idDemand && item.artifact.id == idArtifact) {
                tmpReturn = item;
            }
        });
        return tmpReturn
    };

    $scope.isConcurrenceCell = function(idDemand, idArtifact) {

        var hasConflict = "N";
        var tmpVersion = -2;
        var tmpVersionLast = -2;

        var indexDemand = 0;

        var hasChangeConflict = false;
        angular.forEach($scope.concurenceTable.associations, function(associationItem) {
            if(associationItem.artifact.id == idArtifact && associationItem.demand.id == idDemand){
                angular.forEach($scope.concurenceTableBkp.associations, function(associationItem2) {
                    if(associationItem.artifact.id == associationItem2.artifact.id && associationItem.demand.id == associationItem2.demand.id && associationItem.artifactVersion != associationItem2.artifactVersion) {
                        hasChangeConflict = true;
                    }
                });
            }
        });

        for (var int = 0; int < $scope.concurenceTable.demands.length; int++) {
            if($scope.concurenceTable.demands[int].id == idDemand){
                indexDemand = int;
            }
        }

        angular.forEach($scope.concurenceTable.associations, function(associationItem) {
            if(associationItem.artifact.id == idArtifact && associationItem.demand.id == idDemand){
                tmpVersion = associationItem.artifactVersion;
                hasConflict = associationItem.unexpectedArtifact;
            }
            else if(associationItem.artifact.id == idArtifact){

                for (var i = 0; i < indexDemand; i++) {
                    if($scope.concurenceTable.demands[i].id == associationItem.demand.id && tmpVersionLast < associationItem.artifactVersion){
                        tmpVersionLast = associationItem.artifactVersion;
                    }
                }
            }
        });

        if (hasChangeConflict) {
            return "cell-conflict"
        }
        else if (tmpVersionLast > tmpVersion && tmpVersion >= 0 && tmpVersionLast >= 0) {
            return "cell-concurrence"
        }
        else if(hasConflict == "S" && tmpVersion == -1){
            return "cell-tmp-version"
        }
        else if(hasConflict == "S"){
            return "cell-has-conflict"
        }
        else {
            return ""
        }

    }

    $scope.onMoveColumns = function(indexDemand) {

        //$scope.selectedDemandsBlock;
        if($scope.selectedArtifacts.length == 0) {

            var listColumns = [];

            $(".sortableItem").each(function () {
                listColumns.push($scope.getObjDemandInTable($(this).attr("id").split("-")[1]));
            });

            var indexColumn = indexDemand - 1;
            if ($scope.selectedDemandsBlock.indexOf(listColumns[indexColumn].id) != -1) {

                var objDemand = {
                    demand: {},
                    afterDemand: {},
                    beforeDemand: {},
                };

                angular.forEach($scope.updList.demands, function (associationItem) {
                    if (associationItem.demand.id == listColumns[indexColumn].id) {
                        var index = $scope.updList.demands.indexOf(associationItem)
                        $scope.updList.demands.splice(index, 1);
                    }
                });

                if (indexDemand == listColumns.length) {
                    objDemand.demand.id = listColumns[indexColumn].id;
                    objDemand.demand.version = listColumns[indexColumn].version;
                    objDemand.demand.orderAscent = listColumns[indexColumn].orderAscent;
                    objDemand.afterDemand = null;
                    objDemand.beforeDemand.id = listColumns[indexColumn - 1].id;
                    objDemand.beforeDemand.version = listColumns[indexColumn - 1].version;
                    objDemand.beforeDemand.orderAscent = listColumns[indexColumn - 1].orderAscent;
                    $scope.updList.demands.push(objDemand);
                } else {
                    objDemand.demand.id = listColumns[indexColumn].id;
                    objDemand.demand.version = listColumns[indexColumn].version;
                    objDemand.demand.orderAscent = listColumns[indexColumn].orderAscent;
                    objDemand.afterDemand.id = listColumns[indexColumn + 1].id;
                    objDemand.afterDemand.version = listColumns[indexColumn + 1].version;
                    objDemand.afterDemand.orderAscent = listColumns[indexColumn + 1].orderAscent;
                    objDemand.beforeDemand = null;
                    $scope.updList.demands.push(objDemand);
                }

                $scope.concurenceTable.demands = [];
                $scope.concurenceTable.demands = listColumns;

                $scope.refreshTable();

                var dataPost = {};
                dataPost.demands = [] ;
                dataPost.associations = [] ;
                dataPost.artifacts = $scope.concurenceTable.artifacts;

                angular.forEach($scope.concurenceTable.associations, function(associationItem){
                    dataPost.associations.push({demand : {id : associationItem.demand.id ,
                        orderAscent : associationItem.demand.orderAscent},
                        artifact : {id : associationItem.artifact.id },
                        artifactVersion : associationItem.artifactVersion,
                        id : associationItem.id,
                        version : associationItem.version})
                });
                angular.forEach(listColumns, function(demandItem){
                    dataPost.demands.push({id : demandItem.id})
                });

                $http({
                    method : 'POST',
                    url : '/concurrences/calculate_version/'+ indexColumn,
                    data : dataPost,
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                }).success(function(data) {
                    $scope.concurenceTable.associations = data.associations;
                    $scope.refreshTable();
                }).error(function(data){
                    $scope.concurenceTable = angular.copy($scope.concurenceTableBkp);
                    $scope.refreshTable();
                });


            }
            else {
                ServiceUtils.openMessageModal($scope, "A demanda precisa estar no filtro para ser movida!");
                $scope.concurenceTable = angular.copy($scope.concurenceTableBkp);
                $scope.refreshTable();
            }
        }
        else {
            ServiceUtils.openMessageModal($scope, "Não é possivel arrastar uma demanda com artefato no filtro!");
            $scope.concurenceTable = angular.copy($scope.concurenceTableBkp);
            $scope.refreshTable();
        }

    }

    $scope.attrVersion = function(idDemand, idArtifact){
        var associationTmp = $scope.getObjAssociationTable(idDemand, idArtifact);
        if(associationTmp.artifactVersion == -1){
            ServiceUtils.partialModalBoolean($scope, "Atenção", "Deseja atribuir uma versão para essa demanda?", function() {
                $scope.recalcVersions(idArtifact);
            });

        }

    }


    $scope.recalcVersions = function(idArtifact) {

        var lowerVersion = -2;

        for (var i = 0; i < $scope.concurenceTable.demands.length; i++) {
            angular.forEach($scope.concurenceTable.associations, function(associationItem) {
                if(associationItem.artifact.id == idArtifact && $scope.concurenceTable.demands[i].id == associationItem.demand.id && associationItem.artifactVersion >= 0 && (lowerVersion == -2 || associationItem.artifactVersion < lowerVersion)){
                    lowerVersion = associationItem.artifactVersion;
                    associationItem.artifactVersion = 1;
                }
            });
        }

        if(lowerVersion >= 0){
            for (var i = 0; i < $scope.concurenceTable.demands.length; i++) {
                angular.forEach($scope.concurenceTable.associations, function(associationItem) {
                    if(associationItem.artifact.id == idArtifact && $scope.concurenceTable.demands[i].id == associationItem.demand.id){
                        associationItem.artifactVersion = lowerVersion;
                        lowerVersion++;
                    }
                });
            }
        }
        else{
            lowerVersion = 1;
            for (var i = 0; i < $scope.concurenceTable.demands.length; i++) {
                angular.forEach($scope.concurenceTable.associations, function(associationItem) {
                    if(associationItem.artifact.id == idArtifact && $scope.concurenceTable.demands[i].id == associationItem.demand.id){
                        associationItem.artifactVersion = lowerVersion;
                        lowerVersion++;
                    }
                });
            }
        }

            $scope.refreshTable();
    }

    $scope.demandDetails = function(idDemand) {
        ServiceUtils.modalDemand($scope, idDemand, true, false, true, true, false, void(0));
    }

    $scope.resetStyleCells = function(){
        selectDemandStyle = 0;
        selectArtifactStyle = 0;
    };

    $scope.clearForms = function(){
        $scope.selectDemandStyle = 0;
        $scope.selectArtifactStyle = 0;
        $scope.showTableConcurrence = false;
        $scope.concurenceTable = {
            demands : [],
            artifacts : [],
            associations : []
        };
        $scope.concurenceTableBkp = {
                    demands : [],
                    artifacts : [],
                    associations : []
                };

        $scope.selectedDemands = [];
        $scope.selectedArtifacts = [];

        $scope.updList = {
                demands: [],
                associations: [],
            };
    };

    $scope.clearForms();





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
}
/**
 * Modal Controllers
 */
function ModalTab01($scope, $modalInstance) {
    $scope.ok = function() {
        $scope.clearForms();
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
};

function initFreezeCol(){
    $("#freeze-col td:first-child").css('min-width', $("#freeze-row").width());

    setTimeout(function(){
        $("#freeze-col td:first-child").css('min-width', $("#freeze-row").width());
    }, 2000);
}

$( document ).ready(function() {
    initFreezeCol();
    $("#concurrence-container").on('scroll', function () {
        var left = $("#concurrence-container").scrollLeft();
        if(left != $("#freeze-row").left) {
            $("#freeze-row").css('left', left);
        }

        var top = $("#concurrence-container").scrollTop();
        initFreezeCol();
        if(top != $("#freeze-col").top) {
            $("#freeze-col").css('top', top);
        }
    });
});

