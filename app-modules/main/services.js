'use strict'

// Services

var buddyServices = angular.module('buddyServices', []);

var API_BASE = 'http://boffo-server.bitnamiapp.com:5000';

buddyServices.service('userService', ['$http',
	function ($http) {

		// GET: 	Get all users
		this.getUsers = function() {
			//return $http.get('sample-data/1-9-15/users.json');
			return $http.get(API_BASE + '/users')
				.then(
					function (response) {
						return response.data.users;
					});
		};

		// POST: 	Add a new user
		this.createUser = function(user) {
			return $http.post(API_BASE + '/users', user)
				.then(
					function (response) {
						// Return id of the newly created user
						return response.data.added;
					});
		}

		// GET: 	Get a user by id
		this.getUserById = function(userid) {
			return $http.get(API_BASE + '/users/' + userid)
				.then(
					function (response) {
						return response.data;
					});
		}

		// GET: 	Get all the locations for a user by id

		// PUT: 	Update a user by id
		this.updateUser = function(userid, data) {
			return $http.put(API_BASE + '/users/' + userid, data)
				.then(
					function (response) {
						return response.data;
					});
		}

		// DELETE: 	Delete a user by id

	}]);

buddyServices.service('buddyService', ['$http',
	function ($http) {

		// GET: 	Get all buddies
		this.getBuddies = function() {
			//return $http.get('sample-data/1-17-15/buddies.json')
			return $http.get(API_BASE + '/buddies')
				.then(
					function (response) {
						return response.data.buddies;
					});
		};

		// POST: 	Make a user into a buddy
		this.createBuddy = function(userid) {
			var postData = {
				userid: userid
			}
			console.log(postData);
			return $http.post(API_BASE + '/buddies', postData)
				.then(
					function (response) {
						// Return id of the newly created buddy
						return response.data.added;
					});
		}

		// GET: 	Get a buddy by id
		this.getBuddyById = function(buddyid) {
			return $http.get(API_BASE + '/buddies/' + buddyid)
				.then(
					function (response) {
						return response.data;
					});
		}

		// PUT: 	Update a buddy by id

		// DELETE: 	Remove the buddy status of a user
		this.deleteBuddy = function(id) {
			$http.delete(API_BASE + '/buddies/' + id);
		}

	}]);

buddyServices.service('adminService', ['$http',
	function ($http) {

		// GET: 	Get all admins
		this.getAdmins = function() {
			return $http.get('sample-data/1-9-15/admin.json');
			/*
			return $http.get('http://boffo-server.bitnamiapp.com:5000/admin')
				.then(
					function (response) {
						return response.data.admins;
					});
			*/
		}

		// POST: 	Make a user into an admin

		// GET: 	Get an admin by id

		// DELETE: 	Remove the admin status of a user

	}]);

buddyServices.service('locationService', ['$http', 
	function ($http) {

		// GET: 	Get all locations
		this.getLocations = function() {
			return $http.get('sample-data/1-9-15/locations.json');
			/*
			return $http.get('http://boffo-server.bitnamiapp.com:5000/locations')
				.then(
					function (response) {
						return response.data.locations;
					});
			*/
		}
	}]);

// Old Code below:
/*
// TODO:
//	A service with websockets might be better at handling real-time updates
buddyServices.service('buddyService', ['$rootScope', '$http',
	function ($rootScope, $http) {

		// Get all users
		this.getBuddies = function() {
			return $http.get('sample-data/users-1-3-15-modified.json')
			//return $http.get('http://boffo-server.bitnamiapp.com:5000/users')
				.then(
					function (response) {
						console.log(response);
						return response.data.items;
					});
		}

		// Get a buddy based on id
		this.getBuddy = function(id) {
			for (var i = 0; i < buddyArr.length; i++) {
				if (buddyArr[i].id === id) {
					return buddyArr[i];
				}
			}
			return null;
		}

		// Add a buddy to the buddy array
		this.addBuddy = function(buddy) {
			buddyArr.push(buddy);
		}
}]);
*/