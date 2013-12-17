angular.module('stretchModule', []).directive('stretch', function() {
	return function (scope, element, attrs) {
		element.height($(window).height());
	};
});