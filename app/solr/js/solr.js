var solr = angular.module("solr", ['ui.router'])

// .factory('searchMode', [function() {
//   var searchMode = {};
//   var mode = false;
//   searchMode.getMode = function() {
//     return mode;
//   };

//   searchMode.setMode = function(setValue){
//     mode = setValue;
//   };

//   return searchMode;
// }])

.controller('facetGroupController', function($scope){
  $scope.facets = {};
  this.getFacets =  function(){ return $scope.facets;};
  this.isRangeMode = function(facet_key) { 
    var result = $scope.facets[facet_key].range; 
    return result;
  };
  this.registerFacet = function (facet){
    $scope.facets[facet.field] = facet;
  };
  $scope.listFields = function() {
    var fields = [];
    for (var k in $scope.facets){
      fields.push($scope.facets[k].field);
    }
    return fields;
  };
  this.setFacetResult = function( facet_key, facet_results ){
    for (var k in $scope.facets){
      if ($scope.facets[k].field === facet_key){
        if(!!$scope.facets[k].range) {
          $scope.facets[k].results = facet_results.counts;
          $scope.facets[k].gap = facet_results.gap;

        } else {
          $scope.facets[k].results = facet_results;
        }
      }
    }
  };
})

.directive("resultPagination", function() {
  return {
    restrict: "E",
    scope: {
      pagecount: "=",
      currentpage: "="
    },
    transclude: false,
    templateUrl: "./app/solr/view/result_pagination.html",
    require: "^solr",
    link: function(scope, element, attrs, ctrl){
      
      scope.prevPage = function() {
        if(scope.currentpage !== 0) {
          // scope.currentpage = scope.currentpage - 1;
          ctrl.prevPage();
        }
      };

      scope.nextPage = function() {
        if(scope.currentpage != scope.pagecount) {
          // scope.currentpage = scope.currentpage + 1;
          ctrl.nextPage();
        }
      };

      scope.setPage = function(pageNum) {
        ctrl.setPage(pageNum);
      };



    }
  }
})

.directive("solrFacetGroup", function() {
  return {
    restrict: "E",
    scope: {},
    controller: 'facetGroupController',
    transclude: true,
    templateUrl:"./app/solr/view/solr_facet_group.html",
    require:["^solr", "solrFacetGroup"],
    link: function(scope, element, attrs, ctrls){
      var solrCtrl = ctrls[0];
      var facetGroupCtrl = ctrls[1];

      solrCtrl.setFacetGroup(scope);
      scope.$watch(
        function(){ return solrCtrl.facet_results;},
        function (newVal, oldVal){
          if ( newVal !== oldVal ) {
            for (var k in facetGroupCtrl.getFacets()){ // k is just value name
              if(facetGroupCtrl.isRangeMode(k)) {
                facetGroupCtrl.setFacetResult(k, solrCtrl.facet_results.facet_ranges[k]); 
              } else {
                facetGroupCtrl.setFacetResult(k, solrCtrl.facet_results.facet_fields[k]);
              }

            }
          }
        }
      );

    }
  }
})

.directive("solrSelected", function(){
  return {
    restrict: "E",
    scope:{},
    controller: function($scope) {
      $scope.selected = {
        field: "mods_type_of_resource",
        value: "notated music"
      }
    },
    transclude: true,
    templateUrl: "./app/solr/view/solr_selected.html",
    require:"^solr",
    link: function(scope, element, attrs, ctrl){
      scope.selected = function(){
        return ctrl.selected_facets_obj;
      };
    }

  }
})

.directive("solrSearch", function($location, $state, $rootScope) {
  return {
    scope:{
    },
    restrict: "E",
    templateUrl:"./app/solr/view/solr_search.html",
    require: "^solr",
    link: function( scope, element, attrs, ctrl){
      scope.search = function(query, rows){
        // if($state.current.name === 'solr.search') {
        //   $state.go('solr.result')
        // }
        if (!$rootScope.inSearch.mode) {
          // searchMode.setMode(true);
          $rootScope.inSearch.mode = true;
          console.log('searchMode = True');
        }
        rows = rows || '10';
        query = query || '*';
        $location.search('q', query);
        $location.search('rows', rows);
        ctrl.search(query, rows);
      };

      scope.roptions = ["3", "10", "20", "30"];
      scope.rows = "10";
      scope.preload = attrs.preload;
      scope.query = attrs.query;
      if (scope.preload){
        scope.search(scope.query, scope.rows);
      }
    }

  }
})

.directive("solrFacet", function() {
  return {
    restrict: "E",
    scope: {
      display: "@",
      field:   "@",
      results: "&",
      range:   "=",
      gap:     "&",
    },
    require:"^solrFacetGroup",
    templateUrl:"./app/solr/view/solr_facet.html",
    link: function( scope, element, attrs, ctrl){
      ctrl.registerFacet(scope);

      var es5getprops = Object.getOwnPropertyNames;
      scope.isEmpty = function() {
        return !scope.results || (es5getprops(scope.results).length === 0);
        // return (es5getprops(scope.results).length === 0);
      };

      scope.resultsToArray = function() {
        var results = scope.results;
        var res = [];

        for (var key in results) {
          res.push({
            key: key,
            count: results[key]
          });
      
        }
        // return res;
        scope.resultsArray = res;
      }
    }
  }
})

.directive("solrFacetResult", function($location) {
  return {
    restrict: "E",
    scope: {
      field:"@",
      key: "@",
      count: "@",
      remove:"@",
      range: "@",
      gap: "@"
    },
    require: "^solr",
    templateUrl:"./app/solr/view/solr_facet_result.html",
    link: function( scope, element, attrs, ctrl){
      scope.facetString = function(){ 
        if(scope.range == "true") {
          var upperRange = 1 * scope.key + 1 * scope.gap - 1;
          var str = scope.field + ':[' + scope.key + ' TO ' + upperRange + ']';
          return str;
        } else {
          return scope.field + ':"' + scope.key + '"';
        }
        
      };

      scope.isSelected = function(){
        selectedFacets = ctrl.selected_facets;
        facetString = scope.facetString();
        for (i in selectedFacets){
          if (selectedFacets[i] == facetString) return true;
        }
        return false;

      };

      scope.addFacet = function (){ 
        if (!scope.isSelected()){
          selectedFacets = ctrl.selected_facets;
          selectedFacets.push(scope.facetString());
          $location.search('selected_facets', selectedFacets);
          ctrl.search();
        }
      };

      scope.removeFacet = function (){ 
        selectedFacets = ctrl.selected_facets;
        selectedFacets.pop(scope.facetString());
        $location.search('selected_facets', selectedFacets);
        ctrl.search();
      };

      scope.createSelectField = function(fieldName) {

          if(fieldName === "keyValues.vesselSizeLength" ) {
            return "Length";
          } else if (fieldName === "keyValues.vesselSizeWidth" ) {
            return "Width";
          } else if (fieldName === "keyValues.vesselFlag") {
            return "Flag";
          }
      }
    }
  }
})

.directive("solr", function() {
  return {
    scope: {
      solrUrl: '=',
      docs: '=',
      preload: '=',
      numFound: '=',
      currentpage: '=',
      pagecount: '='
    },
    restrict: 'E',
    transclude:true,
    template: '<div ng-transclude></div>',
    // controllerAs: 'solrController',
    controller: function($scope, $http, $location) {
      var that = this;
      that.facet_results = {};
      that.selected_facets = [];
      $scope.currentpage = 0;
      $scope.pagecount = 0;
      that.getQuery = function(){
        return $location.search().q || "*";
      }
      that.getRows = function(){
        return $location.search().rows || "10";
      }

      that.getPageCount = function() {
        return $scope.pagecount;
      }

      that.getCurrentPage = function() {
        return $scope.currentpage;
      }

      that.prevPage = function() {
        $scope.currentpage = $scope.currentpage - 1;
      }

      that.nextPage = function() {
        $scope.currentpage = $scope.currentpage + 1;
      }

      that.setPage = function(pageNum) {
        $scope.currentpage = pageNum;
      }

      that.buildSearchParams = function(){
        params = {
          'q': that.getQuery(),
          'facet': "on",
          'facet.mincount':"1",
          'wt': 'json',
          'json.nl': "map",
          'json.wrf': 'JSON_CALLBACK',
          'rows': that.getRows(),
          'start': $scope.currentpage * that.getRows()
        };

        selectedFacets = this.selected_facets;
        if (selectedFacets){
          params["fq"] = selectedFacets;
        }
        if ($scope.facet_group){
          params["facet.field"] = $scope.facet_group.listFields();
          params["facet.range"] = ["keyValues.vesselSizeLength", "keyValues.vesselSizeWidth"];
          params["facet.range.start"] = "1";
          params["f.keyValues.vesselSizeWidth.facet.range.end"] = "150"
          params["f.keyValues.vesselSizeLength.facet.range.end"] = "1500"
          // params["facet.range.include"] = "edge";
          params["f.keyValues.vesselSizeWidth.facet.range.gap"] = "5";
          params["f.keyValues.vesselSizeLength.facet.range.gap"] = "50";
        }

        console.log(params);
        return params;
      };

      that.search = function(query, rows){
        $http.jsonp(that.solrUrl, {params: that.buildSearchParams(), cache:true})
        .success(function(data) {
          console.log("GET success");
          console.log(data);
          that.facet_results = data.facet_counts;
          $scope.docs = data.response.docs;
          $scope.numFound = data.response.numFound;
          that.selected_facets = that.getSelectedFacets();
          that.selected_facets_obj = that.getSelectedFacetsObjects();
          $scope.pagecount = Math.ceil($scope.numFound / that.getRows() - 1);
        });
      };

      $scope.search = that.search;

      this.setFacetGroup = function(newGroup){
        $scope.facet_group = newGroup;
      };

      this.getSelectedFacetsObjects = function(){
        var retValue = [];
        this.selected_facets.forEach( function(value, key){
          console.log("selected_facets value: " + value);
          console.log("selected_facets key: " + key);
          split_val = value.split(":");
          retValue.push({
            field: split_val[0],
            value: split_val[1].replace(/"/g, "")

          });
        });
        return retValue;
      };

      this.getSelectedFacets = function(){
        selected = $location.search().selected_facets;
        selectedFacets = [];
        if (angular.isArray(selected)) {
          selectedFacets = selected;
        } else {
          if (selected){
            selectedFacets.push(selected);
          }
        }
        return selectedFacets;

      };

      this.selected_facets = this.getSelectedFacets();
      this.selected_facets_obj = this.getSelectedFacetsObjects();

      $scope.$watch(
        function(){ return $location.search();},
        function ( newVal, oldVal){
          if ( newVal !== oldVal ) {
            that.search()
          }
        },
        true
      );

      $scope.$watch(
        function(){ return $scope.currentpage},
        function ( newVal, oldVal){
          if ( newVal !== oldVal ) {
            that.search()
          }
        },
        true
      );
    },
    require:"solr",
    link: function( scope, element, attrs, ctrl){
      ctrl.solrUrl = scope.solrUrl;
    }
  };
});
