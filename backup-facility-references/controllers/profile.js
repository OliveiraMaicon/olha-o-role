'use strict';

/**
 * Profile Controller
 */

function ProfileController($scope, $http, ServiceUtils) {

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
        if ($scope.profileForm.$dirty) {
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

        $scope.profile = dataPost;
        $scope.profileForm.$setPristine();
    }

    $scope.getProfileList = function() {
        $http.get('/profiles').success(function(data) {
            $scope.profileList = data;
        });
    }

    $scope.orderByIconChange = function(field, reverse) {
        if ($scope.predicate == field && reverse) {
            return true;
        }
        return false;
    }

    $scope.editProfile = function(id) {
        $http({
            method : 'GET',
            url : '/profiles/' + id,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.swithTab("tab-01");
            $scope.profile = data;
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

    $scope.setProfileList = function(profileList) {
        $scope.profileList = profileList;
    }

    $scope.saveUpdate = function() {

        if ($scope.profileForm.$valid) {

            var dataPost = {
                'id' : $scope.profile.id,
                'name' : $scope.profile.name,
                'description' : $scope.profile.description,
                'status' : $scope.profile.status
            }

            var update = false;

            if ($scope.profile.id != null && $scope.profile.id != "") {
                update = true;
            }

            $http({
                method : update ? 'PUT' : 'POST',
                url : update ? '/profiles/' + dataPost.id : '/profiles',
                data : dataPost,
                headers : {
                    'Content-Type' : 'application/json'
                }
            }).success(
                    function(data) {
                        $scope.profileList = data;
                        if (update) {
                            ServiceUtils.openCustomActionMessageModal($scope,
                                    'Perfil atualizado com sucesso',
                                    'saveOrUpdateAction');
                        } else {
                            ServiceUtils.openCustomActionMessageModal($scope,
                                    'Perfil incluído com sucesso',
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
        var dataPUT = {};

        dataPUT.version = item.version;

        $http({
            method : 'PUT',
            url : '/profiles/' + item.id + '/active_inactive',
            data : dataPUT,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.clearForms();
            ServiceUtils.openMessageModal($scope, data);
            $scope.getProfileList();
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
        $scope.getProfileList();
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
