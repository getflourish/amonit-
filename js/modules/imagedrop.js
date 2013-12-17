angular.module('imagedropModule', [])
.directive("imagedrop", function ($parse) {
	return {
		restrict: "EA",
		link: function (scope, element, attrs) {
            //The on-image-drop event attribute
            var onImageDrop = $parse(attrs.onImageDrop);

            //When an item is dragged over the document, add .dragOver to the body
            var onDragOver = function (e) {
            	e.preventDefault();
            	$('body').addClass("dragOver");
            };

            //When the user leaves the window, cancels the drag or drops the item
            var onDragEnd = function (e) {
            	e.preventDefault();
            	$('body').removeClass("dragOver");
            };

            //When a file is dropped on the overlay
            var loadFile = function (file) {
            	scope.uploadedFile = file;
            	scope.$apply(onImageDrop(scope));
            };

            //Dragging begins on the document (shows the overlay)
            $(document).bind("dragover", onDragOver);

            //Dragging ends on the overlay, which takes the whole window
            element.bind("dragleave", onDragEnd)
            .bind("drop", function (e) {
            	onDragEnd(e);
            	var files = e.originalEvent.dataTransfer.files;
            	for (var i = 0; i < files.length; i++) {
            		loadFile(files[i]);
            	}
            });
        }
    };
});