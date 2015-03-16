
app.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
	iElement.autocomplete({
	    source : function(req, resp) {
            var listItems = scope[iAttrs.autoComplete];
            var listItemsNew = [];
            angular.forEach(listItems, function(item) {
                if (normalize(item[iAttrs.autoCompleteElement]).indexOf(normalize(req.term)) != -1) {
                    listItemsNew.push({
                        label : cutString(item[iAttrs.autoCompleteElement],true,50," ..."),
                        id : item.id
                    });
                }
            });
            return resp(listItemsNew.slice(0, 5));
	    },
	    select : function(event, ui) {

	        if (angular.isUndefined(iAttrs.autoCompleteCallback)) {
                scope.$apply(function() {
                    iElement.val("");

                    if(iAttrs.ngModel.indexOf(".") >= 0){
                        scope[iAttrs.ngModel.split(".")[0]][iAttrs.ngModel.split(".")[1]] = "";
                        scope[iAttrs.ngModel.split(".")[0]][iAttrs.ngModel.split(".")[1]] = ui.item["value"];
                        iElement.val(scope[iAttrs.ngModel.split(".")[0]][iAttrs.ngModel.split(".")[1]]);
                    }
                    else{
                        scope[iAttrs.ngModel] = "";
                        scope[iAttrs.ngModel] = ui.item["value"];
                        iElement.val(scope[iAttrs.ngModel]);
                    }
                });
            }
            else{

                var listItems = scope[iAttrs.autoComplete];
                var listItemsNew = [];
                var varTerm = ui.item.id;

                if (!angular.isUndefined(scope[iAttrs.autoCompleteCallback])) {
                    listItemsNew = scope[iAttrs.autoCompleteCallback];
                }

                var haveItem = false;

                angular.forEach(listItemsNew, function(item) {
                    if (item.id == varTerm) {
                    haveItem = true;
                    }
                });

                if (!haveItem) {

                    angular.forEach(listItems, function(item) {
                    if (item.id == varTerm) {
                        listItemsNew.push(item);
                    }
                    });
                }

                scope.$apply(function() {
                    scope[iAttrs.autoCompleteCallback] = listItemsNew;
                    iElement.val("");
                });


            }

            event.preventDefault();
	    }
	});
    };
});

app.directive('datePicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        scope : {
            ngModel : '&'
        },
        link : function (scope, element, attrs, modelCtrl) {

            $(function(){
                element.datepicker({
                    dateFormat : 'dd/mm/yy',
                    onSelect:function (date) {
                        scope.$apply(function () {
                            modelCtrl.$setViewValue(date);
                        });
                    },
                    onClose: function(dateText, inst) {

                    }
                });
            });


        }
    }
});

app.directive('ngDraggable', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict:'A',
		scope : {
			ngDraggable : '&'
		},
		link : function(scope, element, attrs) {
			element.draggable({
				zIndex: 100,
				start: function( event, ui ) {


					var itemId = this.id;
					scope.$apply(function(scope) {
						var fn = scope.ngDraggable();
						if ('undefined' !== typeof fn) {
							fn(itemId);
						}
					});

				},
		        revert:function(){
		        	$(".wm-droppable").css('opacity','1');
			    	$(".wm-droppable").droppable("disable");
		        	return true;
		        },
		        revertDuration :400

		      });



		}
	}
});

app.directive('ngDroppable', function() {
	return {
		restrict:'A',
		scope : {
			ngDroppable : '&'
		},
		link : function(scope, element, attrs) {
			element.droppable({
				hoverClass: attrs.ngDropHoverClass,
				drop: function( event, ui ) {
					var itemId = this.id;
					var draggableId = ui.draggable.attr('id');

					ui.draggable.css({ // set absolute position of dropped object
		                top: ui.position.top, left: ui.position.left
		            }).appendTo(this); //append to container


					//$(ui.draggable).hide();

					scope.$apply(function(scope) {
						var fn = scope.ngDroppable();
						if ('undefined' !== typeof fn) {
							fn(draggableId, itemId);
						}
					});
			    }
		    });

		}
	}
});

app.directive('ngSortable', function() {
	return {
		restrict:'A',
		scope : {
			ngSortable : '&'
		},
		link : function(scope, element, attrs) {
			element.sortable({
				items: ".sortableItem:not(.sortableDisable)",
				placeholder: "ui-state-highlight",
				axis: "x",
				distance: 2,
				update: function( event, ui ) {
					ui.item.removeClass("ui-state-highlight");
					scope.$apply(function(scope) {
						var fn = scope.ngSortable();
						if ('undefined' !== typeof fn) {
							fn(ui.item.index());
						}
					});
				}

				});
			}
		}
});

app.directive('ngSelectable', function() {
	return {
		restrict:'A',
		scope : {
			ngSelectable : '&'
		},
		link : function(scope, element, attrs) {

			element.click(function(){
				var itemId = this.id;
				scope.$apply(function(scope) {
					var fn = scope.ngSelectable();
					if ('undefined' !== typeof fn) {
						fn(itemId);
					}
				});

			})



		}
	}
});

app.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
	  function contains(arr, item) {
	    if (angular.isArray(arr)) {
	      for (var i = 0; i < arr.length; i++) {
	        if (angular.equals(arr[i], item)) {
	          return true;
	        }
	      }
	    }
	    return false;
	  }

	  function add(arr, item) {
	    arr = angular.isArray(arr) ? arr : [];
	    for (var i = 0; i < arr.length; i++) {
	      if (angular.equals(arr[i], item)) {
	        return arr;
	      }
	    }
	    arr.push(item);
	    return arr;
	  }

	  function remove(arr, item) {
	    if (angular.isArray(arr)) {
	      for (var i = 0; i < arr.length; i++) {
	        if (angular.equals(arr[i], item)) {
	          arr.splice(i, 1);
	          break;
	        }
	      }
	    }
	    return arr;
	  }

	  function postLinkFn(scope, elem, attrs) {
	    $compile(elem)(scope);
	    var getter = $parse(attrs.checklistModel);
	    var setter = getter.assign;
	    var value = $parse(attrs.checklistValue)(scope.$parent);
	    scope.$watch('checked', function(newValue, oldValue) {
	      if (newValue === oldValue) {
	        return;
	      }
	      var current = getter(scope.$parent);
	      if (newValue === true) {
	        setter(scope.$parent, add(current, value));
	      } else {
	        setter(scope.$parent, remove(current, value));
	      }
	    });

	    scope.$parent.$watch(attrs.checklistModel, function(newArr, oldArr) {
	      scope.checked = contains(newArr, value);
	    }, true);
	  }

	  return {
	    restrict: 'A',
	    priority: 1000,
	    terminal: true,
	    scope: true,
	    compile: function(tElement, tAttrs) {
	      if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
	        throw 'checklist-model should be applied to `input[type="checkbox"]`.';
	      }

	      if (!tAttrs.checklistValue) {
	        throw 'You should provide `checklist-value`.';
	      }

	      tElement.removeAttr('checklist-model');

	      tElement.attr('ng-model', 'checked');

	      return postLinkFn;
	    }
	  };
}]);

app.directive('modal', function() {
	return {
            restrict: 'EA',
            scope: {
                title: '@modalTitle',
                body: '@modalBody',
                callbackbutton: '&ngClickOk',
                handler: '=modalName'
            },
            templateUrl: '/public/partialModal.html',
            transclude: true,
            controller: function ($scope) {
                $scope.handler = 'pop';
            },
    };
});