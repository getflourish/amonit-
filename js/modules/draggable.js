angular.module('draggableModule', []).
directive('draggable', ['$document', '$rootScope' , function($document, $rootScope) {
    return {
<<<<<<< HEAD
        restrict: 'A',
        scope: {
            annotation: "=a",
            imageElement: "=image"
=======
        restrict: "A",
        replace: false,
        scope: {
            annotation: "=a",
>>>>>>> 7b9d12d6731ff0f561d8983e44f295e1f4f15d30
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

<<<<<<< HEAD
                
                scope.annotation.x = x / scope.imageElement.prop("width");
                scope.annotation.y = y / scope.imageElement.prop("height");

=======
>>>>>>> 7b9d12d6731ff0f561d8983e44f295e1f4f15d30
                return false;
            }

            function mouseup($event) {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
<<<<<<< HEAD
                $rootScope.$emit("dragstop");
=======
                $rootScope.$emit('annotation:dragstop', $event);
>>>>>>> 7b9d12d6731ff0f561d8983e44f295e1f4f15d30
            }
        }
    };
}]);
