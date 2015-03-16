function deployController($scope, $http, $filter, ServiceUtils) {

    var dataGet = {reverse: false ,orderByField: ""};
    var dataGetSh = {reverse: false ,orderByField: ""};
    $scope.formFilter = [];
    $scope.itemsPerPageSh = 20;
    $scope.currentPageSh = 1;
    $scope.totalItemsSh = 0;
    $scope.changedTab = "tab01";

    $scope.swithTab = function(tab) {
        $scope.changedTab = tab;
        return true;
    };

    $scope.styleStatus = function(item) {

        var returnVar = {};

        if(!angular.isUndefined(item)) {

            var itemCompare = item.toLowerCase();

            if (itemCompare === "finalizado") {
                returnVar = { 'backgroundColor': '#007700', 'color': '#ffffff', 'border': '1px solid #ffffff' };
            } else if (itemCompare === "não processado") {
                returnVar = { 'backgroundColor': '#000077', 'color': '#ffffff', 'border': '1px solid #ffffff' };
            } else if (itemCompare === "erro") {
                returnVar = { 'backgroundColor': '#770000', 'color': '#ffffff', 'border': '1px solid #ffffff' };
            } else if (itemCompare === "processando" || itemCompare === "incluído") {
                returnVar = { 'backgroundColor': '#777700', 'color': '#ffffff', 'border': '1px solid #ffffff' };
            } else {
                returnVar = { 'backgroundColor': '#000000', 'color': '#ffffff', 'border': '1px solid #ffffff' };
            };
        };

        return returnVar;
    };

    $scope.refreshTokenTypeList = function(){
        $http({
            method  : 'GET',
            url     : '/deploy/artifact_type/',
            headers : { 'Content-Type': 'application/json' }
        }).success(function(data) {
            $scope.tokenTypeList = data;
        });
    };

    $scope.refreshTokenStatusList = function(){
        $http({
            method  : 'GET',
            url     : '/deploy/status/',
            headers : { 'Content-Type': 'application/json' }
        }).success(function(data) {
            $scope.tokenStatusList = data;
        });
    };

    $scope.refreshScheduleHistoricList = function(){

        var filter = "";

        if (!angular.isUndefined(dataGetSh.orderByField) && dataGetSh.orderByField != '') {
            filter = filter + '&orderByField=' + dataGetSh.orderByField;
        };

        if (!angular.isUndefined(dataGetSh.reverse) && dataGetSh.orderByField != '') {
            filter = filter + '&reverse=' + dataGetSh.reverse;
        };

        $http({
            method  : 'GET',
            url     : '/deploy/schedule_historic/?page='+ $scope.currentPageSh +'&pageSize=' + $scope.itemsPerPageSh + filter,
            headers : { 'Content-Type': 'application/json' }
        }).success(function(data) {
            if (data.total != null) {
                $scope.totalItemsSh = data.total;
            }
            $scope.scheduleHistoricList = data.listHistoric;
        });
    };

    $scope.orderBy = function(field, reverse) {
        dataGet.orderByField = field;
        dataGet.reverse = reverse;
        var orderBy = $filter('orderByWithoutDiacritics');
        var list = orderBy($scope.tokenVisionListOrder, field, reverse);
        $scope.pagination(list);
        $scope.tokenVisionList = list;
    };

    $scope.orderByNumber = function(field, reverse) {
        dataGet.orderByField = field;
        dataGet.reverse = reverse;
        var orderByNumber = $filter('orderBy');
        var list = orderByNumber($scope.tokenVisionListOrder, field, reverse);
        $scope.pagination(list);
        $scope.tokenVisionList = list;

    };

    $scope.orderBySh = function(field, reverse) {
        dataGetSh.orderByField = field;
        dataGetSh.reverse = reverse;
        $scope.refreshScheduleHistoricList();
    };


    $scope.orderByIconChange = function(field, reverse) {
        if(dataGet.orderByField == field && dataGet.reverse)
        {
            return true;
        }
        return false;
    };

    $scope.orderByIconChangeSh = function(field) {
        if(dataGetSh.orderByField == field && dataGetSh.reverse)
        {
            return true;
        }
        return false;
    };

    $scope.pagination = function(list){
        $scope.itemsPerPage = 20;
        $scope.currentPage = 1;
        $scope.tokenVisionListPaginate = list;
        $scope.totalItems = $scope.tokenVisionListPaginate.length;
        $scope.$watch('currentPage + itemsPerPage', function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                end = begin + $scope.itemsPerPage;
            $scope.tokenVisionList = $scope.tokenVisionListPaginate.slice(begin, end);
        });
    };

    $scope.pageChanged = function() {
        $scope.refreshScheduleHistoricList();
    };

    $scope.filterSearch = function(search) {
        var filter = $filter('filter');
        var list = filter($scope.tokenVisionListCopy, { "artifactName": search} );
        $scope.pagination(list);
        $scope.tokenVisionList = list;
        $scope.tokenVisionListOrder = list;
    };

    $scope.submitFormFilter = function() {
        var filter = "";

        if (!angular.isUndefined($scope.formFilter.artifactType) && $scope.formFilter.artifactType.length > 0) {
            if (filter.length > 0) {
                filter += '&artifactType=' + $scope.formFilter.artifactType;
            } else {
                filter += '?artifactType=' + $scope.formFilter.artifactType;
            };
        };

        if (!angular.isUndefined($scope.formFilter.detaliedStatus) && $scope.formFilter.detaliedStatus.length > 0) {
            if (filter.length > 0) {
                filter += '&status=' + $scope.formFilter.detaliedStatus;
            } else {
                filter += '?status=' + $scope.formFilter.detaliedStatus;
            };
        };

        $http.get('/deploy/token/artifacts/' + filter).success(function(data) {
            $scope.tokenVisionList = data;
            $scope.tokenVisionListCopy = angular.copy($scope.tokenVisionList);
            $scope.tokenVisionListOrder = angular.copy($scope.tokenVisionList);
            $scope.pagination($scope.tokenVisionList);
        }).error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal) {
                    ServiceUtils.openMessageModal($scope, data.message);
                } else {
                    $scope[data.id] = data.message;
                }
            });
        });
    };


    $scope.clearFormsConfirm = function(){

        if(!angular.isUndefined($scope.formFilterSch) && $scope.formFilterSch.$dirty) {
            ServiceUtils.partialModalBoolean($scope, "Atenção", "Todas as mudanças serão perdidas. Deseja continuar?", function() {
                $scope.clearForms();
            });
        }
        else{
            $scope.clearForms();
        }

    };


    $scope.clearForms = function(){

        $scope.formFilter = {};

        $scope.itemsPerPage = 20;
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.tokenVisionList = null;
        $scope.tokenVisionListCopy = null;
        $scope.tokenVisionListOrder = null;

        if(!angular.isUndefined($scope.formFilterSch)){
            $scope.formFilterSch.$setPristine();
        }

    };


    $scope.refreshTokenTypeList();
    $scope.refreshTokenStatusList();
    $scope.refreshScheduleHistoricList();




}