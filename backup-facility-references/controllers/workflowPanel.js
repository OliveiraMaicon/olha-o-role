'use strict';

/**
 * Workflow Panel Controller
 */

function workflowPanelController($scope, $http, ServiceUtils) {

	
	// *****************************************************************
    // VARIABLES
    // *****************************************************************

    $scope.listWorkflow = {};
    var dataGet = {};

    // *****************************************************************
    // FORM ACTIONS
    // *****************************************************************

    // function submit form of search demands of workflows
    $scope.workflowSubmitForm = function() {

        if ($scope.workflowForm.$valid) {
            console.log($scope.workflow);
            var dataGet = $scope.workflow;

            var filter = "?loadDemandList=true&orderByField=updateDate&reverse=true&demandsFinalized=false";

            if (!angular.isUndefined(dataGet.demandType) && dataGet.demandType != null) {
                filter += '&demandTypeId=' + dataGet.demandType;
            }

            if (!angular.isUndefined(dataGet.description)) {
                filter += '&description=' + ServiceUtils.removeSymbols(dataGet.description);
            }

            if (!angular.isUndefined(dataGet.chkArea) && dataGet.chkArea.length > 0) {
                filter += '&requestingAreaIdList=' + dataGet.chkArea;
            }

            if (!angular.isUndefined(dataGet.chkTeam) && dataGet.chkTeam > 0) {
                filter += '&teamIdList=' + dataGet.chkTeam;
            }

            $http.get('/workflows' + filter).success(function(data) {
                $scope.listWorkflow = data;
            }).error(function(data) {
                angular.forEach(data, function(data) {
                    ServiceUtils.openMessageModal($scope, data.message);
                });
                
            });
            
        } else {
            ServiceUtils.openMessageModal($scope, "Por favor preencha os campos indicados corretamente!");
        }
    }

    $scope.handleDrop = function(item, bin) {
    	var idPoint = bin.split("-")[1];
    	var idDemand = item.split("-")[1];
    	
    	var pointTmp = {};
    	var demandTmp = {};
    	
    	angular.forEach($scope.listWorkflow.listWorkflowPoint, function(item) {
            if (item.point.id == idPoint) {
            	pointTmp = item;
            }
            angular.forEach(item.demandList, function(item2) {
                if (item2.id == idDemand) {
                	demandTmp = item2;
                }
            });
        });
    	  	
        var dataPut = {};
        dataPut.pointId = idPoint;
        dataPut.version = demandTmp.version;

        if (idPoint != demandTmp.point.id) {
            var moveToFinalPoint = false;
            if(!angular.isUndefined($scope.listWorkflow)){
                angular.forEach($scope.listWorkflow.listWorkflowPoint, function(item) {
                    if(item.point.id == idPoint){
                        if(item.indInitialFinal == "F"){
                            $scope.finalPointId = item.point.id;
                            moveToFinalPoint = true;
                        }
                    }
                })
            }
            if(moveToFinalPoint){
                $scope.demandTypesSelect();
                ServiceUtils.modalDemand($scope, idDemand, true, false, false, false, true, function(){
                    $scope.demandTypesSelect();
                });
            } else {
        	    demandTmp.point.id = bin;
                $http({
                    method : 'PUT',
                    url : '/demands/' + demandTmp.id + '/change_point',
                    data : dataPut,
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                }).success(function(data) {
                    $scope.demandTypesSelect();

                }).error(function(data) {
                    $scope.demandTypesSelect();
                    angular.forEach(data, function(data) {
                        ServiceUtils.openMessageModal($scope, data.message);
                    });

                });
            }
        }
    }
    
    $scope.handleDrag = function(itemId){

    	var idDemand = parseInt(itemId.split("-")[1]);
    	var demandTmp = {};

    	angular.forEach($scope.listWorkflow.listWorkflowPoint, function(item) {
            angular.forEach(item.demandList, function(item2) {
            	if (item2.id == idDemand) {
                	demandTmp = item2;
                }
            });
        });

    	if(demandTmp.progressStatus ==="RELEASED"){

            $(".wm-droppable").css('opacity','0.1');
            $(".wm-droppable").droppable("disable");

            var listPointsAllow = [];
            listPointsAllow.push(demandTmp.point.id);
            angular.forEach($scope.listWorkflow.listWorkflow, function(item) {
                angular.forEach(item.workflowPointRelationshipList, function(item) {

                    if(demandTmp.point.id == item.originPoint.point.id){
                        listPointsAllow.push(item.destinyPoint.point.id);
                    }
                });
            });

            angular.forEach(listPointsAllow, function(item) {
                $("#point-" + item).css('opacity','1');
                $("#point-" + item).droppable("enable");
            });
    	}else{

    	    $(".wm-droppable").css('opacity','0.1');
            $(".wm-droppable").droppable("disable");
            ServiceUtils.openMessageModal($scope, "A Demanda precisa estar liberada para ser movida.");
    	}
    	
    }
    
    $scope.styleInitFinal = function(item){
    	if(item == "I"){
    		return "workflow-init"
    	}
    	else if(item == "F"){
    		return "workflow-final"
    	}
    	else{
    		return ""
    	}
    }
    

    $scope.ok = function(action, modalInstance) {
        if (action == 'saveOrUpdateAction') {
        }        
        modalInstance.close();
    }

    // *****************************************************************
    // SEARCH METHODS
    // *****************************************************************

    // RequestingDemand Types
    $scope.findDemandTypes = function() {
        $http.get('/demand_types').success(function(data) {
            $scope.demandTypesList = data;
            
        });
    }

    // RequestingDemand Types OnSelect
    $scope.demandTypesSelect = function() {
        $http({
              method  : 'GET',
              url     : '/workflows/is_there/',
              headers : { 'Content-Type': 'application/json' }
          }).success(function(data) {
              if(data){
                $http.get('/workflows?loadDemandList=true&orderByField=updateDate&reverse=true&demandsFinalized=false').success(function(data) {

                    $scope.listWorkflow = data;

                    $(".wm-draggable").show();
                });
              }else{
                    ServiceUtils.openMessageModal($scope, "Ainda não existe um workflow!");
              }
          });
    }

    // Requesting Team List if PRD
    $scope.loadTeam = function() {
        $http.get('/teams?status=A').success(function(data) {
            $scope.teamList = data
        });
    }

    // RequestingAreas
    $scope.findRequestingAreas = function() {
        $http.get('/requesting_areas').success(function(data) {
            $scope.requestingAreasList = data
        });
    }

    // *****************************************************************
    // AUXILIARY / UTILITY METHODS
    // *****************************************************************

	    $scope.swithTab = function(tab) {
	        if (!$scope.formsAreClean()) {
	            return false;
	        }
	        $scope.clearForms();
	        if (tab == "tab-01") {
	            $scope.init();
	        }
	        return true;
	    }

	    // Form Cleaned
	    $scope.formsAreClean = function() {
	        if ($scope.workflowForm.$dirty) {
	            return false;
	        }
	        return true;
	    }


    $scope.cancelBtn = function(){
        if($scope.workflowForm.$dirty){
            ServiceUtils.partialModalBoolean($scope, "Atenção", "Todas as mudanças serão perdidas. Deseja continuar?", function() {
                $scope.clearForms()
            });
        }else{
            $scope.clearForms()
        }
    }

	    // Clean Forms
	    $scope.clearForms = function() {

	        $scope.listWorkflow = {};
	        var dataGet = {
	                'demandType' : '',
	                'description' : '',
	                'chkArea':[],
	                'chkTeam':[]
	        }

	        $scope.workflow = dataGet;
            if(!angular.isUndefined($scope.workflowForm)) {
                $scope.workflowForm.$setPristine();
            }
	    }

    // init , return void
    $scope.init = function() {
        $scope.loadTeam();
    	$scope.findDemandTypes();
    	$scope.findRequestingAreas();
    	$scope.demandTypesSelect();
        $scope.clearForms();
    }
    
    //call modal
    $scope.showModalMsg = function(message){
	    ServiceUtils.openMessageModal($scope, message);
    }

    // Init with tab 01
    $scope.init();
}

