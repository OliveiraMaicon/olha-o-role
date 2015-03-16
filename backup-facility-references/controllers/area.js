'use strict';

/**
 * Area Controller
 */

function AreaController($scope, $http, ServiceUtils) {

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
        if ($scope.areaForm.$dirty) {
            return false;
        }
        return true;
    }

    // Clean Forms
    $scope.clearForms = function() {
        $scope.nameErrorMessage = "";
        $scope.descriptionErrorMessage = "";
        $scope.statusErrorMessage = "";
        var dataPost = {
                'id' : '',
                'name' : '',
                'description' : '',
                'status' : 'A'
        }

        $scope.area = dataPost;
        $scope.areaForm.$setPristine();
    }

    $scope.getAreaList = function() {
        $http.get('/areas').success(function(data) {
            $scope.areaList = data;
        });
    }

    $scope.orderByIconChange = function(field, reverse) {
        if ($scope.predicate == field && reverse) {
            return true;
        }
        return false;
    }

    $scope.editArea = function(id) {
        $http({
            method : 'GET',
            url : '/areas/' + id,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.swithTab("tab-01");
            $scope.area = data;
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

    $scope.setAreaList = function(areaList) {
        $scope.areaList = areaList;
    }

    $scope.saveUpdate = function() {
        var json = {
            'name' : $scope.area.name,
            'description' : $scope.area.description,
            'status' : $scope.area.status,
            'version' : $scope.area.version
        }

        var update = false;

        if ($scope.area.id != null && $scope.area.id != "") {
            update = true;
        }

        if ($scope.areaForm.$valid) {
            $http({
                method : update ? 'PUT' : 'POST',
                url : update ? '/areas/' + $scope.area.id : '/areas',
                data : json,
                headers : {
                    'Content-Type' : 'application/json'
                }
            }).success(
                    function(data) {
                        $scope.areaList = data;
                        $scope.clearForms();
                        if (update) {
                            ServiceUtils.openCustomActionMessageModal($scope,
                                    'Área atualizada com sucesso',
                                    'saveOrUpdateAction');
                        } else {
                            ServiceUtils.openCustomActionMessageModal($scope,
                                    'Área incluída com sucesso',
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
            url : '/areas/' + item.id + '/active_inactive',
            data : json,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.clearForms();
            ServiceUtils.openMessageModal($scope, data);
            $scope.getAreaList();
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
        $scope.getAreaList();
    }

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
