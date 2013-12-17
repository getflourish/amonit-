angular.module('annotationModule', []).
directive('annotation', ['$document' , function($document) {
	return {
		link: function(scope, elm, attrs) {	
			scope.$watch('width', function () {

				var startX = scope.annotation.x;
				var startY = scope.annotation.y;

				var parent = elm.parent().parent().find('img');
				
				var w = parent.prop("width");
				var h = parent.prop("height");

				elm.css({
					top:  startY * h + 'px',
					left: startX * w + 'px'
				});

				// disable animations after position was found
				elm.bind('transitionend webkitTransitionEnd', function(e){

					elm.removeClass("animate");
				});
			})
		}
	};
}]);