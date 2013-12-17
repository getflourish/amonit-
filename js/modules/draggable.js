angular.module('draggableModule', []).
directive('draggable', ['$document' , function($document) {
    return {
        restrict: 'A',
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

                var annotation = scope.current.annotations[attrs.annotationid];
                annotation.x = x / scope.imageElement.prop("width");
                annotation.y = y / scope.imageElement.prop("height");

                return false;
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                scope.save();
            }
        }
    };
}]);