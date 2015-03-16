/**
 * Demand Controller
 */

function demandController($scope, $location, $http, $filter, ServiceUtils) {

    // Attributes
    $scope.demandList = [];
    $scope.associationDeleteList = [];
    $scope.showIdentifierCode = false;
    $scope.showRegisterTeam = false;
    $scope.showPoint = true;
    $scope.artifactAddedDemandList = [];

    $scope.changedTab = "register";

    $scope.listArtifacts = [];
    $scope.getArtifactList = function(item) {
          $http({
              method  : 'GET',
              url     : '/artifact/by_name/' + ServiceUtils.removeSymbols(item) + '?artifactType=' + $scope.artifact.artifactType.id,
              headers : { 'Content-Type': 'application/json' }
          })
          .success(function(data) {
              $scope.listArtifacts = data;
          });
    };

    $scope.situationList = [];
    $scope.getSituationtList = function() {
        $http({
          method  : 'GET',
          url     : '/demands/progress_status/',
          headers : { 'Content-Type': 'application/json' }
        })
        .success(function(data) {
            $scope.situationList = data;
        });
    };

    // Change Tab
    $scope.swithTab = function(tab) {
        if ((!angular.isUndefined($scope.registerForm) && $scope.registerForm.$dirty) || (!angular.isUndefined($scope.artifactForm) && $scope.artifactForm.$dirty)) {
                ServiceUtils.partialModalBoolean($scope, "Atenção", "Todos os dados informados serão perdidos. Deseja prosseguir?", function () {
                    if (tab == "search") {
                        if(!angular.isUndefined($scope.searchForm)){
                            $scope.searchForm.$setPristine();
                        }

                        if(!angular.isUndefined($scope.registerForm)){
                            $scope.registerForm.$setPristine();
                        }

                        if(!angular.isUndefined($scope.artifactForm)){
                            $scope.artifactForm.$setPristine();
                        }
                        $scope.changedTab = tab;
                    } else if (tab == "register") {
                        $scope.clearForms();
                        $http({
                            method: 'GET',
                            url: '/workflows/is_there/',
                            headers: {'Content-Type': 'application/json'}
                        }).success(function (data) {
                            if (data) {
                                $scope.changedTab = tab;
                            } else {
                                ServiceUtils.openMessageModal($scope, "Não é possível cadastrar uma demanda sem um workflow!");
                            }
                        });
                    } else if (tab == "artifact") {
                        $scope.clearForms();
                        $scope.changedTab = tab;
                    } else {
                        $scope.clearForms();
                        $scope.changedTab = tab;
                    }
                })
        }else {
            if (tab == "search") {
                $scope.changedTab = tab;
            } else if (tab == "register") {
                $scope.clearForms();
                $http({
                    method: 'GET',
                    url: '/workflows/is_there/',
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data) {
                        $scope.changedTab = tab;
                    } else {
                        ServiceUtils.openMessageModal($scope, "Não é possível cadastrar uma demanda sem um workflow!");
                    }
                });
            } else if (tab == "artifact") {
                $scope.clearForms();
                $scope.changedTab = tab;
            } else {
                $scope.clearForms();
                $scope.changedTab = tab;
            }
        }
        return true;
    }

    // Requesting Artifact Type
    $scope.getArtifactTypeList = function() {
        $http.get('/artifact_type').success(function(data) {
            $scope.artifactTypeList = data;
        });
    }


    // RequestingDemand
    $scope.findDemand = function() {
        $http.get('/demands').success(function(data) {
            $scope.demandList = data

        });
    }

    // RequestingAreas
    $scope.findRequestingAreas = function() {
        $http.get('/requesting_areas').success(function(data) {
            $scope.requestingAreasList = data
        });
    }

    // RequestingDemand Types
    $scope.findDemandTypes = function(callback) {
        $http.get('/demand_types').success(function(data) {
            $scope.demandTypesList = data;
            if(callback){
                callback();
            }
        });
    }

    //  / Requesting Sprints for team
    $scope.abbreviateString = function(stringValue, nChars) {
	    return stringValue.length >= nChars ? stringValue.substring(0, nChars) + " ..." : stringValue
    }

    // request epics, return list in $scope.epicsList
    $scope.requestEpics = function() {
        $http.get('/epics?status=A').success(function(data) {
            $scope.epicsList = data.epics;
        });
    }

    // Active Requesting Team
    $scope.findActivesTeams = function() {
        $scope.activeTeamList = {};
        $http.get('/teams?status=A').success(function(data) {
            $scope.activeTeamList = data;
        });
    }

    // Requesting Team
    $scope.findTeams = function() {
        $http.get('/teams').success(function(data) {
            $scope.teamList = data;
        });
    }

    // Clean Forms
    $scope.clearForms = function() {

        $scope.registerFormTitle = "Cadastro de Demanda";

        $scope.formDisable = false;

        var defaultSearchForm = {
            schDescription : "",
            schArea : "",
            schDemandType : "",
            schTeam : "",
            schSituation : "",
            dtFimDevStr : "",
            dtFimHomStr : "",
            dtIniDevStr : "",
            dtIniHomStr : "",
            dtIniProdStr : "",
            observations : "",
            rdm : ""
        };

        $scope.search = defaultSearchForm;

        var defaultregister = {
            id : "",
            demandType : "",
            identifierCode : "",
            description : "",
            requestingAreaId : "",
            teamId : ""
            //epic : { id: 0 },
        };

        $scope.register = defaultregister;

        $scope.trackingObj = [];

        $scope.schIdentifierCodeErrorMessage = "";
        $scope.schDescriptionErrorMessage = "";
        $scope.demandTypeErrorMessage = "";
        $scope.identifierCodeErrorMessage = "";
        $scope.descriptionErrorMessage = "";
        $scope.requestingAreaIdErrorMessage = "";




        var defaultartifact = {
            artifactType : "",
            artifactName : ""
        };

        $scope.artifactDemandList = [];
        $scope.artifactAddedDemandList = [];

        $scope.artifact = defaultartifact;

        $scope.demandList = [];

        $scope.totalItems = 1;
        $scope.currentPage = 1;

        if(!angular.isUndefined($scope.searchForm)){
            $scope.searchForm.$setPristine();
        }

        if(!angular.isUndefined($scope.registerForm)){
            $scope.registerForm.$setPristine();
        }

        if(!angular.isUndefined($scope.artifactForm)){
            $scope.artifactForm.$setPristine();
        }

    }

    // Table Demand
    $scope.itemsPerPage = 10
    $scope.currentPage = 1;

    $scope.pageCount = function() {
	    return Math.ceil($scope.demandList.length / $scope.itemsPerPage);
    };

    var dataGet = {};

    $scope.submitSearchForm = function() {
        dataGet.identifierCode = angular.isUndefined($scope.search.schIdentifierCode) ? "" : $scope.search.schIdentifierCode;
        dataGet.description = angular.isUndefined($scope.search.schDescription) ? "" : $scope.search.schDescription;

        if (dataGet.description != null && dataGet.description.length > 0) {
            dataGet.description = ServiceUtils.removeSymbols(dataGet.description);
        }

        dataGet.demandTypeIdList = $scope.search.schDemandType;
        dataGet.requestingAreaIdList = $scope.search.schArea;
        dataGet.teamIdList = $scope.search.schTeam;
        dataGet.situationIdList = $scope.search.schSituation;

        dataGet.orderByField = "updateDate";
        $scope.reverse = true;
        dataGet.reverse = $scope.reverse;

        if ($scope.searchForm.$valid) {
            $scope.currentPage = 1;
            findDemands();
        } else {
            ServiceUtils.openMessageModal($scope, "Por favor preencha os campos indicados corretamente!");
        }
    }

    // Order List
    $scope.order = {};

    $scope.order.demandType = false;
    $scope.order.identifierCode = false;
    $scope.order.description = false;
    $scope.order.requestingArea = false;
    $scope.order.updateDate = true;
    $scope.order.team = false;

    $scope.orderBy = function(field, reverse) {
	dataGet.orderByField = field;
	dataGet.reverse = reverse;

	if ($scope.currentPage != 1) {
	    $scope.currentPage = 1;
	    findDemands();
	} else {
	    findDemands();
	}
    }

    $scope.orderByIconChange = function(field, reverse) {
	if (dataGet.orderByField == field && dataGet.reverse) {
	    return true;
	}
	return false;
    }

    $scope.pageChanged = function() {
	    findDemands();
    };

    function findDemands() {
        var orderByField = angular.isUndefined(dataGet.orderByField) ? ""
            : dataGet.orderByField;
        var reverse = angular.isUndefined(dataGet.reverse) ? ""
            : dataGet.reverse;
        var filter = "";

        // Identifier Code
        if (!angular.isUndefined(dataGet.identifierCode)
            && dataGet.identifierCode != '') {
            if (filter.length > 0) {
            filter = '&identifierCode=' + dataGet.identifierCode;
            } else {
            filter = '?identifierCode=' + dataGet.identifierCode;
            }
        }

        // Description
        if (!angular.isUndefined(dataGet.description)
            && dataGet.description != '') {
            if (filter.length > 0) {
            filter = filter + '&description=' + dataGet.description;
            } else {
            filter = filter + '?description=' + dataGet.description;
            }
        }

        // Demand Type
        if (!angular.isUndefined(dataGet.demandTypeIdList)
            && dataGet.demandTypeIdList != '') {
            if (filter.length > 0) {
            filter = filter + '&demandTypeIdList='
                + dataGet.demandTypeIdList;
            } else {
            filter = filter + '?demandTypeIdList='
                + dataGet.demandTypeIdList;
            }
        }

        // Requesting Area
        if (!angular.isUndefined(dataGet.requestingAreaIdList)
            && dataGet.requestingAreaIdList != '') {
            if (filter.length > 0) {
            filter = filter + '&requestingAreaIdList='
                + dataGet.requestingAreaIdList;
            } else {
            filter = filter + '?requestingAreaIdList='
                + dataGet.requestingAreaIdList;
            }
        }

        // Team
        if (!angular.isUndefined(dataGet.teamIdList)
            && dataGet.teamIdList != '') {
            if (filter.length > 0) {
            filter = filter + '&teamIdList=' + dataGet.teamIdList;
            } else {
            filter = filter + '?teamIdList=' + dataGet.teamIdList;
            }
        }

        if (!angular.isUndefined(dataGet.situationIdList) && dataGet.situationIdList != '') {
            if (filter.length > 0) {
            filter = filter + '&progressStatus=' + dataGet.situationIdList;
            } else {
            filter = filter + '?progressStatus=' + dataGet.situationIdList;
            }
        }

        if (filter.length > 0) {
            // Page
            if (filter.length > 0) {
            filter = filter + '&page=' + $scope.currentPage;
            } else {
            filter = filter + '?page=' + $scope.currentPage;
            }

            // Order By Field
            if (!angular.isUndefined(dataGet.orderByField)
                && dataGet.orderByField != '') {
            if (filter.length > 0) {
                filter = filter + '&orderByField=' + dataGet.orderByField;
            } else {
                filter = filter + '?orderByField=' + dataGet.orderByField;
            }
            }

            // Reverse
            if (!angular.isUndefined(dataGet.reverse)) {
            if (filter.length > 0) {
                filter = filter + '&reverse=' + dataGet.reverse;
            } else {
                filter = filter + '?reverse=' + dataGet.reverse;
            }
            }

            $http.get('/demands' + filter).success(function(data) {
                if (data.totalItems != null) {
                    $scope.totalItems = data.totalItems;
                }
                $scope.demandList = data.demandList;
            }).error(function(data) {
                angular.forEach(data, function(data) {
                    if (data.modal) {
                    ServiceUtils.openMessageModal($scope, data.message);
                    } else {
                    $scope[data.id] = data.message;
                    }
                });
            });
        } else {
            ServiceUtils.openMessageModal($scope, "Pelo menos um campo é obrigatório para realizar a pesquisa!");
        }
    }

    $scope.submitregisterForm = function() {

        var dataPost = {};
        dataPost.id = $scope.register.id;
        dataPost.demandTypeId = $scope.register.demandType.id;
        dataPost.identifierCode = $scope.register.identifierCode;
        dataPost.description = $scope.register.description;
        dataPost.requestingAreaId = $scope.register.requestingAreaId;
        dataPost.teamId = $scope.register.teamId;

        dataPost.dtIniDevStr = $scope.register.dtIniDevStr;
        dataPost.dtFimDevStr = $scope.register.dtFimDevStr;
        dataPost.dtIniHomStr = $scope.register.dtIniHomStr;
        dataPost.dtFimHomStr = $scope.register.dtFimHomStr;
        dataPost.dtIniProdStr = $scope.register.dtIniProdStr;
        dataPost.rdm = $scope.register.rdm;
        dataPost.observations = $scope.register.observations;
        if(!angular.isUndefined($scope.register.epic) && $scope.register.epic != null){
            dataPost.epicId = $scope.register.epic.id;
        }



        var update = false;
        if ($scope.register.id != null && $scope.register.id != "") {
            update = true;
            dataPost.version = $scope.register.version;
        }
        if ($scope.registerForm.$valid) {
            $http({
            method : 'PUT',
            url : '/demands',
            data : dataPost,
            headers : {
                'Content-Type' : 'application/json'
            }
            }).success(
                function(data) {
                $scope.clearForms();
                if(update){
                    ServiceUtils.openMessageModal($scope,'Demanda atualizada com sucesso!');
                }else{
                    ServiceUtils.openMessageModal($scope,'Demanda incluída com sucesso!');
                }

                    $scope.changedTab = "search";

            }).error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal) {
                ServiceUtils.openMessageModal($scope, data.message);
                } else {
                $scope[data.id] = data.message;
                }
            });
            });
        } else {
            ServiceUtils.openMessageModal($scope,
                "Por favor preencha os campos indicados corretamente!");
        }
    }

    $scope.trackingDemand = function(demand) {
        $scope.trackingObj = [];
        $http.get('/demands/' + demand).success(function(data) {
            $location.hash("track-" + demand);
            $scope.trackDemandObj = data;
            $scope.analyticTrackngDemand();

        });
    }



    $scope.analyticTrackngDemand = function(){
        $scope.tracking = { type: "Analítica" }
        $http.get('/demands/' + $scope.trackDemandObj.id + "/analytic_tracking").success(function(data) {
            $scope.trackingObj = data;
            $scope.changedTab = "tracking";
        }).error(function(data) {
              if (data.modal) {
                  ServiceUtils.openMessageModal($scope, data.message);
              } else {
                  $scope[data.id] = data.message;
              }
        });
    }

    $scope.sinteticTrackngDemand = function(){
        $scope.tracking = { type: "Sintética" };
        $http.get('/demands/' + $scope.trackDemandObj.id + "/sintetic_tracking").success(function(data) {

            $scope.trackingObj = [{
                name: "TODOS OS ARTEFATOS",
                trackingObjects: data,
                open:true
            }];
            $scope.changedTab = "tracking";
        }).error(function(data) {
              if (data.modal) {
                  ServiceUtils.openMessageModal($scope, data.message);
              } else {
                  $scope[data.id] = data.message;
              }
        });;
    }

    $scope.editDemand = function(demand) {
        $scope.formDisable = false;
        $http.get('/demands/' + demand.id).success(function(data) {
            $location.hash("edit-" + demand.id);
            var objectDemandType = {};

            angular.forEach($scope.demandTypesList, function(item) {
                if (item.id == data.demandTypeId) {
                    objectDemandType = item;
                }
            });

            $scope.register = data;
            $scope.register.demandType = objectDemandType;
            
            
            angular.forEach($scope.epicsList, function(epic) {
                if (epic.id == data.epicId) {
                	$scope.register.epic = epic;
                }
            });

            if (data.identifierCode != null) {
                $scope.register.identifierCode = data.identifierCode.toString();
            } else {
                $scope.register.identifierCode = "";
            }

            if (data.teamId == null) {
                $scope.register.teamId = "";
            }

            $scope.registerFormTitle = "Edição de Demanda";
            $scope.changedTab = "register";

            if(data.progressStatus == "FINALIZED"){
                $scope.formDisable = true;
            }
        }).error(function(data) {
            if (data.modal) {
                ServiceUtils.openMessageModal($scope, data.message);
            } else {
                $scope[data.id] = data.message;
            }
        });
    }

    $scope.addObjDemand = function(item) {

        $http.get('/demands/' + item).success(function(data) {

            $location.hash("artifact-" + item);

            if(angular.isUndefined($scope.artifactAddedDemandList)){
                $scope.artifactAddedDemandList = [];
            }

            $scope.demandTmp = data;

            if ($scope.demandTmp.progressStatus == "RELEASED") {
                ServiceUtils.openMessageModal($scope,"Atenção, essa demanda já se encontra em desenvolvimento, caso adicione 1 artefato o mesmo só terá uma versão após um pré-game.");
            }

            if (data.teamId == null) {
                ServiceUtils.openMessageModal($scope,"Não é permitido cadastrar um artefato para uma demanda que não possui time associado");
            } else {

                $scope.artifactAddedDemandList = data.artifactDemandAssociation;

                var loadArtifactForm = {
                    idDemand : data.id,
                    demandDescription : data.description
                };

                $scope.artifact = loadArtifactForm;

                $scope.changedTab = "artifact";

                document.getElementById("artifactType").focus();

            }
        }).error(function(data) {
            if (data.modal) {
                ServiceUtils.openMessageModal($scope, data.message);
            } else {
                $scope[data.id] = data.message;
            }
        });
    }

    $scope.changeAnalysisStatus = function() {

        var dataPost = {
            id : $scope.demandTmp.id,
            progressStatus : "ANALYSIS"
        }

        $http({
        method  : 'PUT',
        url     : '/demands/change_status',
        data    : dataPost,
        headers : { 'Content-Type': 'application/json' }
        }).success(function(data) {
            $scope.demandTmp.progressStatus = "ANALYSIS";
            if(data != null && data.length > 0){
                ServiceUtils.openMessageModal($scope,data.message);
            }else{
                ServiceUtils.openMessageModal($scope,"A demanda foi liberada para pré-game com sucesso!");
            }
        }).error(function(data) {
        angular.forEach(data, function(data) {
            ServiceUtils.openMessageModal($scope,data.message);
        });

        });
    }

    $scope.submitAddArtifactDemandForm = function() {
        $scope.artifactDemandList = [];
        var dataPost = {};
        dataPost.artifactType = $scope.artifact.artifactType;
        dataPost.artifactName = encodeURIComponent($scope.artifact.artifactName.toUpperCase());

        //if(dataPost.artifactType.genConcurrence == "S"){}

        $http({
            method : 'GET',
            url : '/demands/' + $scope.artifact.idDemand
                + '/artifact_associations?' + 'artifactName='
                + dataPost.artifactName + '&artifactTypeId='
                + dataPost.artifactType.id,
            data : dataPost,
            headers : {
                'Content-Type' : 'application/json'
            }
        }).success(function(data) {
            if (data.associationsByArtifact.length > 0) {
                var orderBy = $filter('orderBy');
                $scope.artifactDemandList = orderBy(data.associationsByArtifact, 'artifactVersion', true);
            } else {

                var artifactDemand = {};
                var artifact = {};
                var artifactType = {};
                var demand = {};
                var demandType = {};
                var sprint = {};

                artifactDemand.artifact = artifact;
                artifactDemand.artifact.artifactType = artifactType;
                artifactDemand.artifact.name = $scope.artifact.artifactName.toUpperCase();
                artifactDemand.artifact.artifactType.id = $scope.artifact.artifactType.id;

                angular.forEach($scope.artifactTypeList, function(item) {
                    if (item.id == $scope.artifact.artifactType.id) {
                        artifactDemand.artifact.artifactType.name = item.name;
                    }
                });


                if(dataPost.artifactType.genConcurrence == "N"){
                    artifactDemand.artifactVersion = null;
                }
                else if($scope.demandTmp.progressStatus == "FROZEN"){
                    artifactDemand.artifactVersion = -1;
                }else{
                    artifactDemand.artifactVersion = 1;
                }

                artifactDemand.artifact.insertable = true;

                var exist = false;

                angular.forEach($scope.artifactAddedDemandList, function(item) {
                    if (item.artifact.artifactType.name == artifactDemand.artifact.artifactType.name && item.artifact.name == artifactDemand.artifact.name) {
                        exist = true;
                    }
                });

                if (exist) {
                    ServiceUtils.openMessageModal($scope, "Esse artefato já foi adicionado à essa demanda.");
                } else {
                    if(angular.isUndefined($scope.artifactAddedDemandList)){
                                $scope.artifactAddedDemandList = [];
                    }
                    $scope.artifactAddedDemandList.push(artifactDemand);
                }
            }

            $scope.artifact.artifactType = '';
            $scope.artifact.artifactName = '';
            $scope.artifactForm.artifactName.$dirty = false;
            $scope.artifactForm.artifactType.$dirty = false;




        }).error(function(data) {
            angular.forEach(data, function(data) {
                if (data.modal) {
                    ServiceUtils.openMessageModal($scope,
                        data.message);
                } else {
                    $scope[data.id] = data.message;
                }
            });
        });
    }

    $scope.add = function(item, index) {
        if(angular.isUndefined($scope.artifactAddedDemandList)){
            $scope.artifactAddedDemandList = [];
        }

        $scope.artifactDemandList.splice(index, $scope.artifactDemandList.length);

        // loop para nao incluir duas vezes o mesmo item
        if ($scope.artifactAddedDemandList.length > 0) {
            if (arrayObjectIndexOf($scope.artifactAddedDemandList, item) == -1) {
                item.artifact.insertable = true;
                if(item.artifact.artifactType.genConcurrence == "N"){
                    item.artifactVersion = null;
                }else if($scope.demandTmp.progressStatus == "RELEASED"|| $scope.demandTmp.progressStatus == "FROZEN"){
                    item.artifactVersion = -1;
                }else{
                    item.artifactVersion = item.artifactVersion + 1;
                }
                $scope.artifactAddedDemandList.push(item);
            } else {
                ServiceUtils.openMessageModal($scope, "Esse artefato já foi adicionado à essa demanda.");
            }
        } else {
            item.artifact.insertable = true;
            if(item.artifact.artifactType.genConcurrence == "N"){
                item.artifactVersion = null;
            } else if($scope.demandTmp.progressStatus == "RELEASED" || $scope.demandTmp.progressStatus == "FROZEN"){
                item.artifactVersion = -1;
            }else{
                item.artifactVersion = item.artifactVersion + 1;
            }
            $scope.artifactAddedDemandList.push(item);
        }

        // loop para verificar se item inserido na lista de exclusao
        if ($scope.associationDeleteList.length > 0) {
            var associationDelete = {};
            var artifact = {};

            associationDelete.artifact = artifact;

            associationDelete.artifactVersion = item.artifactVersion;
            associationDelete.artifact.id = item.artifact.id;

            angular.forEach($scope.associationDeleteList, function(dataDel) {
            if (arrayObjectIndexOfRemoveList($scope.associationDeleteList,
                associationDelete) != -1) {
                $scope.associationDeleteList.splice(associationDelete);
            }
            });
        }
    }

    $scope.remove = function(item, index) {
        // add artifacts to deleteAssociationList
        var associationDelete = {};
        var artifact = {};

        associationDelete.artifact = artifact;

        associationDelete.artifactVersion = item.artifactVersion;
        associationDelete.id = item.id;
        associationDelete.version = item.version;
        associationDelete.unexpectedArtifact = item.unexpectedArtifact;
        associationDelete.unexpectedArtifactDescription = item.unexpectedArtifactDescription;
        associationDelete.artifact.id = item.artifact.id;
        associationDelete.artifact.name = item.artifact.name;
        associationDelete.artifact.artifactType = item.artifact.artifactType;

        if (associationDelete.artifact.id != null && (angular.isUndefined(item.artifact.insertable) || item.artifact.insertable == null || item.artifact.insertable == false)) {
            $http({
                method : 'GET',
                url : '/artifact/' + associationDelete.artifact.id
                    + '/' + associationDelete.artifactVersion
                    + '/is_there_association',
                headers : {
                    'Content-Type' : 'application/json'
                }
                }).success(function(data) {
                	if(data === 'true'){
                		ServiceUtils.partialModalBoolean($scope, "Atenção", "Existem artefatos com versão superior associados a outra demanda. Isso implicará na reordenação das versões. Deseja realmente excluir?", function() {
                			$scope.associationDeleteList.push(associationDelete);
                			$scope.artifactAddedDemandList.splice(index, 1);
                        });
                	}else{
                		$scope.associationDeleteList.push(associationDelete);
            			$scope.artifactAddedDemandList.splice(index, 1);
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
        } else {
            $scope.artifactAddedDemandList.splice(index, 1);
        }
    }

    function arrayObjectIndexOf(arr, obj) {
        if (angular.isArray(arr)) {
            for (var i = 0; i < arr.length; i++) {
            if ((arr[i].artifact.artifactType.id == obj.artifact.artifactType.id)
                && (arr[i].artifact.name == obj.artifact.name)) {
                return i;
            }
            }
            ;
        } else {
            if ((arr.artifact.artifactType.id == obj.artifact.artifactType.id)
                && (arr.artifact.name == obj.artifact.name)) {
            return i;
            }
        }
        return -1;
    }

    function arrayObjectIndexOfRemoveList(arr, obj) {
        if (angular.isArray(arr)) {
            for (var i = 0; i < arr.length; i++) {
            if ((arr[i].artifact.id == obj.artifact.id)
                && (arr[i].artifactVersion == obj.artifactVersion)) {
                return i;
            }
            }
            ;
        } else {
            if ((arr.artifact.id == obj.artifact.id)
                && (arr.artifactVersion == obj.artifactVersion)) {
            return i;
            }
        }

        return -1;
    }

    $scope.submitDemandArtifact = function() {

        if ($scope.demandTmp.progressStatus == "RELEASED") {
            ServiceUtils.partialModalText($scope,"Por favor, informe o motivo pelo qual novo(s) artefato(s) surgiram após o pré-game",function(mensageObs){
                var dataPost = {};
                var artifactCreateList = [];
                var associationDeleteList = [];

                dataPost.artifactCreateList = artifactCreateList;
                dataPost.associationDeleteList = $scope.associationDeleteList;

                angular.forEach($scope.artifactAddedDemandList, function(data) {
                    var row = {};
                    row.name = data.artifact.name;
                    row.artifactVersion = data.artifactVersion;

                    var artifactType = {};
                    artifactType.id = data.artifact.artifactType.id;

                    row.artifactType = artifactType;

                    if (data.artifact.insertable) {
                        row.insertable = true;
                    }

                    row.unexpectedArtifactDescription = mensageObs;

                    dataPost.artifactCreateList.push(row);
                });


                $http({
                    method : 'PUT',
                    url : '/demands/' + $scope.artifact.idDemand + '/artifact',
                    data : dataPost,
                    headers : {
                    'Content-Type' : 'application/json'
                    }
                }).success(
                    function(data) {
                        $scope.associationDeleteList = [];
                        $scope.artifactAddedDemandList = [];
                        ServiceUtils.openMessageModal($scope,'Artefato(s) atualizado com sucesso!');
                        $scope.changedTab = "search";
                    }).error(function(data) {
                    angular.forEach(data, function(data) {
                    if (data.modal) {
                        ServiceUtils.openMessageModal($scope, data.message);
                    } else {
                        $scope[data.id] = data.message;
                    }
                    });
                });
            });
        }
        else{

            var dataPost = {};
            var artifactCreateList = [];
            var associationDeleteList = [];

            dataPost.artifactCreateList = artifactCreateList;
            dataPost.associationDeleteList = $scope.associationDeleteList;

            angular.forEach($scope.artifactAddedDemandList, function(data) {
                var row = {};
                row.name = data.artifact.name;
                row.artifactVersion = data.artifactVersion;

                var artifactType = {};
                artifactType.id = data.artifact.artifactType.id;

                row.artifactType = artifactType;

                if (data.artifact.insertable) {
                    row.insertable = true;
                }

                dataPost.artifactCreateList.push(row);
            });

            $http({
                method : 'PUT',
                url : '/demands/' + $scope.artifact.idDemand + '/artifact',
                data : dataPost,
                headers : {
                'Content-Type' : 'application/json'
                }
            }).success(function(data) {
                $scope.associationDeleteList = [];
                $scope.artifactAddedDemandList = [];
                ServiceUtils.openMessageModal($scope,'Artefato(s) atualizado com sucesso!');
                $scope.changedTab = "search";
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
    }

    $scope.demandDetails = function(demand) {
        ServiceUtils.modalDemand($scope, demand, false, true, true, false, false, void(0));
    }

    // ModalMessages

    $scope.findRequestingAreas();
    $scope.findDemandTypes();
    $scope.findActivesTeams();
    $scope.getArtifactTypeList();
    $scope.requestEpics();
    $scope.findTeams();
    $scope.getSituationtList();
    $scope.clearForms();

    if($location.hash().indexOf("edit-") > -1){

        var idDemandParse = parseInt($location.hash().split("-")[$location.hash().split("-").length-1]);
        $scope.findDemandTypes(function(){
            $scope.editDemand({ id: idDemandParse});
        });
    }else if($location.hash().indexOf("track-") > -1){

        var idDemandParse = parseInt($location.hash().split("-")[$location.hash().split("-").length-1]);
            $scope.trackingDemand(idDemandParse);
    }else if($location.hash().indexOf("artifact-") > -1){

        var idDemandParse = parseInt($location.hash().split("-")[$location.hash().split("-").length-1]);
            $scope.addObjDemand(idDemandParse);
    }else if($location.hash().indexOf("register") > -1){
        $scope.swithTab("register");
    } else{
        $scope.swithTab("search");
    }
}

