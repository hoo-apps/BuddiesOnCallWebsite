// App Module
var app = angular.module('buddyApp', [
	'ngRoute',
	'buddyControllers',
	'buddyServices',
	'authControllers',
	'authServices',
	'ngCookies'
	]);

// Configure the routes with controllers and views
app.config(['$routeProvider',
	function ($routeProvider) {
		// Routes for website navigation
		$routeProvider
			.when('/login', {
				controller: 'LoginController',
				templateUrl: 'partials/login.html'
			})
			.when('/map', {
				controller: 'MapController',
				templateUrl: 'partials/map.html'
			})
			.when('/buddy-manager', {
				controller: 'BuddyManagerController',
				templateUrl: 'partials/buddy-manager.html'
			})
			.otherwise({
				redirectTo: '/login'
			});
	}
]);

app.run(['$rootScope', '$location', '$cookieStore', '$http',
	function ($rootScope, $location, $cookieStore, $http) {
		// Handle login information
		$rootScope.globals = $cookieStore.get('globals') || {};
		if ($rootScope.globals.currentUser) {
			$http.defaults.headers.common['Auth'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
		}

		// Redirect user to login page if not logged in
		$rootScope.$on('$locationChangeStart', function(event, next, current) {
			if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
				$location.path('/login');
			}
		});
	}
]);