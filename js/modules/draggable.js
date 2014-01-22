angular.module('draggableModule', []).
directive('draggable', ['$document', '$rootScope' , function($document, $rootScope) {
    return {
        restrict: "A",
        replace: false,
        scope: {
            annotation: "=a",
        },
        link: function(scope, elm, attrs) {
            var startX, startY, initialMouseX, initialMouseY;
            var handle = $(elm).find('' + attrs.handle); 
            elm.css({position: 'absolute'});
            handle.addClass("ui-draggable");

            handle.bind('mousedown', function($event) {
                startX = elm.prop('offsetLeft');
                startY = elm.prop('offsetTop');
                initialMouseX = $event.clientX;
                initialMouseY = $event.clientY;
                $document.bind('mousemove', mousemove);
                $document.bind('mouseup', mouseup);

                return false;
            });

            function mousemove($event) {
                var dx = $event.clientX - initialMouseX;
                var dy = $event.clientY - initialMouseY;
                
                var x = startX + dx;
                var y = startY + dy;

                elm.css({
                    top:  y + 'px',
                    left: x + 'px',
                });

                return false;
            }

            function mouseup($event) {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                $rootScope.$emit('annotation:dragstop', $event);
            }
        }
    };
}]);
