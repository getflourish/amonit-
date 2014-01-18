angular.module('centerModule', []).
directive('center' ,function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			scope.$watch(element.width(), function () {
				element.css({
					top: element.parent().height() / 2 - $(element).height(),
				});
			});
		}
	}
})
