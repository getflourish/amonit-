angular.module('loginModule', ['authModule']).controller('LoginController', ['$scope', 'authentication',
	function($scope, authentication) {

		$scope.$on("loggedIn", function () {
			console.log("foo")
			$scope.users = authentication.users;
			$scope.user = authentication.user;
			$scope.me = authentication.me;
			console.log(authentication)
			$scope.$apply();
		})
		
		$scope.login = function (email, password) {
			authentication.login(email, password);
		}

		$scope.createUser = function (email, password, firstname, lastname) {
			authentication.createUser(email, password, firstname, lastname);
		}

	}
]);