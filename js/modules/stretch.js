angular.module('stretchModule', []).directive('verticalstretch', function() {
	return function (scope, element, attrs) {
		scope.$watch()
		element.height($(window).height());
	};
});
