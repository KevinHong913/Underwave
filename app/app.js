/* angularJS implement */
(function(){
  var app = angular.module('vessel-app',['ui.router', 'solr']);

  app.config(function($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('');
    //
    // Now set up the states
    $stateProvider
      .state('solr', {
        url: "",
        templateUrl: "app/views/solr.html",
        controller: 'SolrController'
      })
      .state('solr.search', {
        url: "/search",
        templateUrl: "app/views/search.html"
      })
      .state('solr.result', {
        url: "/result",
        templateUrl: "app/views/results.html"
      })
      .state('about', {
        url: "/about",
        templateUrl: "app/views/about.html",
        controller: 'AboutController'
      })
      // .state('projects', {
      //   url: "/projects",
      //     templateUrl: "index/templates/projects.html",
      //   controller: 'ProjectController'
      // })
      // .state('contact', {
      //   url: "/contact",
      //     templateUrl: "index/templates/contact.html",
      //   controller: 'ContactController'
      // })
    });

  //Controllers 
  app.controller('AppController', function($scope, $rootScope){
    $scope.pageTitle = "Vessel Search Engine";
    $rootScope.inSearch = false;
  });
   
  app.controller('SolrController', function($scope, $state, $location, $rootScope){
    // $rootScope.pageTitle = "Vessel Search Engine";
    $scope.params = $location.search();
    $scope.goHome = function() {
      $rootScope.inSearch = false;
      $state.go('solr.search');
    }
    if($state.current.name === "solr"){
      $state.go('solr.search');
    }
  });

  app.controller('ResumeController', function($scope){
    $scope.educations = educations;
    $scope.courses = courses;
    $scope.skills = skills;
    $scope.experiences = experiences;
  });

  app.controller('ProjectController', function($scope){

  });

  app.directive("resultDocument", function() {
    return {
      restrict: "E",
      scope :{
        doc : "=record", 
      },
      templateUrl:"app/views/resultItem.html",
    }
  });
   
})();