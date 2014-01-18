angular.module('stretchModule', []).directive('verticalstretch', function() {
	return function (scope, element, attrs) {
		element.height($(window).height());
	};
});