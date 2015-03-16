// Services
app.service('ServiceUtils', function($http, $window, $location, $modal) {


    this.convertDateToString = function(date){
        if(date != null && date != ""){
            if ( isNaN( new Date(date) ) ) {
                return "";
          }
          else {
            var dateTmp = new Date(date);
            return (dateTmp.getDate() + 1) + "/" + (dateTmp.getMonth() + 1) + "/" + dateTmp.getFullYear();
          }

        }else{
            return "";
        }
    }

    // Simple message modal
    this.openMessageModal = function($scope, modalMessages) {
        if (modalMessages instanceof Array) {
            $scope.modalMessages = modalMessages;
        } else {
            $scope.modalMessages = [modalMessages];
        }

        return modalInstance = $modal.open({
            templateUrl : '/public/messageModal.html', // modal w/ ok only
            scope : $scope,
            controller : function($scope){
                $scope.callOkButton = function(){
                    modalInstance.dismiss();
                };
            }
        });
    };

    this.openModalOkCancel = function($scope,modalMessage,modalArgs,modalAction) {
        $scope.modalMessage = modalMessage;
        $scope.modalArgs = modalArgs;
        $scope.modalAction = modalAction;

        var modalInstance = $modal.open({
            templateUrl : '/public/customConfirmModal.html',
            controller : 'ModalConfirmActionController',
            scope : $scope
        });
    };

    this.partialModalBoolean = function($scope, modalTitle, modalBody, callback) {
        var modalInstance = $modal.open({
            templateUrl : '/public/partialModalBoolean.html',
            scope : $scope,
            controller : function ($scope) {
                $scope.title = modalTitle;
                $scope.body = modalBody;
                $scope.callOkButton = function(){
                    modalInstance.close();
                    callback();
                };
                $scope.callCancelButton = function(){
                    modalInstance.dismiss();
                };
            }
        });

        return false;
    };

    this.partialModalText = function($scope, modalTitle, callbackVar) {
        var modalInstance = $modal.open({
            templateUrl : '/public/partialModalText.html',
            scope : $scope,
            controller : function ($scope) {
                $scope.title = modalTitle;
                $scope.callOkButton = function(modalText){
                    modalInstance.close();
                    callbackVar(modalText);
                };
                $scope.callCancelButton = function(){
                    modalInstance.dismiss();
                };
            }
        });
        return false;
    };

    this.modalDemand = function($scope, idDemand, showBtnEdit, showBtnAnalysis, showBtnFrozen, showBtnReleased, showBtnFinalized, callback) {
        function showDateString(date){
            if(!angular.isUndefined(date) && date != null){
                  return date;
            }else{
                return "";
            }
        }

        $http.get('/demands/' + idDemand).success(function(data) {
            console.log(data);
            var modalInstance = $modal.open({
            templateUrl : '/public/modalDemand.html',
            scope : $scope,
            controller : function ($scope) {
                $scope.msgError = "";
                $scope.msgSuccess = "";
                $scope.demand = data;
                $scope.dtDev = showDateString(data.dtIniDevStr) + " - " + showDateString(data.dtFimDevStr);
                $scope.dtHom = showDateString(data.dtIniHomStr) + " - " + showDateString(data.dtFimHomStr);
                $scope.dtProd = showDateString(data.dtIniProdStr);
                $scope.showBtnAnalysis = showBtnAnalysis;
                $scope.showBtnFrozen = showBtnFrozen;
                $scope.showBtnReleased = showBtnReleased;
                $scope.showBtnFinalized = showBtnFinalized;
                $scope.showBtnEdit = showBtnEdit;

                function changeStatusDemand(dataPost){
                    $http({
                         method  : 'PUT',
                         url     : '/demands/change_status',
                         data    : dataPost,
                         headers : { 'Content-Type': 'application/json' }
                    }).success(function(data) {
                        $scope.demand.progressStatus = status;
                        if(data != null && data.length > 0){
                            $scope.msgSuccess = data.message;
                            $scope.msgError = "";
                        }else{
                            $scope.msgSuccess = "A demanda foi atualizada com sucesso!";
                            $scope.msgError = "";
                        }

                        callback();
                    }).error(function(data) {
                        angular.forEach(data, function(data) {
                            $scope.msgError = data.message;
                            $scope.msgSuccess = "";
                        });
                    });
                }

                $scope.callCancelButton = function(){
                     modalInstance.dismiss();
                };

                $scope.callStartAnalysisButton = function(){
                     changeStatusDemand({ id : idDemand, progressStatus : "ANALYSIS" });
                };

                $scope.callStartFrozenButton = function(){
                    changeStatusDemand({ id : idDemand, progressStatus : "FROZEN" });
                };

                $scope.callStartDevButton = function(){
                    changeStatusDemand({ id : idDemand, progressStatus : "RELEASED" });
                };

                $scope.callFinalizeDevButton = function(){
                    if(!angular.isUndefined($scope.finalPointId)){
                        changeStatusDemand({ id : idDemand, progressStatus : "FINALIZED", idNewPoint : $scope.finalPointId   });
                    }else{
                        $scope.msgError = "Ponto final não reconhecido";
                    }
                    callback();
                };

                $scope.callEditButton = function(){
                    $window.location.href = "/action/demand/#/#edit-" + idDemand;
                };
            }

            });
        });

        return false
    };

    // Simple message modal with custom action
    this.openCustomActionMessageModal = function($scope, modalMessage, modalAction) {
	$scope.modalMessage = modalMessage;
	$scope.modalAction = modalAction;

	var modalInstance = $modal.open({
	    templateUrl : '/public/customActionMessageModal.html',
	    controller : 'ModalCustomActionController',
	    scope : $scope
	});
    };

    this.removeSymbols = function(text) {
	    return normalize(text);
    };
});