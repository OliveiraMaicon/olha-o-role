'use strict';

/**
 * Point Controller
 */

function PointController($scope, $http, ServiceUtils) {

    // Change Tab
    $scope.swithTab = function(tab) {

        if (!$scope.formsAreClean()) {
            return false;
        }

        $scope.clearForms();

        if (tab == "tab-01") {
            $scope.init();
        }

        WM.tabs.toggle(tab);
        return true;
    }

    // Form Cleaned
    $scope.formsAreClean = function() {
        if ($scope.pointForm.$dirty) {
            return false;
        }
        return true;
    }

    // Clean Forms
    $scope.clearForms = function() {
        $scope.nameErrorMessage = "";
        $scope.descriptionErrorMessage = "";
        $scope.statusErrorMessage = "";
        $scope.point = {
		       'id' : '',
		       'name' : '',
		       'description' : '',
		       'color' : '#1a75ce',
		       'status' : 'A',
		       'sendMail': 'N'
	       };
        $scope.pointForm.$setPristine();
    }


    $scope.getPointList = function() {
        $http.get('/points').success(function(data) {
            $scope.pointList = data;
        });
    }

    $scope.orderByIconChange = function(field, reverse) {
        if ($scope.predicate == field && reverse) {
            return true;
        }
        return false;
    }

    $scope.editPoint = function(id) {
        $http({
            method : 'GET',
            url : '/points/' + id,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.swithTab("tab-01");
            console.log(data);
            $scope.point = data;
        }).error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal == true) {
                    ServiceUtils.openMessageModal($scope, data.message);
                } else {
                    $scope[data.id] = data.message;
                }
            });
        });
    }

    $scope.setpointList = function(pointList) {
        $scope.pointList = pointList;
    }

    $scope.saveUpdate = function() {
        var json = {
            'name' : $scope.point.name,
            'description' : $scope.point.description,
            'color' : $scope.point.color,
            'status' : $scope.point.status,
            'version' : $scope.point.version,
            'sendMail' : $scope.point.sendMail
        }

        console.log(json);

        var update = false;

        if ($scope.point.id != null && $scope.point.id != "") {
            update = true;
        }

        if ($scope.pointForm.$valid) {
            $http({
                method : update ? 'PUT' : 'POST',
                url : update ? '/points/' + $scope.point.id : '/points',
                data : json,
                headers : {
                    'Content-Type' : 'application/json'
                }
            }).success(
                    function(data) {
                        $scope.pointList = data;
                        $scope.clearForms();
                        if (update) {
                            ServiceUtils.openCustomActionMessageModal($scope,
                                    'Ponto atualizado com sucesso',
                                    'saveOrUpdateAction');
                        } else {
                            ServiceUtils.openCustomActionMessageModal($scope,
                                    'Ponto incluído com sucesso',
                                    'saveOrUpdateAction');
                        }
                    }).error(function(list) {
                angular.forEach(list, function(data) {
                    if (data.modal == true) {
                        ServiceUtils.openMessageModal($scope, data.message);
                    } else {
                        $scope[data.id] = data.message;
                    }
                });
            });
        }
    }

    $scope.activeInactive = function(item) {
        var json = {}

        json.version = item.version;

        $http({
            method : 'PUT',
            url : '/points/' + item.id + '/active_inactive',
            data : json,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.clearForms();
            ServiceUtils.openMessageModal($scope, data);
            $scope.getPointList();
        }).error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal == true) {
                    ServiceUtils.openMessageModal($scope, data.message);
                } else {
                    $scope[data.id] = data.message;
                }
            });
        });

    }

    $scope.ok = function(action, modalInstance) {
        if (action == 'saveOrUpdateAction') {
            $scope.clearForms();
            $scope.swithTab("tab-01");
        } else if (action == 'cleanAndSwithTab1') {
            $scope.clearForms();
            $scope.swithTab("tab-01");
        }

        modalInstance.close();
    }

    // Init
    $scope.init = function() {
        $scope.getPointList();
    }

    $scope.point = {
	           'id' : '',
	           'name' : '',
	           'description' : '',
	           'color' : '#1a75ce',
	           'status' : 'A',
	           'sendMail': 'N'   
           };

    $scope.init();
}

function ModalTab01($scope, $modalInstance) {
    $scope.ok = function() {
        $scope.clearForms();
        $scope.swithTab("tab-01");
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };


};

function ModalConfirmActiveInactive($scope, $modalInstance) {
    $scope.ok = function() {
        $scope.activeInactive($scope.modalArgs);
        $scope.clearForms();
        $scope.swithTab("tab-01");
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
}
