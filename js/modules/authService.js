angular.module('authModule', ['firebase'], function($provide) {
	$provide.factory('authentication', ['$firebase', '$rootScope', function($firebase, $rootScope) {

		/**
		*	Variables
		*/

		// $("body").on("mousemove", function(event) {
		// 	update(event);
		// })

		var users = null;

		// reference to all available cursors
		var cursors = [];

		// id of logged in user
		var id = null;

		// reference to logged in user
		var user = null;

		// reference to logged in user
		var me = null;

		/**
		*	User Reference: users
		*/

		var myConnectionsRef = new Firebase('https://feedbacktool.firebaseio.com/users/');
		users = $firebase(myConnectionsRef);

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
				$rootScope.$broadcast('loggedIn');

				// successfully logged in

				handleLogin(user);

			} else {

				// user logged out

				console.log("logged out")

				user = null;

			}
		});

		/**
		*	Function: handleLogin
		*
		*	Handles presence of the currently logged in user and broadcasts its mouse cursor.
		*/
			
		handleLogin = function (user) {
			user = user;
			
			// todo: might be redundant to have 'user' and 'me'
			
			me = $firebase(new Firebase('https://feedbacktool.firebaseio.com/users/' + user.id + '/name'));
			me.id = user.id;
			
			// cursors: cursors
			
			cursors = $firebase(new Firebase("https://feedbacktool.firebaseio.com/cursors"));
			
			// cursor of current user
			
			cursorRef = new Firebase("https://feedbacktool.firebaseio.com/cursors/" + user.id);
			mycursor = $firebase(cursorRef);
			
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
					cursorRef.onDisconnect().remove();

					// update timestamp
					lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
				}
			});
		}

		return {

			/**
			*	Function: createUser
			*
			*	Creates a new user using the Firebase password provider.
			*	Expects @firstname and @lastname
			*/

			createUser: function (email, password, firstname, lastname) {
	
				auth.createUser(email, password, function(error, user) {
					
					if (!error) {
						
						var userRef = new Firebase('https://feedbacktool.firebaseio.com/users/' + user.id + '/name');
						userRef.set({"first" : firstname, "last" : lastname});
						user = user;
	
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
			},
			
			
			/**
			*	Function: login
			*/
			
			login: function (email, password) {
				this.logout();
				auth.login('password', {
					email: email,
					password: password
				});
			},
			
			/**
			*	Function: logout
			*/
			
			logout: function (email, password) {
				auth.logout();
				me = null;
			},
			
			/**
			*	Function: update
			*/
	
			update: function(event) {
				if (cursorRef) cursorRef.set({"x":event.offsetX, "y":event.clientY, "id":me.id});
			}
		}
	}])
});