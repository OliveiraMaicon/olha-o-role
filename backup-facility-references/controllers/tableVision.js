
function tableVisionController ($scope, $http, $filter, $location,ServiceUtils){

	var dataGet = {};
	
	
    //Requesting Associations
    $scope.getAssociations = function() {
        $http.get('/associations')
            .success(function(data) {
                $scope.tableVisionAssociationList = data;
                $scope.tableVisionAssociationListCopy = data;
                $scope.tableVisionAssociationListOrder = data;
                $scope.pagination(data);
            });
    }

    $scope.initTab01 = function() {
        $scope.getAssociations();
    }
    
    $scope.initTab01();
    
    $scope.orderBy = function(field, reverse) {
        dataGet.orderByField = field;
        dataGet.reverse = reverse;
        var orderBy = $filter('orderByWithoutDiacritics');
        var list = orderBy($scope.tableVisionAssociationListOrder, field, reverse);
        $scope.pagination(list);
        $scope.tableVisionAssociationList = list;
    }
    
    $scope.orderByNumber = function(field, reverse) {
        dataGet.orderByField = field;
        dataGet.reverse = reverse;
        var orderByNumber = $filter('orderBy');
        var list = orderByNumber($scope.tableVisionAssociationListOrder, field, reverse);
        $scope.pagination(list);
        $scope.tableVisionAssociationList = list;
        
    }
    
    $scope.orderByIconChange = function(field, reverse) {
        if(dataGet.orderByField == field && dataGet.reverse)
        {
        	return true;
        }
        return false;
    }
    
    $scope.pagination = function(list){
    	$scope.itemsPerPage = 20;
        $scope.currentPage = 1;
        $scope.tableVisionAssociationListPaginate = list;
        $scope.totalItems = $scope.tableVisionAssociationListPaginate.length;
        $scope.$watch('currentPage + itemsPerPage', function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
            	end = begin + $scope.itemsPerPage;
            $scope.tableVisionAssociationList = $scope.tableVisionAssociationListPaginate.slice(begin, end);
        });
    }

    
    $scope.filterSearch = function(search) {               
    	 var filter = $filter('filter');
    	 var list = filter($scope.tableVisionAssociationListCopy, search);
    	 $scope.pagination(list);
         $scope.tableVisionAssociationList = list;
         $scope.tableVisionAssociationListOrder = list;
    };
  
    
}