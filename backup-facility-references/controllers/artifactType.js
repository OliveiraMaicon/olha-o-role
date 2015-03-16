/**
 * Artifact Controller
 */

function artifactController($scope, $http, ServiceUtils) {
   
    //Change Tab
    
    $scope.swithTab = function(tab){
        if(tab == "tab-01"){
            $scope.initArtifact();
        }
        
        $scope.cleanForms();
        WM.tabs.toggle(tab);
    }
    

    $scope.getArtifactList = function() {
        $http.get('/artifact_type')
            .success(function(data) {
                $scope.artifactList = data;
        });
    }

    $scope.getArtifactList();

    $scope.setArtifactList = function(artifactList) {
       $scope.artifactList = artifactList;
    }

    //Clean Forms
    
    $scope.cleanForms = function() {

        $scope.nameErrorMessage = "";
        $scope.descriptionErrorMessage = "";
        $scope.genConcurrenceErrorMessage = "";
        $scope.genPackageErrorMessage = "";
        $scope.genTrackingErrorMessage = "";

        var defaultArtifactForm = {
                id : null,
                name : "",
                description : "",
                genConcurrence : "S",
                genPackage : "S",
                genTracking : "S",
        };

        $scope.artifactType = defaultArtifactForm;

        if(!angular.isUndefined($scope.artifactForm)){
            $scope.artifactForm.dirty = false;
            $scope.artifactForm.$setPristine();
        };

    }

    $scope.cancelBtn = function(){
        if($scope.artifactForm.$dirty){
            ServiceUtils.partialModalBoolean($scope, "Atenção", "Todas as mudanças serão perdidas. Deseja continuar?", function() {
                $scope.cleanForms()
            });
        }else{
            $scope.cleanForms()
        }
    }
    
    $scope.initArtifact = function(){
        //$scope.cleanErrors();
        $scope.getArtifactList();
    }


    $scope.editArtifact = function(id) {

        $http({
             method  : 'GET',
             url     : '/artifact_type/'+id,
             headers : { 'Content-Type': 'application/json' }
            })
            .success(function(data) {

                $scope.artifactType = data;

                if($scope.artifactType.genConcurrence == null){
                    $scope.artifactType.genConcurrence = "S"
                }

                if($scope.artifactType.genPackage == null){
                    $scope.artifactType.genPackage = "S"
                }

                if($scope.artifactType.genTracking == null){
                    $scope.artifactType.genTracking = "S"
                }

                $scope.artifactType = data;

                $scope.artifactForm.$valid = true;

                $scope.artifactForm.$dirty = true;
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
    }

    $scope.submitArtifactForm = function() {

        var data = $scope.artifactType;
        console.log(data);

        $http({
            method  : 'PUT',
            url     : '/artifact_type',
            data    : data,
            headers : { 'Content-Type': 'application/json' }
        })
        .success(function(data) {
            $scope.getArtifactList();
            $scope.cleanForms();
            ServiceUtils.openMessageModal($scope, 'Operação realizada com sucesso.');
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
    }

    $scope.orderByIconChange = function(field, reverse) {
        if($scope.predicate == field && reverse)
        {
            return true;
        }
        return false;
    }

    $scope.cleanForms()

    $scope.getTrackingType = function() {

        $http({
            method  : 'GET',
            url     : '/tracking_type',
            headers : { 'Content-Type': 'application/json' }
        })
        .success(function(data) {
            $scope.trackingType = data;
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
    }
    $scope.getTrackingType();
    
}

