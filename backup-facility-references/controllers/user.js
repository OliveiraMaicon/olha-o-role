
function userController($scope, $http, $filter, ServiceUtils) {
    

    $scope.searchProfileIdList = [];
    $scope.searchTeamIdList = [];
    $scope.selectedProfileList = [];
    $scope.deleteProfileList = [];
    $scope.idOldProfiles = []; 
    var dataGet = {};


    // Form Cleaned
    $scope.formsAreClean = function() {
        if ($scope.searchUserForm.$dirty || $scope.registerForm.$dirty) {
            return false;
        }
        return true;
    }
    
    

    /*#############################################################################*/
    /*#                           Page                                         #*/
    /*#############################################################################*/

    // Change Tab
    $scope.swithTab = function(tab) {
        if (!$scope.formsAreClean()) {
            return false;
        }

        $scope.clearForms();

        if (tab == "tab-01") {
            $scope.initSearch();
        } else if (tab == "tab-02") {
            $scope.initregister();
        }

        WM.tabs.toggle(tab);
        return true;

    }

    // Clean Forms
    $scope.clearForms = function() {
        $('.chkFormProfile').each(function() {
            $(this).removeAttr('checked');
        });
        $scope.searchUser = {};
        $scope.searchUser = {
            'status' : ''
        };
        $scope.userForm = {};
        $scope.userForm = {
            'status' : 'A'
        };
        $scope.searchUserForm.$setPristine();
        $scope.registerForm.$setPristine();
        
        $scope.loginErrorMessage = null;
        $scope.nameErrorMessage = null;
        $scope.emailErrorMessage = null;
        $scope.statusErrorMessage = null;
        $scope.profileErrorMessage = null;
        $scope.selectedProfileList = [];
        
        $scope.findProfileList();
        $scope.findTeamList();
        $scope.findUserList();
        
    }

    // save action
    $scope.saveUpdate = function() {
        var update = false;

        if ($scope.userForm.id != null) {
            update = true;
        }

        var dataAction = {
                'id' : $scope.userForm.id,
                'login' : $scope.userForm.login,
                'name' : $scope.userForm.name,
                'email' : $scope.userForm.email,
                'status' : $scope.userForm.status,
                'version' : $scope.userForm.version,
                'profileListSelected' : $scope.selectedProfileList,
                'deleteProfileList' : $scope.deleteProfileList,
                'idOldProfiles' : $scope.idOldProfiles
        }

        if ($scope.registerForm.$valid) {
            $http({
                method  : update ? 'PUT' : 'POST',
                url     : update ? '/users/' + $scope.userForm.id : '/users',
                data    : dataAction,
                headers : { 'Content-Type' : 'application/json' }
            }).success(function(data) {
                    $scope.clearForms();
                    $scope.userForm = data;
                    $scope.profileList = data.profiles;
                    $scope.userList = data.users;
                    if (update) {
                        ServiceUtils.openCustomActionMessageModal($scope,
                                'Usuário atualizado com sucesso',
                                'saveOrUpdateAction');
                    } else {
                        ServiceUtils.openCustomActionMessageModal($scope,
                                'Usuário incluído com sucesso',
                                'saveOrUpdateAction');
                    }
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
    }
    
    $scope.edit = function(id) {
        $http.get('/users/'+id)
            .success(function(data) {
                $scope.userForm = data;
                angular.forEach(data.profileListSelected, function(data) {
                        $scope.idOldProfiles.push(data);
                    });
                $scope.selectedProfileList = data.profileListSelected;
                $scope.profileList = data.profiles;
                $scope.registerFormTitle = "Edição de Usuário - " + data.name;
                $scope.registerForm.$dirty = true;
                WM.tabs.toggle("tab-02");
            });
     }
    
    $scope.activeInactive = function(user) {

        var dataPUT = {
                'version' : user.version
        }


        
        $http({
            method  : 'PUT',
            url     : '/users/' + user.id + '/active_inactive',
            data    : dataPUT,
            headers : { 'Content-Type': 'application/json' }
        })
        .success(function(data) {
            var orderBy = $filter('orderByWithoutDiacritics');
            var list = orderBy(data.users, 'login', false);
            pagination(list);
            if(data.status == 'A'){
                ServiceUtils.openMessageModal($scope, 'Usuário ativado com sucesso');
            }else{
                ServiceUtils.openMessageModal($scope, 'Usuário inativado com sucesso');
            }   
            
        }).error(function(data) {
            angular.forEach(data, function(data) {
                $scope[data.id] = data.message;
                ServiceUtils.openMessageModal($scope, data.message);
            });
        });
    }
    
    $scope.itemsPerPage = 10
    $scope.currentPage = 1;

    $scope.pageCount = function () {
        return Math.ceil($scope.userList.length / $scope.itemsPerPage);
    };

    $scope.search = function() {
        
        dataGet.fieldSearch = angular.isUndefined($scope.searchUser.fieldSearch) ? "" : $scope.searchUser.fieldSearch;
        dataGet.status = angular.isUndefined($scope.searchUser.status) ? "" : $scope.searchUser.status;

        if (dataGet.fieldSearch !=null && dataGet.fieldSearch.length > 0) {
            dataGet.fieldSearch = ServiceUtils.removeSymbols(dataGet.fieldSearch);
        }
        console.log(dataGet);

        $http.get('/users?fieldSearch=' + dataGet.fieldSearch + '&status=' + dataGet.status
                + '&profileIdList=' + $scope.searchProfileIdList + '&teamIdList=' + $scope.searchTeamIdList + '&associateTeam=true')
            .success(function(data) {
                var orderBy = $filter('orderByWithoutDiacritics');
                var list = orderBy(data, 'login', false);
                pagination(list);
            })
            .error(function(data) {
                if (data.length > 1 || data[0].id != null) {
                    angular.forEach(data, function(data) {
                        $scope[data.id] = data.message;
                    });
                } else {
                    ServiceUtils.openMessageModal($scope, data[0].message);
                }
            });
    }

    $scope.orderBy = function(field, reverse) {
        
        dataGet.orderByField = field;
        dataGet.reverse = reverse;
        var orderBy = $filter('orderByWithoutDiacritics');
        var data = orderBy($scope.userListFull, field, reverse);
        pagination(data);
        $scope.currentPage = 1;
    }
    
    $scope.orderByIconChange = function(field, reverse) {
        if(dataGet.orderByField == field && reverse)
        {
            return true;
        }
        return false;
    }
    
    function pagination(data) {
        $scope.userListFull = data;
        $scope.totalItems = $scope.userListFull.length;
        $scope.$watch('currentPage + itemsPerPage', function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                end = begin + $scope.itemsPerPage;
            $scope.userList = $scope.userListFull.slice(begin, end);
        });
    }

    $scope.findUserList = function() {
        $http.get('/users?associateTeam=true')
            .success(function(data) {
                var orderBy = $filter('orderByWithoutDiacritics');
                var list = orderBy(data, 'login', false);
                pagination(list);
            });
    }

    $scope.findProfileList = function() {
        $http.get('/profiles?status=A')
            .success(function(data) {
                $scope.profileList = data;
            });
    }

    $scope.findTeamList = function() {
        $http.get('/teams')
            .success(function(data) {
                $scope.teamList = data
            });
    }
    
    // Profile Check
    $scope.checkProfile = function($scope) {
        $scope.searchUserForm.$dirty = true;
        var index = $scope.searchProfileIdList.indexOf($scope.item.id);
           if (index != -1) {
            $scope.searchProfileIdList.splice(index, 1);
        } else {
            $scope.searchProfileIdList.push($scope.item.id);
        }
    }

    // Team Check
    $scope.checkTeam = function(id) {
        $scope.searchUserForm.$dirty = true;
        var index = $scope.searchTeamIdList.indexOf(id);
           if (index != -1) {
            $scope.searchTeamIdList.splice(index, 1);
        } else {
            $scope.searchTeamIdList.push(id);
        }
    }
    
    
     // Profile selected for cadastre
    $scope.selectedProfile = function(id) {
       var indexSelected = $scope.selectedProfileList.indexOf(id);
       var indexDelected = $scope.deleteProfileList.indexOf(id);
           if (indexSelected != -1) {
            $scope.selectedProfileList.splice(indexSelected, 1);

             if(indexDelected == -1){
                 $scope.deleteProfileList.push(id);
             }
        } else {
            $scope.selectedProfileList.push(id);

            if(indexDelected != -1){
                 $scope.deleteProfileList.splice(indexDelected,1);
             }
        }
    }


     // ModalMessages callback
    $scope.ok = function(action, modalInstance) {
        if (action == 'saveOrUpdateAction') {
            $scope.clearForms();
            $scope.swithTab("tab-01");
        }
        else if (action == 'cleanAndSwithTab1') {
            $scope.clearForms();
            $scope.swithTab("tab-01");
        }
        else if (action == 'cleanAndSwithTab2') {
            $scope.clearForms();
            $scope.swithTab("tab-02");
        }
        
        modalInstance.close();
    }

    // init tab 01
    $scope.initSearch = function() {
        $scope.findProfileList();
        $scope.findTeamList();
        $scope.findUserList();
    }

    // init tab 02
    $scope.initregister = function() {
        $scope.findProfileList();
        $scope.registerFormTitle = "Cadastro de Usuário";
    }
    
    $scope.searchUser = {};
    $scope.initSearch();
}

/**
 * Modal Controllers
 */
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

function ModalTab02($scope, $modalInstance) {
    $scope.ok = function() {
        $scope.clearForms();
        $scope.swithTab("tab-02");
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
}

function ModalConfirmActiveInactive($scope, $modalInstance) {
    $scope.ok = function () {
        $scope.activeInactive($scope.modalArgs);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}
