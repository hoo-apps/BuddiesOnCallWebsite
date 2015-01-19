'use strict';

// Controllers
var authControllers = angular.module('authControllers', []);

authControllers.controller('LoginController', ['$scope', '$rootScope', '$location', 'AuthService',
	function ($scope, $rootScope, $location, AuthService) {
		// Clear the credentials every time the controller loads
		// This will log the user out whenever the site reloads the LoginController
		AuthService.clearCreds();

		$scope.login = function() {
			$scope.dataLoading = true;
			AuthService.login($scope.username, $scope.password, function(response) {
				if (response.success) {
					AuthService.setCreds($scope.username, $scope.password);
					$location.path('/map');
				} else {
					$scope.error = response.message;
					$scope.dataLoading = false;
				}
			});
		};
	}]);