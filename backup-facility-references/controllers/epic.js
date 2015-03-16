function epicController($scope, $http, ServiceUtils) {

    // Change Tab
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
        if ($scope.epicForm.$dirty) {
            return false;
        }
        return true;
    }

    // Clean Forms
    $scope.clearForms = function() {
        $scope.selAreaErrorMessage = "";
        $scope.txtSubjectErrorMessage = "";
        $scope.selStatusErrorMessage = "";

        var dataPost = {
            'id' : '',
            'subject' : '',
            'idRequestArea' : '',
            'status' : 'A',
            'version' : ''
        }

        $scope.epic = dataPost;
        $scope.epicForm.$setPristine();
    }

    // Init
    $scope.init = function() {
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;

        $scope.getRequestingAreaList();
        $scope.getEpicList();
    }

    $scope.getRequestingAreaList = function(){
        $http.get('/requesting_areas').success(function(data) {
            $scope.requestingAreasList = data;
        });
    }

    $scope.saveUpdate = function() {
        var json = {
            'id' : $scope.epic.id,
            'subject' : $scope.epic.subject,
            'idRequestArea' : $scope.epic.idRequestArea,
            'status' : $scope.epic.status,
            'version' : $scope.epic.version
        }

        var update = false;

        if ($scope.epic.id != null && $scope.epic.id != "") {
            update = true;
        }

        if ($scope.epicForm.$valid) {
            $http({
                method : update ? 'PUT' : 'POST',
                url : update ? '/epics/' + $scope.epic.id : '/epics',
                data : json,
                headers : {
                    'Content-Type' : 'application/json'
                }
            }).success(
                function(data) {
                    $scope.clearForms();
                    if (update) {
                        ServiceUtils.openCustomActionMessageModal($scope,
                                'Épico atualizado com sucesso',
                                'saveOrUpdateAction');
                    } else {
                        ServiceUtils.openCustomActionMessageModal($scope,
                                'Épico incluído com sucesso',
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
        }else{
            console.log($scope.epicForm);
        }
    }

    $scope.activeInactive = function(item) {
        var json = {}

        json.version = item.version;

        $http({
            method : 'PUT',
            url : '/epics/' + item.id + '/active_inactive',
            data : json,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            ServiceUtils.openCustomActionMessageModal($scope,'Épico atualizado com sucesso','saveOrUpdateAction');
            $scope.getEpicList();
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

    $scope.editEpic = function(id) {
        $scope.epicForm.$dirty = true;
        $http({
            method : 'GET',
            url : '/epics/' + id,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            $scope.swithTab("tab-01");
            $scope.epic = data;
            $scope.epic.idRequestArea = data.requestingArea.id;
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

    var dataGet = {};

    $scope.order = {};
    $scope.order.requestingArea = false;
    $scope.order.subject = true;
    $scope.order.updateDate = false;
    $scope.order.status = false;


    $scope.orderBy = function(field, reverse) {
        dataGet.orderByField = field;
        dataGet.reverse = reverse;

        if ($scope.currentPage != 1) {
            $scope.currentPage = 1;
            findEpics();
        } else {
            findEpics();
        }
    }

    $scope.orderByIconChange = function(field, reverse) {
        if(dataGet.orderByField == field && dataGet.reverse)
        {
            return true;
        }
        return false;
    }

    $scope.pageChanged = function() {
        findEpics();
    }

    function findEpics() {
        var orderByField = angular.isUndefined(dataGet.orderByField) ? "" : dataGet.orderByField;
        var reverse = angular.isUndefined(dataGet.reverse) ? "" : dataGet.reverse;
        var filter = "";

        // Page
        filter = filter + '?page=' + $scope.currentPage;

        // Order By Field
        if (!angular.isUndefined(dataGet.orderByField)){
            filter = filter + '&orderByField=' + dataGet.orderByField;
        }

        // Reverse
        if (!angular.isUndefined(dataGet.reverse)){
            filter = filter + '&reverse=' + dataGet.reverse;
        }

        $http.get('/epics' + filter
            ).success(function(data) {
            if (data.totalItems != null) {
                $scope.totalEpics = data.totalItems;
            }
            $scope.epicList = data.epics;
        }).error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal) {
                    ServiceUtils.openMessageModal($scope, data.message);
                } else {
                    $scope[data.id] = data.message;
                }
            });
        });
    }

    $scope.getEpicList = function(){
        var filter = "";

        // Page
        filter = filter + '?page=' + $scope.currentPage;

        $http.get('/epics' + filter
            ).success(function(data) {
                console.log(data);
                $scope.epicList = data.epics;
                $scope.totalEpics = data.totalItems;
        });
    }

    $scope.init();
    
    // ModalMessages
    $scope.ok = function(action, modalInstance) {
        if (action == 'saveOrUpdateAction') {
            $scope.swithTab("tab-01");
            $scope.getEpicList();
        }        
        modalInstance.close();
    }
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
};    