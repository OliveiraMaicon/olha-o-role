
function teamController ($scope, $http, $filter, $location,ServiceUtils){

    var dataGet = {};
    
 //IF Form Cleaned
    $scope.formsAreClean = function() {
        if ($scope.teamForm.$dirty) {
            return false;
        }
        return true;
    }
    
 //Change Tab
    $scope.swithTab = function(tab) {

        if (!$scope.formsAreClean()) {
            return false;
        }

        $scope.clearForms();

        if (tab == "tab-01") {
            $scope.initTab01();
        } else if (tab == "tab-02") {
            $scope.initTab02();
        }

        WM.tabs.toggle(tab);
        return true;

    }
    
    //Clean Forms
    $scope.clearForms = function() {
        
        var dataPost = {
                'id' : '',
                'name' : '',
                'description' : '',
                'status' : 'A',
                'idArea' : '',
        }
        
        $scope.team = dataPost;
        
        $scope.userList = {};
        $scope.members = {};
        $scope.teamForm.$setPristine();
    }
    
    //Requesting Team
    $scope.getTeams = function() {
        $http.get('/teams')
            .success(function(data) {
                $scope.refreshGridTeam(data);
            });
    }
    
    //Requesting Users
    $scope.getUsers = function() {
        $http.get('/users')
            .success(function(data) {
                $scope.refreshGridUser(data);
            });
    }
    
    $scope.orderBy = function(field, reverse, cadastre) {
        dataGet.orderByField = field;
        dataGet.reverse = reverse;
        var orderBy = $filter('orderByWithoutDiacritics');
        if(cadastre){
            var list = orderBy($scope.userListFull, field, reverse);
            $scope.refreshGridUser(list);
        }else{
            var list = orderBy($scope.teamListFull, field, reverse);
            $scope.refreshGridTeam(list);
        }
        
        $scope.currentPage = 1;
    }
    
    $scope.orderByIconChange = function(field, reverse) {
        if(dataGet.orderByField == field && dataGet.reverse)
        {
            return true;
        }
        return false;
    }

    $scope.refreshGridUser = function(list){
        $scope.itemsPerPageUser = 5;
        $scope.currentPage = 1;
        $scope.userListFull = list;
        $scope.totalUsers = $scope.userListFull.length;
        $scope.$watch('currentPage + itemsPerPageUser', function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPageUser),
                end = begin + $scope.itemsPerPageUser;
            $scope.userList = $scope.userListFull.slice(begin, end);
        });
    }

    $scope.refreshGridTeam = function(data){
        $scope.itemsPerPageTeam = 10;
        $scope.currentPage = 1;
        $scope.teamListFull = data;
        $scope.totalTeams = $scope.teamListFull.length;
        $scope.$watch('currentPage + itemsPerPageTeam', function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPageTeam),
                end = begin + $scope.itemsPerPageTeam;
            $scope.teamList = $scope.teamListFull.slice(begin, end);
        });
    }
    
    $scope.processForm = function() {

        if ($scope.teamForm.$valid) {
            $scope.team.users = {};
            $scope.team.members = {};
            $scope.team.areaList = {};

            var dataAction = {
                "id" : $scope.team.id,
                "name" : $scope.team.name,
                "description" : $scope.team.description,
                "status" : $scope.team.status,
                "version" : $scope.team.version,
                "idArea" : $scope.team.idArea,
            };

            var update = false;
            if (dataAction.id != null && dataAction.id != "") {
                update = true;
            }

            $http({
                method  : update ? 'PUT' : 'POST',
                url     : update ? '/teams/' + dataAction.id : '/teams',
                data    : dataAction,
                headers : { 'Content-Type': 'application/json' }
            }).success(function(data) {
                if (update) {
                    ServiceUtils.openCustomActionMessageModal($scope,
                            'Time atualizado com sucesso',
                              'saveOrUpdateAction');
                } else {
                    ServiceUtils.openCustomActionMessageModal($scope,
                            'Time incluído com sucesso',
                            'saveOrUpdateAction');
                }
            }).error(function(data) {
                angular.forEach(data, function(data) {
                    if (data.modal) {
                        ServiceUtils.openMessageModal($scope, data.message);
                    } else {
                        $scope[data.id] = data.message;
                        $location.hash("site");
                        //$anchorScroll();
                    }
                });

            });
        }
    }

    $scope.editTeam = function(id) {
        $http({
             method  : 'GET',
             url     : '/teams/'+id,
             headers : { 'Content-Type': 'application/json' }
            })
            .success(function(data) {
                WM.tabs.toggle("tab-02");
                $scope.areaList = data.areaList;
                $scope.team = data;
                $scope.members = data.members;
                angular.forEach(data.members, function(member) {
                 angular.forEach(data.users, function(user) {
                    if(user.id == member.id){
                        user.member = true;
                    }
                 });
                });
                $scope.refreshGridUser(data.users);
             })
             .error(function(data){
                angular.forEach(data, function(data) {
                    $scope[data.id] = data.message;
                    ServiceUtils.openMessageModal($scope, data.message);
                });
            });
    }

     $scope.activeInactive = function(team) {

    	 var dataPut = {
                "version" : team.version,
                "status" : team.status
            }
            $http({
                  method  : 'PUT',
                  url     : '/teams/'+team.id+'/active_inactive/',
                  data    : dataPut,
                  headers : { 'Content-Type': 'application/json' }
              }).success(function(data) {
                ServiceUtils.openMessageModal($scope, data);
                $scope.getTeams();
                $scope.swithTab("tab-01");
        })
        .error(function(data){
            angular.forEach(data, function(data) {
                    $scope[data.id] = data.message;
                    ServiceUtils.openMessageModal($scope, data.message);
                });
        });
    }

    $scope.add = function(id){
        $http.get('/teams/addMember/'+id)
            .success(function(data) {
                angular.forEach($scope.userList, function(user) {
                    if(user.id == id){
                        user.member = true;
                    }
                });
                $scope.members = data.members;
            })
    }

    $scope.remove = function(id){
        $http.get('/teams/removeMember/'+id)
            .success(function(data) {
                angular.forEach($scope.userList, function(user) {
                    if(user.id == id){
                        user.member = false;
                    }
                });
                $scope.members = data.members;
            })
    }

    $scope.search = function(){
        $http.get('/teams/search/'+$scope.teamForm.fieldSearch)
            .success(function(data) {
                  $scope.isMember(data.users);
                  $scope.refreshGridUser(data.users);
            })
    }

    $scope.searchAll = function(){
        $http.get('/teams/search_all')
            .success(function(data) {
                $scope.isMember(data.users);
                var orderBy = $filter('orderBy');
                var list = orderBy(data.users, 'login', false);
                $scope.refreshGridUser(list);
            })
    }
    
    $scope.isMember = function(list){
        angular.forEach(list, function(user) {
            angular.forEach($scope.members, function(member) {
                if(member.id == user.id){
                    user.member = true;
                }
            });
        });
        return true;
    }

    $scope.initTab01 = function() {
        $scope.getTeams();
        $http.get('/teams/init_cadastre')
        .success(function(data) {
            $scope.members = data.members;
            $scope.areaList = data.areaList;
            $scope.refreshGridTeam(data.teamList);
            $scope.refreshGridUser(data.users);
        })
    }
    
    $scope.initTab02 = function() {
        $scope.getUsers();
    }
    
    $scope.initTab01();
    
    
 // ModalMessages
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

function ModalConfirmRemove($scope, $modalInstance) {
    $scope.ok = function () {
        $scope.remove($scope.modalArgs);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}

function ModalConfirmActiveInactive($scope, $modalInstance) {
    $scope.ok = function () {
        $scope.activeInactive($scope.modalArgs);
        $modalInstance.close();
    }
     $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}

