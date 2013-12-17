angular.module('authModule', ['firebase', 'cursorModule']).controller('AuthController', ['$scope', '$firebase',
	function($scope, $firebase) {

		/**
		*	Variables
		*/

		$("body").on("mousemove", function(event) {
			$scope.update(event);
		})

		// reference to all available cursors
		$scope.cursors = [];

		// id of logged in user
		$scope.id = null;

		// reference to logged in user
		$scope.user = null;

		// reference to logged in user
		$scope.me = null;

		/**
		*	User Reference: $scope.users
		*/

		var myConnectionsRef = new Firebase('https://feedbacktool.firebaseio.com/users/');
		$scope.users = $firebase(myConnectionsRef);

		/**
		*	Authentication logic
		*/

		var userAuth = new Firebase('https://feedbacktool.firebaseio.com');
		var auth = new FirebaseSimpleLogin(userAuth, function(error, user) {

			if (error) {

				// an error occured while trying to log in

				switch(error.code) {
					case 'INVALID_EMAIL':
						break;
					case 'INVALID_PASSWORD':
						break;
					default:
				}

			} else if (user) {
				console.log("logged in")

				// successfully logged in

				$scope.handleLogin(user);

			} else {

				// user logged out

				$scope.user = null;
				$scope.$apply();

			}
		});

		/**
		*	Function: createUser
		*
		*	Creates a new user using the Firebase password provider.
		*	Expects @firstname and @lastname
		*/
		
		$scope.createUser = function (email, password, firstname, lastname) {

			auth.createUser(email, password, function(error, user) {
				
				if (!error) {
					
					var userRef = new Firebase('https://feedbacktool.firebaseio.com/users/' + user.id + '/name');
					userRef.set({"first" : firstname, "last" : lastname});
					$scope.user = user;

					// automatically login after signup

					auth.login('password', {
						email: email,
						password: password
					});

				} else {

					// todo: error handling

					console.log(error);
				}
			});
		};
		
		/**
		*	Function: handleLogin
		*
		*	Handles presence of the currently logged in user and broadcasts its mouse cursor.
		*/
		
		$scope.handleLogin = function (user) {
			$scope.user = user;
			
			// todo: might be redundant to have 'user' and 'me'
			
			$scope.me = $firebase(new Firebase('https://feedbacktool.firebaseio.com/users/' + user.id + '/name'));
			$scope.me.id = user.id;
			
			// cursors: $scope.cursors
			
			$scope.cursors = $firebase(new Firebase("https://feedbacktool.firebaseio.com/cursors"));
			
			// cursor of current user
			
			$scope.cursorRef = new Firebase("https://feedbacktool.firebaseio.com/cursors/" + user.id);
			$scope.mycursor = $firebase($scope.cursorRef);
			
			/**
			*	Presence system
			*/
			
			// store the users connections
			
			var myConnectionsRef = new Firebase('https://feedbacktool.firebaseio.com/users/' + user.id + '/connections');
			
			// stores the timestamp of my last disconnect (the last time I was seen online)
			
			var lastOnlineRef = new Firebase('https://feedbacktool.firebaseio.com/users/' + user.id + '/lastOnline');
			
			// Firebase thing that refers to the users connection
			
			var connectedRef = new Firebase('https://feedbacktool.firebaseio.com/.info/connected');
			connectedRef.on('value', function(snap) {

				if (snap.val() === true) {

					// just connected
					var con = myConnectionsRef.push(true);

					// remove the device when user disconnects
					con.onDisconnect().remove();

					// remove cursor reference
					$scope.cursorRef.onDisconnect().remove();

					// update timestamp
					lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
				}
			});
		};
		
		/**
		*	Function: login
		*/
		
		$scope.login = function (email, password) {
			$scope.logout();
			auth.login('password', {
				email: email,
				password: password
			});
		};
		
		/**
		*	Function: logout
		*/
		
		$scope.logout = function (email, password) {
			auth.logout();
		};
		
		/**
		*	Function: update
		*/

		$scope.update = function(event) {
			if ($scope.cursorRef) $scope.cursorRef.set({"x":event.offsetX, "y":event.clientY, "id":$scope.me.id});
		};
	}]);

/**
*	todo: module should be directive only
*
*	Updates the position of all cursors when a change to the cursors array is detected.
*/

angular.module('cursorModule', []).
directive('cursor', ['$document' , function($document) {
	return {
		link: function(scope, elm, attrs) {
			scope.$watch('cursor', function () {

				var startX = scope.cursor.x;
				var startY = scope.cursor.y;

				elm.css({
					top:  startY + 'px',
					left: startX + 'px'
				});
			});
		}
	};
}]);