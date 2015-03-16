
//Utils Functions

var normalize = function(string) {
    if(string != null && string.length > 0){
        string = string.toLowerCase();
        var from = "àáäâãèéëêěìíïîòóöôõùúüûñçčřšýžďť'";
        var to = "aaaaaeeeeeiiiiooooouuuunccrsyzdt";
        for (var i = 0; i < from.length; i++)
            string = string.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
	}

	return string;
}

var cutString = function (value, wordwise, max, tail) {
  if (!value) return '';

  max = parseInt(max, 10);
  if (!max) return value;
  if (value.length <= max) return value;

  value = value.substr(0, max);
  if (wordwise) {
      var lastspace = value.lastIndexOf(' ');
      if (lastspace != -1) {
          value = value.substr(0, lastspace);
      }
  }

  return value + (tail || ' …');
};



//APP INSTANCE AND CONFIG

var app = angular.module('facility', ['ui.bootstrap']);

app.config([ '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.cache = false;
    
    //Interceptor error
    $httpProvider.interceptors.push('Interceptor');
    $httpProvider.interceptors.push('httpInterceptor');

    if (!$httpProvider.defaults.headers.get) {
	    $httpProvider.defaults.headers.get = {};
    }

    // Disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
} ]);

// Modal controller
app.controller('ModalController', function($scope, $modal) {
    $scope.open = function(controller, modalMessage, modalArgs) {
	$scope.modalMessage = modalMessage;
	$scope.modalArgs = modalArgs;

	var modalInstance = $modal.open({
	    templateUrl : '/public/modal.html', // modal w/ ok and cancel
	    controller : controller,
	    scope : $scope
	});
    };
});

// Modal custom action controller
app.controller('ModalCustomActionController', function($scope, $modalInstance) {
    $scope.customOk = function() {
	$scope.ok($scope.modalAction, $modalInstance);
    };
});

app.controller('ModalConfirmActionController', function($scope, $modalInstance) {
    $scope.confirm = function() {
		$scope.confirmOk($scope.modalAction, $modalInstance);
    };

     $scope.cancel = function() {
     	$modalInstance.close();
    };
});


// Modal action controller
app.controller('ModalActionController', function($scope, $modalInstance) {
    $scope.ok = function() {
	$modalInstance.close();
    };
});





app.service('GlobalError', function GlobalError($window, $modal) {
    this.show  = function(callback) {
        return modalInstance = $modal.open({
            templateUrl : '/public/messageModal.html', // modal w/ ok only
            controller : function($scope, $modalInstance){
                $scope.modalMessages = ["Um erro interno ocorreu. Contate o administrador!"];

                $scope.callOkButton = function(){
                    callback();
                    $modalInstance.close();
                };
            }
        }).result;
    };
});

//Interceptor Error
app.factory('Interceptor', ['$q', '$location', '$injector', function($q, $location, $injector) {
    var modalActive = false;

	return {
		request: function(config) {
			//console.log(config);
			return config;
		},
		requestError: function(rejection) {
			return $q.reject(rejection);
		},
		response: function(response) {
			return response;
		},
		responseError: function(rejection) {
			var GlobalError = $injector.get('GlobalError');
			
			switch (rejection.status) {
		        case 401:
		        	$location.path('/login');
		        case 404:
		        case 500:
		        	if((rejection.data == '' || rejection.data[0].message == null) && !modalActive){
                        modalActive = true;
		        		GlobalError.show(function(){
                            modalActive = false;
                        });
		        		//console.log('[ERROR] Interceptor Rejection : '+rejection.status +' : '+rejection.statusText);
		        		//console.log(rejection);
 		        	}
	        	break;
			}
			return $q.reject(rejection);
		}
	}
}]);


app.factory('httpInterceptor', function ($q, $rootScope, $log) {
   var numLoadings = 0;

   return {
       request: function (config) {
           numLoadings++;
           $rootScope.$broadcast("loader_show");
           return config || $q.when(config)
       },
       response: function (response) {
           if ((--numLoadings) === 0) {
               $rootScope.$broadcast("loader_hide");
           }
           return response || $q.when(response);

       },
       responseError: function (response) {

           if (!(--numLoadings)) {
               // Hide loader
               $rootScope.$broadcast("loader_hide");
           }

           return $q.reject(response);
       }
   };
});


app.directive("loader", function ($rootScope) {
       return function ($scope, element, attrs) {
           $scope.$on("loader_show", function () {
               return element.show();
           });
           return $scope.$on("loader_hide", function () {
               return element.hide();
           });
       };
});