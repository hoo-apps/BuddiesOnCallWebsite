'use strict';

// Controllers
var buddyControllers = angular.module('buddyControllers', []);

buddyControllers.controller('NavController', ['$rootScope', '$scope', '$location',
	function ($rootScope, $scope, $location) {
		$scope.navClass = function (page) {
			var currentRoute = $location.path().substring(1) || 'map';
			return page === currentRoute ? 'list-active' : '';
		}
	}
]);

buddyControllers.controller('BuddyManagerController', ['$scope', 'buddyService', 'userService',
	function ($scope, buddyService, userService) {

		function init() {
			loadLists();
			$scope.showBuddyTab();
		}

		$scope.showBuddyTab = function() {
			$scope.isBuddyTabShowing = true;
			$scope.isUserTabShowing = false;
		}

		$scope.showUserTab = function() {
			$scope.isBuddyTabShowing = false;
			$scope.isUserTabShowing = true;	
		}

		$scope.tabClass = function(tab) {
			if (tab === 'buddy') {
				return $scope.isBuddyTabShowing ? 'tab-active' : 'tab-inactive';
			} else if (tab === 'user') {
				return $scope.isUserTabShowing ? 'tab-active' : 'tab-inactive';
			}
		}

		function indexOfUserInUserList(user) {
			for (var i = 0; i < $scope.userList.length; i++) {
				if ($scope.userList.id === user.id) {
					return i;
				}
			}
			return -1;
		}

		function getUserFromUserList(userId) {
			var resultArr = $scope.userList.filter(function(user) {
				return (user.id === userId);
			});
			return resultArr[0];
		}

		$scope.reset = function() {
			$scope.currentBuddy = undefined;
			$scope.cleanCurrentBuddy = undefined;
		}

		$scope.editBuddy = function(buddy) {
			$scope.currentBuddy = buddy;
			$scope.cleanCurrentBuddy = buddy;
		}

		function loadLists() {
			buddyService.getBuddies()
				.then(function(buddyData) {
					console.log(buddyData);
					$scope.buddyList = buddyData;
				});

			userService.getUsers()
				.then(function(userData) {
					console.log(userData);
					$scope.userList = userData;
					$scope.userEmailQuery = "";
				});
		}

		$scope.saveCurrentBuddy = function() {
			// Editing a prexisting buddy
			// PUT - update User
			// POST - add User as Buddy (if necessary)
			if ($scope.cleanCurrentBuddy) {
				console.log("Updating user");
				var userId;
				// Current user is already a buddy
				if ($scope.currentBuddy.userid) {
					console.log("Already a buddy");
					userId = $scope.currentBuddy.userid;
				}
				// Current user is not a buddy
				else {
					console.log("Creating a new buddy");
					userId = $scope.currentBuddy.id;
					buddyService.createBuddy(userId)
						.then(function(buddyid) {
							loadLists();
						});
				}

				var data = {
					email: $scope.currentBuddy.email,
					name: $scope.currentBuddy.name
				}
				// Update the information for the user
				userService.updateUser(userId, data)
					.then(function(user) {
						loadLists();
					});
			}
			// Adding a new buddy
			// POST - create new User, Buddy
			else {
				console.log("Creating new user");
				console.log($scope.currentBuddy);
				// POST user data
				userService.createUser($scope.currentBuddy)
					.then(function(userid) {
						// POST resulting id to make buddy
						console.log("userid: " + userid);
						return buddyService.createBuddy(userid);
					})
					.then(function(buddyid) {
						console.log("buddyid: " + buddyid);
						return buddyService.getBuddyById(buddyid);
					})
					.then(function(buddy) {
						// Add the new buddy to the buddyList
						$scope.buddyList.push(buddy);
						return userService.getUserById(buddy.userid);
					})
					.then(function(user) {
						// Add the user to the userList
						$scope.userList.push(user);
					});
			}

			$scope.currentBuddy = undefined;
			$scope.cleanCurrentBuddy = undefined;
		}

		$scope.deleteBuddy = function(buddy) {
			buddyService.deleteBuddy(buddy.id);
		}

		init();
	}
]);

// TODO: INFO WINDOWS
// http://stackoverflow.com/questions/14226975/angularjs-ng-include-inside-of-google-maps-infowindow

// TODO: PROMISES WITH SERVICES
// http://chariotsolutions.com/blog/post/angularjs-corner-using-promises-q-handle-asynchronous-calls/
buddyControllers.controller('MapController', ['$scope', '$compile', 'buddyService',
	function ($scope, $compile, buddyService) {

		// Controller-wide vars
		var statusEnum = {
			EN_ROUTE: "en-route",
			AVAILABLE: "available",
			WAITING: "waiting"
		}
		var map;

		var infoWindow = new google.maps.InfoWindow({
			maxWidth: 250
		});		
		// Precompile the HTML for the infoWindow
		// This step preserves the 2-way binding even when the infoWindow is drawn
		// NOTE: Must call $scope.$apply() to update the infoWindow
		var infoWindowContent = "<div id=\"infowindow-content\"><div class=\"full-width\">" +
			"<div ng-class=\"imgBorderClass(curBuddy.id)\" class=\"img-frame-lg center-h\"><img class=\"profile-img-lg center-v\" " +
			"ng-src=\"content/images/{{ curBuddy.profileImg }}\"></img></div></div><h3>{{ curBuddy.name }}</h3>" + 
			"<p><b>Status:</b> {{ curBuddy.oncall }}<br /><b>ETA:</b> {{ count }} min</p>";
		var compiled;

		var markerArr = [];

		// TODO
		$scope.count = 0;

		// Use init function for code organization
		init();
		//initMap();
		//addMarkers();

		function getBuddyById(buddyId) {
			var resultArr = $scope.buddies.filter(function(bud) {
				return (bud.id === buddyId);
			});
			return resultArr[0];
		}

		function init() {
			buddyService.getBuddies()
				.then(function(buddyData) {
					console.log("-----");
					console.log(buddyData);
					$scope.buddies = buddyData;
					if ($scope.buddies) {
						$scope.curBuddy = $scope.buddies[0];
					}

					// Continue with the initialization
					initMap();
					addMarkers();

					// Compile the infoWindow
					compiled = $compile(infoWindowContent)($scope);
				});
			/*
			$scope.buddies = buddyService.getBuddies();
			if ($scope.buddies) {
				$scope.curBuddy = $scope.buddies[0];
			}
			*/
		}

		function initMap() {
			// Style for map initialization
			// Disable points of interest (clickable markers)
			var noPoi = [
			{
			    featureType: "poi",
			    elementType: "labels",
			    stylers: [
			      { visibility: "off" }
			    ]   
			  }
			];

			// Options for map initialization
			var mapOptions = {
				center: { lat: 38.0356976, lng: -78.5035935 },
				zoom: 16,
				mapTypeControl: false,
				panControl: false,
				scaleControl: false,
				zoomControl: true,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle.SMALL,
					position: google.maps.ControlPosition.TOP_RIGHT
				},
				streetViewControl: true,
				streetViewControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
				},
				styles: noPoi
			};

			// Link the map to the #map-canvas div
			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		}

		function addMarkers() {
			for (var i = 0; i < $scope.buddies.length; i++) {
				var bud = $scope.buddies[i];

				// Get the icon image based on the user's status
				var imageUrl;
				switch(bud.oncall) {
					case statusEnum.WAITING: imageUrl = 'content/images/marker-icon-user.png';
						break;
					case statusEnum.EN_ROUTE: imageUrl = 'content/images/marker-icon-buddy-enroute.png';
						break;
					case statusEnum.AVAILABLE: imageUrl = 'content/images/marker-icon-buddy-available.png';
						break;
				}

				// Create the icon for the marker
				var icon = {
					url: imageUrl,
					size: new google.maps.Size(38, 38),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(19, 19)
				};

				// Add the marker to the map
				var marker = new google.maps.Marker({
					map: map,
					position: bud.location,
					icon: icon,
					optimized: false
				});


				marker.buddyId = bud.id;

				markerArr.push(marker);

				// Attach the listeners for each item
				attachClickListeners(marker);
			}
		}

		function attachClickListeners(marker) {
			google.maps.event.addListener(marker, 'click', function() {
				$scope.curBuddy = getBuddyById(marker.buddyId);
				$scope.count++;
				$scope.$apply();
				infoWindow.setContent(compiled[0]);
				infoWindow.open(map, marker);
			});
			/*
			google.maps.event.addListener(marker, 'click',
				(function(marker, scope, compiled) {
					return function() {
						scope.curLatLng = marker.getPosition();
						scope.$apply();
						infoWindow.setContent(compiled[0]);
						infoWindow.open(map, marker);
					};
			})(marker, $scope, compiled));
			*/
		}

		$scope.gotoBuddy = function(buddyId) {
			$scope.curBuddy = getBuddyById(buddyId);
			$scope.count++;
			
			// Find the marker for the buddy
			//console.log(markerArr);
			var marker;
			for (var i = 0; i < markerArr.length; i++) {
				if (markerArr[i].buddyId == buddyId) {
					marker = markerArr[i];
					break;
				}
			}

			map.panTo(marker.getPosition());
			infoWindow.setContent(compiled[0]);
			infoWindow.open(map, marker);
		}

		$scope.imgBorderClass = function(buddyId) {
			var tmpBuddy = getBuddyById(buddyId);
			var borderClass;
			switch(tmpBuddy.oncall) {
				case statusEnum.WAITING: borderClass = 'border-waiting';
					break;
				case statusEnum.EN_ROUTE: borderClass = 'border-en-route';
					break;
				case statusEnum.AVAILABLE: borderClass = 'border-available';
					break;
			}
			return borderClass;
		}
	}
]);
