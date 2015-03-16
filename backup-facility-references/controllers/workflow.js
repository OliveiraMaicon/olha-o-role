'use strict';

/**
 * Workflow Controller
 */

function workflowController($scope, $http, ServiceUtils) {

    // *****************************************************************
    // VARIABLES
    // *****************************************************************

    var graphDidio = null;

    $scope.edit = false;
    // Requesting Point List
    $scope.getPointList = function() {
        $http.get('/points?status=A').success(function(data) {
            $scope.pointList = data;
        });
    }
    
    $scope.loadOriginAttr = function(pointItem) {
        var keepGoing = true;

        angular.forEach($scope.workflowForm.workflowPointCreateList, function(item) {
            if (item.point.id == pointItem && keepGoing) {
                if(item.indInitialFinal == "I"){
                    $scope.relationship.initialPoint = true;
                } else if (item.indInitialFinal == "F") {
                    ServiceUtils.openMessageModal($scope, "O ponto de origem escolhido já está marcado como final em algum fluxo. É possível apenas voltar para um ponto que tenha ligação com o mesmo.");
                    keepGoing = false;
                } else {
                    $scope.relationship.initialPoint = false;
                }
            }
        });
    }

    $scope.loadDestAttr = function(pointItem) {
    	angular.forEach($scope.workflowForm.workflowPointCreateList, function(item) {
            if (item.point.id == pointItem) {
            	if(item.indInitialFinal == "F"){
            		$scope.relationship.endPoint = true;
            	}
            	else{
            		$scope.relationship.endPoint = false;
            	}

            }
        });
    }
    
    // Requesting Flow List
    $scope.getWkfList = function() {
        $http.get('/workflows?convertToForm=true').success(function(data) {
            $scope.workflowForm = data;
            $scope.refreshGraph();
        });
    }

    // Put items on the list
    $scope.addItems = function(){
        if ($scope.relationshipForm.$valid) {
            var idRelationship = {}
            var pointInitial = {};
            var pointFinal = {};
            var createPointInitial = {};
            var createPointFinal = {};
            var relationship = {};
            var idWorkflowPointRelation = $scope.relationship.idWorkflowPointRelationship;

            idRelationship = $scope.relationship.id;
            pointInitial.id = $scope.relationship.originPoint;
            pointFinal.id = $scope.relationship.destPoint;

            if(pointInitial.id != pointFinal.id){
		        angular.forEach($scope.pointList, function(item) {
		            if (item.id == pointInitial.id) {
		            	pointInitial.name = item.name;
		            	pointInitial.description = item.description;
		            }
		            
		            if (item.id == pointFinal.id) {
		            	pointFinal.name = item.name;
		    	        pointFinal.description = item.description;
		            }
		        });
		        
		        createPointInitial.point = pointInitial;

		        if ($scope.relationship.initialPoint) {
		            createPointInitial.indInitialFinal = 'I';
		            //pointInitial.name += " *";
		            //pointInitial.description += " *";
		        }
		        else{
		        	createPointInitial.indInitialFinal = null;
		        }
		        

		
		        createPointFinal.point = pointFinal;
		        
		        if ($scope.relationship.endPoint) {
		            createPointFinal.indInitialFinal = 'F';
		            //pointFinal.name += " *";
		            //pointFinal.description += " *";
		        }
		        else{
		        	createPointFinal.indInitialFinal = null;
		        }

                var workflowPointRemoveList = [];

                angular.forEach($scope.workflowForm.workflowPointCreateList, function(item, index) {
                    if (item.point.id == createPointInitial.point.id) {
                        createPointInitial.idPointWorkflow = item.idPointWorkflow;

                        if (createPointInitial.indInitialFinal == null && item.indInitialFinal == 'F') {
                            createPointInitial.indInitialFinal = 'F';
                        }

                        workflowPointRemoveList.push(item);
                    } else if (item.point.id == createPointFinal.point.id) {
                        createPointFinal.idPointWorkflow = item.idPointWorkflow;

                        if (createPointFinal.indInitialFinal == null && item.indInitialFinal == 'I') {
                            createPointFinal.indInitialFinal = 'I';
                        }

                        workflowPointRemoveList.push(item);
                    }
                });

                angular.forEach(workflowPointRemoveList, function(item) {
                    $scope.workflowForm.workflowPointCreateList.splice($scope.workflowForm.workflowPointCreateList.indexOf(item), 1);
                });

                $scope.workflowForm.workflowPointCreateList.push(createPointInitial);
                $scope.workflowForm.workflowPointCreateList.push(createPointFinal);


                relationship.originPoint = {};
                relationship.originPoint.point = pointInitial;
                relationship.destinyPoint = {};
                relationship.destinyPoint.point = pointFinal;
                relationship.idWorkflowPointRelationship = idWorkflowPointRelation;
                relationship.originPoint.indInitialFinal = createPointInitial.indInitialFinal;
                relationship.destinyPoint.indInitialFinal = createPointFinal.indInitialFinal;

                angular.forEach($scope.workflowForm.relationshipCreateList, function(item) {
                    if (item.$$hashKey == idRelationship) {
                        $scope.workflowForm.relationshipCreateList.splice($scope.workflowForm.relationshipCreateList.indexOf(item), 1);
                    }
                });

                $scope.workflowForm.relationshipCreateList.push(relationship);
                $scope.relationship.idWorkflowPointRelationship = null;
                $scope.refreshGraph();
                $scope.clearForms();
                $scope.edit = false;
            } else{
                ServiceUtils.openMessageModal($scope, "O ponto de origem deve ser diferente do ponto de destino.");
            }
        } else {
            ServiceUtils.openMessageModal($scope, "Preencha os campos corretamente");
        }
    }

    $scope.editRelation = function(item) {

        if(angular.isUndefined($scope.relationship)){
            $scope.relationship ={};
        }

        $scope.relationship.id = item.$$hashKey;
        $scope.relationship.originPoint = item.originPoint.point.id;
        $scope.relationship.initialPoint = item.originPoint.indInitialFinal == "I" ? true : false;
        $scope.relationship.destPoint = item.destinyPoint.point.id;
        $scope.relationship.endPoint = item.destinyPoint.indInitialFinal == "F" ? true : false;
        $scope.relationship.idWorkflowPointRelationship = item.idWorkflowPointRelationship;
        $scope.edit = true;

        if(!angular.isUndefined($scope.relationshipForm)) {
            $scope.relationshipForm.$dirty = true;
        }
    }

    $scope.cancelBtn = function(){
        if($scope.relationshipForm.$dirty){
            ServiceUtils.partialModalBoolean($scope, "Atenção", "Todas as mudanças serão perdidas. Deseja continuar?", function() {
                $scope.clearForms()
            });
        }else{
            $scope.clearForms()
        }
    }

    // Clean Forms
    $scope.clearForms = function() {
        $scope.relationship = {
            id : "",
            originPoint : "",
            destPoint : "",
            initialPoint : false,
            endPoint : false,
        };
        $scope.edit = false;

        if(!angular.isUndefined($scope.relationshipForm)) {
            $scope.relationshipForm.$setPristine();
        }
    }

    $scope.ok = function(action, modalInstance) {
        $scope.clearForms();
        modalInstance.close();
    }

    $scope.confirmOk = function(action, modalInstance){
        if(action == "demandType"){
           $scope.clearForms();
           $scope.getWkfList();
       }else{
           $scope.clearForms();
       }
       modalInstance.close();
   }

    // Init
    $scope.init = function() {
    	$scope.getPointList();
    	$scope.getWkfList();
    	
    }


    var graph;
    var springy;

    // Change Tab
    $scope.refreshGraph = function() {
        graph = null;
        springy = null;

        var canvas = jQuery('#workflowCanvas');

        canvas.width = canvas.width;

        var graphJSON = {};
        graphJSON.nodes = [];
        graphJSON.edges = [];

        angular.forEach($scope.workflowForm.workflowPointCreateList, function(item) {
            var node = [];

            node.push(item.point.name);

            if (item.indInitialFinal == 'I') {
                node.push('#1cb40e');
            } else if (item.indInitialFinal == 'F') {
                node.push('#f2051d');
            }

            graphJSON.nodes.push(node);
        });

        angular.forEach($scope.workflowForm.relationshipCreateList, function(item) {
            var edgeitem = [];
            edgeitem.push(item.originPoint.point.name);
            edgeitem.push(item.destinyPoint.point.name);
            graphJSON.edges.push(edgeitem);
        });

        graph = new Springy.Graph();
        graph.loadJSON(graphJSON);

        springy = canvas.springy({
            graph: graph
        });
    }


    $scope.saveGraph = function(){
        var img = cy.png();
        $('body').html('<img src="'+img+'"/>');
    }

    $scope.saveUpdate = function(){
        var json = $scope.workflowForm;

        var update = false;

        if ($scope.workflowForm.workflowId != null && $scope.workflowForm.workflowId != "") {
            update = true;
        }
        $http({
            method : update ? 'PUT' : 'POST',
            url : update ? '/workflows/' + $scope.workflowForm.workflowId : '/workflows',
            data : json,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(
                function(data) {
                    $scope.clearForms();
                    if (update) {
                        ServiceUtils.openCustomActionMessageModal($scope,
                                'Workflow atualizado com sucesso',
                                'saveOrUpdateAction');
                    } else {
                        ServiceUtils.openCustomActionMessageModal($scope,
                                'Workflow incluído com sucesso',
                                'saveOrUpdateAction');
                    }
                    $scope.getWkfList();
                }).error(function(list) {
            angular.forEach(list, function(data) {
            	ServiceUtils.openMessageModal($scope, data.message);
            });
        });
    }

    $scope.remove = function(item){
        if (!angular.isUndefined(item.idWorkflowPointRelationship)) {
            if(item.idWorkflowPointRelationship != null){
                $scope.workflowForm.relationshipDeleteList.push(item);
            }
            $scope.workflowForm.relationshipCreateList.splice($scope.workflowForm.relationshipCreateList.indexOf(item), 1);

            var removeOrigin = true;
            var removeDestiny = true;

            angular.forEach($scope.workflowForm.relationshipCreateList, function(relationshipItem) {
                // Origin
                if (item.originPoint.point.id == relationshipItem.originPoint.point.id
                        || item.originPoint.point.id == relationshipItem.destinyPoint.point.id) {
                    removeOrigin = false;
                }

                // Destiny
                if (item.destinyPoint.point.id == relationshipItem.originPoint.point.id
                        || item.destinyPoint.point.id == relationshipItem.destinyPoint.point.id) {
                    removeOrigin = false;
                }
            });
            $scope.refreshGraph();
        } else {
            $scope.workflowForm.relationshipCreateList.splice($scope.workflowForm.relationshipCreateList.indexOf(item), 1);
            $scope.refreshGraph();
        }
    }

    $scope.orderByIconChange = function(field, reverse) {
        if ($scope.predicate == field && reverse) {
            return true;
        }
        return false;
    }

    $scope.init();

    $scope.zoomIn = function(){
        graphDidio != null ? graphDidio.changeZoom(1) : void(0)
    }

    $scope.zoomOut = function(){
        graphDidio != null ? graphDidio.changeZoom(-1) : void(0)
    }

    $scope.reset = function(){
        graphDidio != null ? graphDidio.resetZoom() : void(0);
        graphDidio != null ? graphDidio.resetZoom() : void(0);
    }
}

function ModalTab01($scope, $modalInstance) {
    $scope.ok = function() {
    	$scope.getWkfList();
        $scope.clearForms();
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
};

function ModalConfirmRemove($scope, $modalInstance) {
    $scope.ok = function () {
        $scope.remove($scope.modalArgs);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}