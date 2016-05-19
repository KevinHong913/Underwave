/* angularJS implement */
(function(){
  var app = angular.module('vessel-app',['ui.router']);

  app.config(function($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');
    //
    // Now set up the states
    $stateProvider
      .state('search', {
        url: "/",
        templateUrl: "app/views/search.html",
        controller: 'SearchController'
      })
      // .state('resume', {
      //   url: "/resume",
      //   templateUrl: "index/templates/resume.html",
      //   controller: 'ResumeController'
      // })
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
  app.controller('AppController', function($scope){
    $scope.pageTitle = "Vessel Search Engine";
  });
   
  app.controller('SearchController', function($scope){
    // $root.pageTitle = "Vessel Search Engine";
  });

  app.controller('ResumeController', function($scope){
    $scope.educations = educations;
    $scope.courses = courses;
    $scope.skills = skills;
    $scope.experiences = experiences;
  });

  app.controller('ProjectController', function($scope){

  });
   
})();