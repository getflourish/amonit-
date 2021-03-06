
var feedbackApp = angular.module('feedbackApp', ['authModule', 'centerModule', 'contenteditableModule', 'draggableModule', 'firebase', 'focusModule', 'imagedropModule', 'stretchModule',  'timeSince', 'ui.sortable',
]);

feedbackApp.controller("FeedbackController", function($firebase, $http, $scope, $rootScope, $timeout, uploadService ) {
	
	/**
	 * Scope variables
	 * ///////////////////////////////////////////////////////////////// */

	// defines whether dropped images are added before or after other images
	$scope.addOrder = "before";

	// Will be set to true after the brief was read
	$scope.briefRead = true;

	// comment types
	$scope.commentTypes = [
		{"type":"idea", "label":"I like it, but…", "typeLabel":"Idea", "show": true, "class":"green"}, 
		{"type":"question", "label":"What’s that?", "typeLabel":"Question", "show": true, "class":"purple"}, 
		{"type":"onit", "label":"Right on!", "typeLabel":"Right on", "show": true, "class":"blue"}
	];

	// reference to the currently selected image object
	$scope.current;

	// index of the currently selected image object
	$scope.currentIndex = 0;

	// data object that holds information about images and the path
	$scope.data = {"images":$scope.images, "path":""};

	// flag used to indicate whether a tooltip is being edited
	$scope.editing = false;

	// grabbed from href and used to decide whether to create a new folder or use an existing one
	$scope.id;

	// most important object. contains information about images and their annotations
	$scope.images = [];	

	// used on loading (could be replaced with the path?)
	$scope.image_directory = "";

	// jQuery reference to the main image
	$scope.imageElement = $("#main img");

	// Fullscreen state
	$scope.isFullscreen = false;

	// jQuery reference to the image sidebar
	$scope.overview = $("#left");

	// flag that represents the state of the overview
	$scope.overviewShowing = true;

	// onit path to images
	$scope.path;

	// project path
	$scope.projectpath = "";

	// index of selected annotation
	$scope.selectedAnnotation = -1;

	// flag that indicates whether all tooltips are open
	$scope.showingAll = false;

	// User name will be set after the brief was read
	$scope.username = "";


	/**
	 * Keyboard Shortcuts
	 * ///////////////////////////////////////////////////////////////// */

	key('p', function(){ 
		$scope.toggleFullscreen();
		$scope.$apply();
		return false;
	});

	$scope.toggleFullscreen = function () {
		$scope.isFullscreen = !$scope.isFullscreen;
	}

	key('up', function(){ 
		$scope.prev();
		$scope.$apply();
		return false;
	});

	key('down', function(){ 
		$scope.flashnext = true;
		$scope.next();
		$scope.$apply();
		return false;
	});

	key('esc', function(){ 
		$scope.onEsc();
		return false;
	});

	key('space', function(){ 
		// toggle all tooltips
		$scope.showingAll = !$scope.showingAll;
		return false;
	});


	/**
	 * Event handlers 
	 * ///////////////////////////////////////////////////////////////// */

	 /**
	  * Resize
	  */

	$rootScope.$on('resize', function () {
		onResize();
	});
	 

	/**
	 * Upload
	 */

	$rootScope.$on('upload:loadstart', function () {
		console.log('Controller: on `loadstart`');
	});

	$rootScope.$on('upload:error', function () {
		console.log('Controller: on `error`');
	});

	$rootScope.$on('upload:success', function (event, file, order) {
		if (order == "before") {
			$scope.addImage(file, 0);
		} else {
			$scope.addImage(file, $scope.images.length);
		}
	});

	/**
	 * Update mouse cursor
	 */

	$("body").on("mousemove", function(event) {
		$scope.updateCursor(event);
	})

	$rootScope.$on("loggedIn", function (event, user) {
		$scope.user = user;

		$scope.cursors = $firebase(new Firebase("https://feedbacktool.firebaseio.com/cursors"));
		
		$scope.cursorRef = new Firebase("https://feedbacktool.firebaseio.com/cursors/" + user.id);
		$scope.mycursor = $firebase($scope.cursorRef);
	});

	/**
	 * Tooltips
	 */

	$rootScope.$on('tooltip:startedit', function (event, index) {
		$scope.editing = true;
	});

	$rootScope.$on('tooltip:stopedit', function (event, index) {
		$scope.editing = false;
		$scope.save();
	});

	$rootScope.$on('tooltip:blur', function (event, index) {
		if ($scope.selectedAnnotation.comment === "") {
			$scope.removeAnnotation(index);
		}
	});

	$rootScope.$on('tooltip:remove', function (event, index) {
		$scope.removeAnnotation(index);
	});


	/**
	 * Functions
	 * ///////////////////////////////////////////////////////////////// */

	
	/**
	 * Function: addAnnotation
	 *
	 * Adds annotation to given x/y coordinates
	 */

	$scope.addAnnotation = function (globalX, globalY) {

		if ($scope.selectedAnnotation == -1) {
		// convert coordinates to local space

			var x = (globalX) / $scope.imageElement.prop("width");
			var y = (globalY) / $scope.imageElement.prop("height");
	
			// save annotation 
	
			$scope.current.annotations.push({"x":x, "y":y, "author":$scope.username, "id":$scope.current.annotations.length + 1, "comment":"", "replies": [], "timestamp":new Date().getTime()})
			$scope.save();
	
			// select annotation to open it
			
			$scope.setActive($scope.current.annotations.length-1);
	
		} else {
			// close currently open annotation
			if ($scope.selectedAnnotation.comment === "") {
				$scope.removeAnnotation($scope.current.annotations.length-1)
			}
			$scope.save();
			$scope.selectedAnnotation = -1;
		}
	}

	/**
	 * Function: addImage
	 *
	 * Add image from file, at the given index (todo: only supports first or last)
	 */

	$scope.addImage = function (file, index) {
		
		// construct image object
		var newImage = {"filename": file.name, "path": $scope.path + "/" + file.name, "id": $scope.images.length, "annotations":[]};
		console.log("new image");
		console.log($scope.images);

		// add to images array
		if (index == 0) {
			$scope.images.unshift(newImage);
		} else {
			$scope.images.push(newImage);
		}	
		
		// set the new image as current
		$scope.setImage(index);

		// use timeout before scrolling to the recently added image

		// todo: remove if scrolling works with directive 

		// $timeout(function () {
		// 	$("#left").animate({scrollTop: $(".selected").prop("offsetTop")}, "slow");
		// })
	}

	/**
	 * Function: blurTooltip
	 *
	 * Will hide a tooltip on enter or escape (e.g. to submit / cancel an input)
	 */

	$scope.blurTooltip = function (event, index) {
		
		// remove annotation if comment is empty and return was pressed

		if (event.keyCode == 27) {

			event.preventDefault(); 

			// remove
			if ($scope.selectedAnnotation.comment === "") {
					$scope.removeAnnotation(index);	
			}

			// todo: test whether this should be if/else and save is 
			// only necessary when there is a comment

			// save
			$scope.save();
			
			// deselect
			$scope.selectedAnnotation = -1;

		} else if (event.keyCode == 13) {

			// remove annotation if comment is empty and escape was pressed
			if ($scope.selectedAnnotation.comment === "") {
				$scope.removeAnnotation(index);	
			}
		}
	}


	/**
	 * Function: disableAnnotationTransition
	 *
	 * Will remove animate class from annotations so they 
	 * only move once after their creation.
	 */

	 // todo: make use of ng-class

	$scope.disableAnnotationTransition = function () {
		$timeout(function() {
			$(".animate").each(function() {
				$(this).removeClass("animate");
			});
		});
	}

	/**
	 * Function: goFullscreen
	 *
	 * Fullscreen behavior
	 */

	$scope.goFullscreen = function () {

		$scope.isFullscreen = true;
	}

	/**
	 * Function: hideAllAnnotations
	 *
	 * Hides all tooltips
	 */

	$scope.hideAllAnnotations = function () {
		$scope.showingAll = false;
	}

	/**
	 * Function: hideOverview
	 *
	 * Hides the overview
	 */

	$scope.hideOverview = function () {
		$scope.overviewShowing = false;
	}

	/**
	 * Function: imageDropped
	 *
	 * Will upload dropped files that will be appended to the images array
	 */

	$scope.imageDropped = function(){

    	// get the file
    	var file = $scope.uploadedFile;

    	// add order 
    	$scope.addOrder = "after";

    	// upload file via XHR + PHP
    	$scope.uploadFile(file);

	    // clear the uploaded file
	    $scope.uploadedFile = null;
	};

	$scope.init = function (id) {
		$scope.setId(id);
	}

	/**
	 * Function: load
	 *
	 * Initially loads data from the server
	 */

	$scope.load = function () {

		$http.get('load.php?image_directory=' + $scope.image_directory).success(function(data) {

			if (data.images == undefined) {
				
				// this is a new stack

				$scope.path = data;
				$scope.data.path = data;
				$scope.id = data;

			} else {

				// this is an existing stack

				$scope.data.path = data.path;
				$scope.path = data.path;
				$scope.id = data.path;
				$scope.images = data.images;
				$scope.current = $scope.images[$scope.currentIndex];
				$scope.briefRead = false;
			}
			$scope.setPath();
			$scope.setupFirebase();
		});
	}

	/**
	 * Function: next
	 *
	 * Shows next image
	 */

	$scope.next = function () {
		if ($scope.currentIndex < $scope.images.length - 1) {
			$scope.currentIndex++;
			$scope.selectedAnnotation = -1;
			$scope.$apply();
			$scope.scrollOverview();
			$scope.setImage($scope.currentIndex);
		}
	}

	/**
	 * Function: onAnnotationClick
	 *
	 * Hides currently selected tooltip
	 */

	$scope.onAnnotationClick = function(index) {

		$scope.setActive(-1);
	}

	/**
	 * Function: onCommentHover
	 *
	 * Shows all annoations when hovering the title in the comments sidebar
	 */

	$scope.onCommentHover = function (index) {
		$scope.setImage(index);
		$scope.showAllAnnotations();
	}

	/**
	 * Function: onBlur
	 *
	 * Removes annotation if comment is empty and focus is lost
	 */

	$scope.onBlur = function (index) {
		if ($scope.selectedAnnotation.comment === "") {
			$scope.removeAnnotation(index);
		}
	}

	/**
	 * Function: onEsc
	 *
	 * Removes empty annotations
	 */

	$scope.onEsc = function () {
		if ($scope.selectedAnnotation != -1) {
			$scope.removeAnnotation($scope.current.annotations.length-1);
		} else if ($scope.isFullscreen) {
			$scope.toggleFullscreen();
			$scope.$apply();
		}
		return false;
	}

	$scope.prev = function () {
		if ($scope.currentIndex > 0) {			
			$scope.currentIndex--;
			$scope.selectedAnnotation = -1;
			$scope.$apply();
			$scope.scrollOverview();
			$scope.setImage($scope.currentIndex);
		}
	}

	/**
	 * Function: removeAnnotation
	 *
	 * Removes the annotation at the given index form the array of annotations
	 */

	$scope.removeAnnotation = function(index){
		$scope.current.annotations.splice(index, 1);
		$scope.setActive(-1);
		$scope.save();
	}

	/**
	 * Function: removeImage
	 *
	 * Removes image at the given index from the array of images 
	 * and sets the current image to the next one in the array.
	 */

	$scope.removeImage = function (index) {
		$scope.images.splice(index, 1);
		if (index == $scope.images.length) index = index - 1;
		$scope.setImage(index);
		$scope.save();
	}

	/**
	 * Function: save
	 *
	 * Submits all data to the server
	 */

	$scope.save = function () {
		
		// todo: check whether there is another empty annotation
		// if so, remove it

		$scope.data.images = $scope.images;

		$http.post('save.php?path=' + $scope.path,$scope.data).success(function(data) {
		});		
	}

	/**
	 * Function: scrollOverview
	 *
	 * Will scroll the sidebar so that the selected image is visible at the top
	 */

	$scope.scrollOverview = function () {

		// todo: remove if scrollSelected works

	 	// $("#left").stop().animate({scrollTop: $(".selected").prop("offsetTop") }, "slow");
	 	// $scope.overviewShowing = true;
	}

	$scope.setPath = function () {
		$http.get('getpath.php').success(function(data) {
			$scope.projectpath = data + "/?id=" + $scope.id.substr(3);
		});
	}

	/**
	 * Function: showAllAnnotations
	 *
	 * Adds .open to every tooltip so it will be visible
	 */

	$scope.showAllAnnotations = function () {

		if($scope.selectedAnnotation == -1) {
			
			$scope.showingAll = true;
			
		} else {
			return;
		}
	}

	$scope.showOverview = function () {
		$scope.overviewShowing = true;
	}
	
	/**
	 * Function: setActive
	 *
	 * Expects an index that will be used to store the selected annotation
	 */

	$scope.setActive = function (index) {
		if (!$scope.editing) {
			var a = $scope.current.annotations[$scope.selectedAnnotation];
			if (index == -1 && a) {
				if (a.comment === "") {
					$scope.removeAnnotation(index);
				}
			}
			$scope.selectedAnnotation = index;

			// todo: is this necessary? Should be enought to remove it from the selected one?
			$timeout(function () {
				$scope.disableAnnotationTransition();
			});
		}
	}

	/**
	 * Function: setId
	 */

	$scope.setId = function (id) {
		
		$scope.id = id;

		if ($scope.id != undefined) {
			$scope.image_directory = $scope.id;		
		} else {
			$scope.image_directory = -1;
		}

		$scope.load();
	}

	/**
	 * Jumps to the given image with the given id
	 */

	$scope.setImage = function (index) {
		$scope.current = $scope.images[index];
		$scope.currentIndex = index;
		$scope.save();
	};

	/**
	 * Firebase sync
	 */

	 $scope.setupFirebase = function () {

	 	// todo: add $scope.images to firebase :)

		// // manage images
		// console.log("id" + $scope.id);
	 	// var con = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images');
		// $scope.imagesFirebase = $firebase(con);
		// $scope.imagesFirebase.$bind($scope, "images");

	 	// manage index
	 	var con = new Firebase('https://feedbacktool.firebaseio.com/currentIndex');
		$scope.indexFirebase = $firebase(con);
		$scope.indexFirebase.$bind($scope, "currentIndex");

		// set image after change
		$scope.indexFirebase.$on("change", function() {
			$scope.setImage($scope.indexFirebase.$value);
		});

		// get connected id
		var connectedRef = new Firebase('https://feedbacktool.firebaseio.com/.info/connected');
		console.log($firebase(connectedRef));
	 }

	 /** 
	  * Function: updateCursor
	  */

	 $scope.updateCursor = function (event) {
		if ($scope.cursorRef) $scope.cursorRef.set({"x":event.clientX, "y":event.clientY, "id":$scope.user.id});
	 }

	/**
	 * Initiates upload via factory
	 */


	$scope.uploadFile = function (file, order) {
		uploadService.send(file, order, $scope.path);
	}


	/**
	 * Resize handler
	 * ///////////////////////////////////////////////////////////////// */


	window.onresize = onResize;

	function onResize() {
    
    	var domElt = document.getElementById('main');
    	scope = angular.element(domElt).scope();
    	scope.$apply(function() {
    	    scope.width = window.innerWidth;
    	    scope.height = window.innerHeight;
    	});
// 
    	// var domElt = document.getElementById('left');
    	// domElt.height = window.innerHeight;
// 
    	// var domElt = document.getElementById('right');
    	// domElt.height = window.innerHeight;

    	// var imgwrapper = $("#imgwrapper");
		// var offset = $(window).height()/2 - imgwrapper.height() / 2;
    	// imgwrapper.css("top", offset);
	}
});

/**
* Directives
* ///////////////////////////////////////////////////////////////// */

feedbackApp.directive('annotation', ['$document' , function($document) {
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

// attaches load listener to annotatable element and fires an event so tooltips can be positioned properly

feedbackApp.directive('annotatable', function () {       
	return {
		link: function(scope, element, attrs) {   
			element.bind("load" , function(event){ 
				scope.imageLoaded = true;
				scope.$apply();

			});

		}
	}
});

feedbackApp.directive('ngFocus', function($timeout) {
	return {
		link: function ( scope, element, attrs ) {
			scope.$watch( attrs.ngFocus, function ( val ) {
				if ( angular.isDefined( val ) && val ) {
					$timeout( function () { 
						element[0].focus(); 
					} );
				}
			}, true);

			element.bind('blur', function () {
				if ( angular.isDefined( attrs.ngFocusLost ) ) {
					scope.$apply( attrs.ngFocusLost );
				}
			});
		}
	};
});

/**
 * Upload Factory
 *
 * Source: http://jsfiddle.net/BernhardW/daJ45/
 */

feedbackApp.factory('uploadService', ['$rootScope', function ($rootScope) {

	return {
		send: function (file, order, path) {
			var data = new FormData(),
			xhr = new XMLHttpRequest();

            // When the request starts.
            xhr.onloadstart = function () {
            	console.log('Factory: upload started: ', file.name);
            	$rootScope.$emit('upload:loadstart', xhr);
            };

            // When the request has failed.
            xhr.onerror = function (e) {
            	$rootScope.$emit('upload:error', e);
            };

            // Send to server, where we can then access it with $_FILES['file].
            data.append('file', file, file.name);
            console.log("path: " + path)
            console.log($rootScope)
            data.append('path', path);
            xhr.open('POST', 'upload.php');
            xhr.send(data);

            xhr.onload = function (e) {
            	if (xhr.status === 200) {
            		console.log('all done: ' + xhr.status);
            		console.log(file)
            		$rootScope.$emit('upload:success', file, order);
            	} else {
            		console.log('Something went terribly wrong...');
            	}
            };
        }
    };

}]);

/**
 * Click to edit
 *
 * Source: http://icelab.com.au/articles/levelling-up-with-angularjs-building-a-reusable-click-to-edit-directive/
 */

feedbackApp.directive("clickToEdit", function() {
    var editorTemplate = '<div class="click-to-edit">' +
        '<div ng-hide="view.editorEnabled">' +
            '{{value}} ' +
            '<a href="#" class="edit icon" ng-click="enableEditor()">p</a>' +
        '</div>' +
        '<div ng-show="view.editorEnabled">' +
            '<input ng-keydown="onKeypress($event)" ng-model="view.editableValue">' +
            '<button ng-click="save()">Save</button>' +
            ' or ' +
            '<button ng-click="disableEditor()">cancel</button>.' +
        '</div>' +
    '</div>';

    return {
        restrict: "A",
        replace: false,
        template: editorTemplate,
        scope: {
            value: "=clickToEdit",
        },
        controller: function($scope) {
            $scope.view = {
                editableValue: $scope.value,
                editorEnabled: false
            };

            $scope.onKeypress = function (event) {
            	console.log(event.keyCode)
            	$scope.value = $scope.view.editableValue;
            	if (event.keyCode == 13) {
            		event.preventDefault();
            		$scope.save();
            		
            	}
            };

            $scope.enableEditor = function() {
            	console.log($scope)
                $scope.view.editorEnabled = true;
                $scope.view.editableValue = $scope.value;
            };

            $scope.disableEditor = function() {
                $scope.view.editorEnabled = false;
            };

            $scope.save = function() {
                $scope.value = $scope.view.editableValue;
                $scope.disableEditor();
            };
        }
    };
});

/**
 * Filepickers will trigger click event on #input
 */

feedbackApp.directive("filepicker", function () {
	return {
		restrict: "A",
		link: function (scope, element, attrs) {

			$(element).on("click", function () {
				scope.addOrder = attrs.order;
				$("#filepicker").trigger("click");
			});
		}
	}
});

/**
 * Uploader will trigger uploadFile() when items are added
 */

feedbackApp.directive("uploader", function () {
	return {
		restrict: "A",
		link: function (scope, element, attrs) {

			$(element).on("change", function (e) {
				var files = e.currentTarget.files;
				for (var i = 0; i < files.length; i++) {
					scope.uploadFile(files[i], scope.addOrder);
				}
			});
		}
	}
});

/**
 * Tooltip
 */

feedbackApp.directive("tooltip", ['$rootScope', '$timeout', function ($rootScope) {
    var tooltipTemplate = '<div class="click-to-edit">' +
        '<div ng-hide="view.editorEnabled || annotation.comment">' +
        '<button ng-repeat="type in types" ng-click="enableEditor(type)" class="{{type.class}}">{{type.label}}</button>' +
        '</div>' +
        '<div ng-show="view.editorEnabled">' +
            '<textarea ng-keydown="onKeypress($event)" ng-model="annotation.comment" ng-blur="onBlur(id)"></textarea>' +
            '<button class="green" ng-click="save()">Save</button>' +
            '<button ng-click="revert()">Cancel</button>' +
        '</div>' +
        '<div ng-show="annotation.comment && !view.editorEnabled">' + 
        	'<span class="tag" ng-class="{green: annotation.type==\'idea\', purple:annotation.type==\'question\', blue: annotation.type==\'onit\'}">{{annotation.typeLabel}}</span>' +
        	'<div class="brief-author">' +
				'<img src="images/me.png">' +
				'<strong class="brief-name light">{{annotation.author}}</strong><span class="brief-date light" time-since="annotation.timestamp"></span>' +
			'</div>' +
        	'{{annotation.comment}}' + 
        	
			'<ul class="indent">' +
				'<li ng-repeat="reply in annotation.replies">' +
					'<div class="brief-author">' +
						'<img src="images/me.png">' +
						'<strong class="brief-name light">{{reply.user}}</strong><span class="brief-date light" time-since="reply.timestamp"></span>' +
					'</div>' +
					'{{reply.text}}' +
				'</li>' +
			'</ul>' +

        	'<a href="#" class="right edit icon" ng-click="enableEditor()">p</a>' +
        	'<a href="#" class="right edit icon" ng-click="remove()">#</a>' +
        	'<form>' +
        		'<div><input type="text" placeholder="Comment" ng-model="view.reply" /></div>' +
        		'<button class="btn-okay" ng-click="reply()" type="submit">Reply</button>' + 
        	'</form>'+

    '</div>';

    return {
        restrict: "A",
        replace: false,
        template: tooltipTemplate,
        scope: {
            annotation: "=a",
            id: "=id",
            types: "=types",
            username: "=username"
        },
        controller: function($rootScope, $scope, $timeout) {
            $scope.view = {
                editableValue: $scope.annotation.comment,
                editorEnabled: false,
                reply: "",
            };

            $scope.enableEditor = function(type) {
            	$scope.previousComment = $scope.annotation.comment;
            	if (type) {
            		$scope.annotation.type = type.type;
            		$scope.annotation.typeLabel = type.typeLabel;
            	}
                $scope.view.editorEnabled = true;
                $scope.view.editableValue = $scope.annotation.comment;
                $scope.focus();
                $rootScope.$emit('tooltip:startedit', $scope.id);
            };

            $scope.disableEditor = function() {
                $scope.view.editorEnabled = false;
                $rootScope.$emit('tooltip:stopedit', $scope.id);
            };

            $scope.onKeypress = function (event) {
            	if (event.keyCode == 13) {
            		event.preventDefault();
            		$timeout(function () {
            			$scope.save();
            		});
            	} else if (event.keyCode == 27) {
            		$scope.revert();
            	}
            };

            $scope.reply = function () {
            	if ($scope.view.reply != "") {
            		var newreply = {"text":$scope.view.reply, "user":$scope.username, "timestamp":new Date().getTime()};
            		$scope.annotation.replies.push(newreply);
            		$scope.view.reply = "";
            		$scope.save();	
            	}
            }

            $scope.revert = function () {
            	$scope.annotation.comment = $scope.previousComment;
            	$scope.view.editorEnabled = false;
            	$rootScope.$emit('tooltip:stopedit', $scope.id);
            }

            $scope.onBlur = function (id) {
				$rootScope.$emit('tooltip:blur', $scope.id);
            }

            $scope.remove = function () {
				$rootScope.$emit('tooltip:remove', $scope.id);
            }

            $scope.focus = function () {
            	$timeout(function () {
                	$(".open").find('textarea')[0].focus();
                })
            }

            $scope.save = function() {
                // scope.setActive(-1);
                $scope.disableEditor();
            };
        }
    };
}]);

/**
 * Custom comment type filter
 */

feedbackApp.filter('typeFilter', function() {
    return function(data, values) {
      var vs = [];
      angular.forEach(values, function(item){
        if(!!item.show){
          vs.push(item.type);
        }
      });

      if(vs.length === 0) return data;
      
      var result = [];
      angular.forEach(data, function(item){
        if(vs.indexOf(item.type) >= 0){
          result.push(item);
        }
      });
      return result;
    }
});


/**
*	Directive Cursor
*
*	Updates the position of all cursors when a change to the cursors array is detected.
*/


feedbackApp.directive('cursor', ['$document' , function($document) {
	return {
		link: function(scope, elm, attrs) {
			scope.$watch('cursor', function () {

				var startX = scope.cursor.x;
				var startY = scope.cursor.y;

				elm.css({
					top:  startY + 'px',
					left: startX + 'px'
				});
			});
		}
	};
}]);


/**
*	Directive selectedScroll
*
*	Will scroll the element to the top position of the selected element in the sidebar
*/


feedbackApp.directive('selectedscroll', ['$document', '$timeout', function($document, $timeout) {
	return {
		link: function(scope, elm, attrs) {
			scope.$watch('currentIndex', function () {
				console.log("should scroll")
				$timeout(function() {
					elm.stop().animate({scrollTop: $(".selected").prop("offsetTop") }, "slow");
				});

	 			scope.overviewShowing = true;
			});
		}
	};
}]);

/**
*	Directive fullscreen
*
*	Will scroll the element to the top position of the selected element in the sidebar
*/


feedbackApp.directive('fullscreen', ['$document', '$rootScope', function($document, $rootScope) {
	return {
		link: function(scope, elm, attrs) {
			scope.$watch('isFullscreen', function () {
				
				// hide header, right sidebar
				if (scope.isFullscreen) {
					$("header").hide();
					$("#right").hide();
					$("#main").addClass("fullscreen");
					$("#wrap").addClass("fullscreen");
					$("#imgwrapper").addClass("fullscreen");
				} else {
					$("header").show();
					$("#right").show();	
					$("#main").removeClass("fullscreen");
					$("#wrap").removeClass("fullscreen");
					$("#imgwrapper").removeClass("fullscreen");
				}
		
				// add classes that remove margins etc.
		
				
	
				// trigger resize calculations

				// $rootScope.$emit('resize');

			});
		}
	};
}]);
