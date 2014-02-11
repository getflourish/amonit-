var feedbackApp = angular.module('feedbackApp', ['authModule', 'monospaced.elastic', 'centerModule', 'contenteditableModule', 'draggableModule', 'firebase', 'focusModule', 'goover.comments', 'imagedropModule', 'stretchModule', 'timeSince', 'ui.sortable', ]);

feedbackApp.controller("FeedbackController", function($firebase, $http, $scope, $rootScope, $timeout, uploadService) {

    /**
     * Scope variables
     * ///////////////////////////////////////////////////////////////// */

    // defines whether dropped images are added before or after other images
    $scope.addOrder = "before";

    // Will be set to true after the brief was read
    $scope.briefRead = true;

    // comment types
    $scope.commentTypes = [{
        "type": "idea",
        "label": "Idea",
        "typeLabel": "Idea",
        "show": true,
        "class": "green"
    }, {
        "type": "question",
        "label": "Question",
        "typeLabel": "Question",
        "show": true,
        "class": "purple"
    }, {
        "type": "onit",
        "label": "Approval",
        "typeLabel": "Right on",
        "show": true,
        "class": "blue"
    }];

    // reference to the currently selected image object
    // $scope.project.images[$scope.currentIndex] = null;

    // index of the currently selected image object
    // $scope.project.images[$scope.currentIndex]Index = 0;

    // data object that holds information about images and the path
    $scope.data = {
        "images": "",
        "path": ""
    };

    $scope.foo = [{"foo":"bar"}, {"foo":"mooh"}];

    // flag used to indicate whether a tooltip is being edited
    $scope.editing = false;

    $scope.editBrief = false;

    // grabbed from href and used to decide whether to create a new folder or use an existing one
    $scope.id;

    $scope.project = {
        "images": [],
        "brief": "",
        "current": null,
        "currentIndex": 0,
        "hasBrief": false,
        "title": "untitled"
    };

    // most important object. contains information about images and their annotations


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

    key('p', function() {
        $scope.toggleFullscreen();
        $scope.$apply();
        return false;
    });

    $scope.toggleFullscreen = function() {
        $scope.isFullscreen = !$scope.isFullscreen;
    }

    key('up', function() {
        $scope.prev();
        $scope.$apply();
        return false;
    });

    key('down', function() {
        $scope.flashnext = true;
        $scope.next();
        $scope.$apply();
        return false;
    });

    key('esc', function() {
        $scope.onEsc();
        return false;
    });

    key('space', function() {
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

    $rootScope.$on('resize', function() {
        onResize();
    });

    /**
     * Save
     */

    $rootScope.$on('dragstop', function() {
        $scope.save();
    });

    /**
     * Upload
     */

    $rootScope.$on('upload:loadstart', function() {
        console.log('Controller: on `loadstart`');
    });

    $rootScope.$on('upload:error', function() {
        console.log('Controller: on `error`');
    });

    $rootScope.$on('upload:success', function(event, file, order) {
        if (order == "before") {
            $scope.addImage(file, 0);
        } else {
            $scope.addImage(file, $scope.project.images.length);
        }
    });

    /**
     * Update mouse cursor
     */

    $("body").on("mousemove", function(event)  {
        $scope.updateCursor(event);
    })

    $rootScope.$on("loggedIn", function(event, user) {
        $scope.user = user;

        $scope.cursors = $firebase(new Firebase("https://feedbacktool.firebaseio.com/cursors"));

        $scope.cursorRef = new Firebase("https://feedbacktool.firebaseio.com/cursors/" + user.id);
        $scope.mycursor = $firebase($scope.cursorRef);
    });

    /**
     * Comments
     */

     $rootScope.$on('comment:added', function(event, annotationId, reply) {
        $scope.saveReply(annotationId, reply);
    });

    /**
     * Tooltips
     */

    $rootScope.$on('tooltip:startedit', function(event, index) {
        $scope.editing = true;
    });

    $rootScope.$on('tooltip:stopedit', function(event, id, annotation) {
        $scope.editing = false;
        $scope.saveAnnotation(id, annotation);
    });

    $rootScope.$on('tooltip:blur', function(event, index) {
        if ($scope.selectedAnnotation.comment === "") {
            $scope.removeAnnotation(index);
        }
    });

    $rootScope.$on('tooltip:remove', function(event, index) {
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

    $scope.addAnnotation = function(event) {
        console.log($scope.project.images);

        if ($scope.selectedAnnotation == -1) {
            // convert coordinates to local space


            var globalX = (event.offsetX || event.clientX - $(event.target).offset().left);
            var globalY = (event.offsetY || event.clientY - $(event.target).offset().top);


            var x = (globalX) / $scope.imageElement.prop("width");
            var y = (globalY) / $scope.imageElement.prop("height");
            console.log(globalX);

            // save annotation

            if (!$scope.project.images[$scope.currentIndex].annotations) {
                $scope.project.images[$scope.currentIndex].annotations = [];
            }

            var newThread = {
                "x": x,
                "y": y,
                "author": $scope.username,
                "id": $scope.project.images[$scope.currentIndex].annotations.length + 1,
                "comment": "",
                "replies": [],
                "timestamp": new Date().getTime()
            };

            var annotationRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images/' + $scope.currentIndex + "/annotations/");
            var annotation = $firebase(annotationRef);
            var foo = annotation.$add(newThread);
            console.log(foo.name())

            // $scope.save();

            // select annotation to open it

            $scope.setActive($scope.project.images[$scope.currentIndex].annotations.length - 1);

        } else {
            // close currently open annotation
            if ($scope.selectedAnnotation.comment === "") {
                $scope.removeAnnotation($scope.project.images[$scope.currentIndex].annotations.length - 1)
            }
            $scope.save();
            $scope.selectedAnnotation = -1;
        }
    }

    $scope.saveAnnotation = function (id, a) {

        // use firebase $add to add the new comment thread to images.annotations
        // todo: rename annotations, comments, …

        var annotationsRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images/' + $scope.currentIndex + "/annotations");
        var annotations = $firebase(annotationsRef);

        var hash = annotations.$getIndex()[id];

        var annotationRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images/' + $scope.currentIndex + "/annotations/" + hash);
        var annotation = $firebase(annotationRef);

        annotation.$set(a);

    }

    $scope.saveReply = function (annotationId, r) {
        var annotationsRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images/' + $scope.currentIndex + "/annotations");
        var annotations = $firebase(annotationsRef);

        var hash = annotations.$getIndex()[annotationId];
        console.log(annotationId);

        var annotationRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images/' + $scope.currentIndex + "/annotations/" + hash + "/replies");
        var replies = $firebase(annotationRef);

        replies.$add(r);

    }

    /**
     * Function: addImage
     *
     * Add image from file, at the given index (todo: only supports first or last)
     */

    $scope.addImage = function(file, index) {

        // construct image object
        var newImage = {
            "filename": file.name,
            "path": $scope.path + "/" + file.name,
            "id": $scope.project.images.length,
            "annotations": []
        };

        // add to images array
        if (index == 0) {
            $scope.project.images.unshift(newImage);
        } else {
            $scope.project.images.push(newImage);
        }

        // set the new image as current
        $scope.setImage(index);
        $scope.save();

        // use timeout before scrolling to the recently added image

        // todo: remove if scrolling works with directive

        // $timeout(function () {
        // 	$("#left").animate({scrollTop: $(".selected").prop("offsetTop")}, "slow");
        // })
    }

    $scope.addReply = function() {
        if ($scope.view.reply != "") {
            var newreply = {
                "text": $scope.view.reply,
                "user": $scope.username,
                "timestamp": new Date().getTime()
            };

            if ($scope.annotation.replies) {
                $scope.annotation.replies.push(newreply);
            } else {
                $scope.annotation.replies = [];
                $scope.annotation.replies.push(newreply);
            }
            $scope.view.reply = "";
            $scope.save();
        }
    }

    /**
     * Function: blurTooltip
     *
     * Will hide a tooltip on enter or escape (e.g. to submit / cancel an input)
     */

    $scope.blurTooltip = function(event, index) {

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

    $scope.disableAnnotationTransition = function() {
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

    $scope.goFullscreen = function() {

        $scope.isFullscreen = true;
    }

    /**
     * Function: hideAllAnnotations
     *
     * Hides all tooltips
     */

    $scope.hideAllAnnotations = function() {
        $scope.showingAll = false;
    }

    /**
     * Function: hideOverview
     *
     * Hides the overview
     */

    $scope.hideOverview = function() {
        $scope.overviewShowing = false;
    }

    /**
     * Function: imageDropped
     *
     * Will upload dropped files that will be appended to the images array
     */

    $scope.imageDropped = function() {

        // get the file
        var file = $scope.uploadedFile;

        // add order
        $scope.addOrder = "after";

        // upload file via XHR + PHP
        $scope.uploadFile(file);

        // clear the uploaded file
        $scope.uploadedFile = null;
    };

    $scope.init = function(id) {
        $scope.resize();
        $scope.setId(id);
    }

    /**
     * Function: load
     *
     * Initially loads data from the server
     */

    $scope.load = function() {

        $http.get('load.php?image_directory=' + $scope.image_directory).success(function(data) {

            if (data.images == undefined) {
                //
                // 	// this is a new stack
                //
                $scope.path = data;
                $scope.data.path = data;
                $scope.id = data;
                console.log("dont exist")
                //
            } else {
                //
                // 	// this is an existing stack
                //
                $scope.data.path = data.path;
                $scope.path = data.path;
                $scope.id = data.path;

                console.log("exist")
                // 	$scope.project.images = data.images;
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

    $scope.next = function()  {
        if ($scope.currentIndex < $scope.project.images.length - 1) {
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

    $scope.onCommentHover = function(index) {
        $scope.setImage(index);
        $scope.showAllAnnotations();
    }

    /**
     * Function: onBlur
     *
     * Removes annotation if comment is empty and focus is lost
     */

    $scope.onBlur = function(index) {
        if ($scope.selectedAnnotation.comment === "") {
            $scope.removeAnnotation(index);
        }
    }

    /**
     * Function: onEsc
     *
     * Removes empty annotations
     */

    $scope.onEsc = function() {
        if ($scope.selectedAnnotation != -1) {
            $scope.removeAnnotation($scope.project.images[$scope.currentIndex].annotations.length - 1);
        } else if ($scope.isFullscreen) {
            $scope.toggleFullscreen();
            $scope.$apply();
        }
        return false;
    }

    $scope.prev = function()  {
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
     * Removes the annotation at the given index from the array of annotations
     */

    $scope.removeAnnotation = function(index) {

        // remove annotation from firebase

        var annotationRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id + '/images/' + $scope.currentIndex + "/annotations/index");
        var annotation = $firebase(annotationRef);
        annotation.$remove();

        $scope.setActive(-1);
        $scope.save();
    }

    /**
     * Function: removeImage
     *
     * Removes image at the given index from the array of images
     * and sets the current image to the next one in the array.
     */

    $scope.removeImage = function(index) {
        $scope.project.images.splice(index, 1);
        if (index == $scope.project.images.length) index = index - 1;
        $scope.setImage(index);
    }

    /**
     * Function: save
     *
     * Submits all data to the server
     */

    $scope.save = function() {

        // todo: check whether there is another empty annotation
        // if so, remove it

        // $scope.data.images = $scope.project.images;
        // $scope.project.$save();

        $http.post('save.php?path=' + $scope.path, $scope.data).success(function(data) {});
    }

    /**
     * Function: saveBrief
     *
     * Saves a Brief
     */

    $scope.saveBrief = function() {

        // todo: check whether there is another empty annotation
        // if so, remove it

        $scope.project.hasBrief = true;

        $scope.save();
    }

    /**
     * Function: scrollOverview
     *
     * Will scroll the sidebar so that the selected image is visible at the top
     */

    $scope.scrollOverview = function() {

        // todo: remove if scrollSelected works

        // $("#left").stop().animate({scrollTop: $(".selected").prop("offsetTop") }, "slow");
        // $scope.overviewShowing = true;
    }

    $scope.setPath = function() {
        $http.get('getpath.php').success(function(data) {
            $scope.projectpath = data + "/?id=" + $scope.id.substr(3);
        });
    }

    /**
     * Function: showAllAnnotations
     *
     * Adds .open to every tooltip so it will be visible
     */

    $scope.showAllAnnotations = function() {

        if ($scope.selectedAnnotation == -1) {

            $scope.showingAll = true;

        } else {
            return;
        }
    }

    $scope.showBrief = function() {
        $scope.project.brief = "Dear friend, \n\nI need your feedback on a couple of mockups I designed. Can you please go over it and let me know what you think?\n\n";
        $scope.editBrief = true;
        $timeout(function() {
            var theBrief = $("#theBrief")
            var strLength = theBrief.val().length;
            theBrief.focus();
            theBrief[0].setSelectionRange(strLength, strLength);
        }, 0);
    }

    $scope.showOverview = function() {
        $scope.overviewShowing = true;
    }

    /**
     * Function: setActive
     *
     * Expects an index that will be used to store the selected annotation
     */

    $scope.setActive = function(index) {
        if (!$scope.editing) {
            var a = $scope.project.images[$scope.currentIndex].annotations[$scope.selectedAnnotation];
            if (index == -1 && a) {
                if (a.comment === "") {
                    $scope.removeAnnotation(index);
                }
            }
            $scope.selectedAnnotation = index;

            // todo: is this necessary? Should be enought to remove it from the selected one?
            $timeout(function() {
                $scope.disableAnnotationTransition();
            });
        }
    }

    /**
     * Function: setId
     */

    $scope.setId = function(id) {

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

    $scope.setImage = function(index) {
        $scope.currentIndex = index;
        $scope.save();
        $scope.resize();
    };

    /**
     * Firebase sync
     */

    $scope.setupFirebase = function() {

        // todo: add $scope.images to firebase :)

        // // manage images
        // console.log("id" + $scope.id);

        var imageRef = new Firebase('https://feedbacktool.firebaseio.com/' + $scope.id);
        $scope.project = $firebase(imageRef);
        if (!$scope.project.images) $scope.project.images = [];

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
    }

    /**
     * Function: updateCursor
     */

    $scope.updateCursor = function(event) {
        if ($scope.cursorRef) $scope.cursorRef.set({
            "x": event.clientX,
            "y": event.clientY,
            "id": $scope.user.id
        });
    }

    /**
     * Initiates upload via factory
     */


    $scope.uploadFile = function(file, order) {
        uploadService.send(file, order, $scope.path);
    }


    /**
     * Resize handler
     * ///////////////////////////////////////////////////////////////// */


    window.onresize = onResize;

    function onResize() {

        var main = $("#main");
        scope = angular.element(main).scope();
        scope.$apply(function() {
            scope.width = $(window).width() / 2;
            scope.height = $(window).height() / 2;
        });
        var imgwrapper = $("#imgwrapper");
        var offset = main.height() / 2 - imgwrapper.height() / 2;
        if (offset < 0) offset = 0;
        imgwrapper.css("top", offset);
    }

    $scope.resize = function() {
        var main = $("#main");
        var imgwrapper = $("#imgwrapper");

        var offset = main.height() / 2 - imgwrapper.height() / 2;

        if (offset < 0) offset = 0;
        imgwrapper.css("top", offset);
    }
});

/**
 * Directives
 * ///////////////////////////////////////////////////////////////// */

feedbackApp.directive('annotation', ['$document',
    function($document) {
        return {
            link: function(scope, elm, attrs) {
                scope.$watch('[width, height, isFullscreen]', function() {

                    var startX = scope.annotation.x;
                    var startY = scope.annotation.y;

                    var parent = elm.parent().parent().find('img');

                    var w = parent.prop("width");
                    var h = parent.prop("height");

                    elm.css({
                        top: startY * h + 'px',
                        left: startX * w + 'px'
                    });

                    // disable animations after position was found
                    elm.bind('transitionend webkitTransitionEnd', function(e) {

                        elm.removeClass("animate");
                    });
                }, true)
            }
        };
    }
]);

// attaches load listener to annotatable element and fires an event so tooltips can be positioned properly

feedbackApp.directive('annotatable', ["$rootScope",
    function($rootScope, $timeout) {
        return {
            link: function(scope, element, attrs) {
                element.bind("load", function(event) {
                    scope.imageLoaded = true;
                    $rootScope.$emit("resize");
                    scope.$apply();

                });
            }
        }
    }
]);

feedbackApp.directive('ngFocus', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.ngFocus, function(val) {
                if (angular.isDefined(val) && val) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            }, true);

            element.bind('blur', function() {
                if (angular.isDefined(attrs.ngFocusLost)) {
                    scope.$apply(attrs.ngFocusLost);
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

feedbackApp.factory('uploadService', ['$rootScope',
    function($rootScope) {

        return {
            send: function(file, order, path) {
                var data = new FormData(),
                    xhr = new XMLHttpRequest();

                // When the request starts.
                xhr.onloadstart = function() {
                    $rootScope.$emit('upload:loadstart', xhr);
                };

                // When the request has failed.
                xhr.onerror = function(e) {
                    $rootScope.$emit('upload:error', e);
                };

                // Send to server, where we can then access it with $_FILES['file].
                data.append('file', file, file.name);

                data.append('path', path);
                xhr.open('POST', 'upload.php');
                xhr.send(data);

                xhr.onload = function(e) {
                    if (xhr.status === 200) {
                        $rootScope.$emit('upload:success', file, order);
                    } else {
                        console.log('Something went terribly wrong...');
                    }
                };
            }
        };

    }
]);

/**
 * Click to edit
 *
 * Source: http://icelab.com.au/articles/levelling-up-with-angularjs-building-a-reusable-click-to-edit-directive/
 */

feedbackApp.directive("clickToEdit", function() {
    var editorTemplate = '<div class="click-to-edit">' +
        '<div ng-hide="view.editorEnabled">' +
        '{{value}} ' +
        '<a href="#" class="edit icon" ng-click="enableEditor()">&#xf13a;</a>' +
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

            $scope.onKeypress = function(event) {
                $scope.value = $scope.view.editableValue;
                if (event.keyCode == 13) {
                    event.preventDefault();
                    $scope.save();

                }
            };

            $scope.enableEditor = function() {
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

feedbackApp.directive("filepicker", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {

            $(element).on("click", function() {
                scope.addOrder = attrs.order;
                $("#filepicker").trigger("click");
            });
        }
    }
});

/**
 * Uploader will trigger uploadFile() when items are added
 */

feedbackApp.directive("uploader", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {

            $(element).on("change", function(e) {
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

feedbackApp.directive("tooltip", ['$rootScope', '$timeout',
    function($rootScope) {
        return {
            restrict: "A",
            replace: false,
            templateUrl: "templates/tooltipTemplate.html",
            scope: {
                annotation: "=a",
                id: "=id",
                types: "=types",
                username: "=username"
            },
            link: function(scope, elem, attrs, controller)  {
                scope.focus = function() {
                    setTimeout(function() {
                        $(".open").find('textarea')[0].focus();
                        $(".open").find('input')[0].focus();

                        // scroll to the last comment

                        var elm = $(".open").find('.scroll-container');
                        elm.stop().animate({
                            scrollTop: $(".comment:last-of-type").prop("offsetTop")
                        }, "slow");

                    }, 1);
                }
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
                    $rootScope.$emit('tooltip:stopedit', $scope.id, $scope.annotation);
                };

                $scope.onKeypress = function(event) {
                    if (event.keyCode == 13) {
                        event.preventDefault();
                        $timeout(function() {
                            $scope.save();
                        });
                    } else if (event.keyCode == 27) {
                        $scope.revert();
                    }
                };

                $scope.reply = function() {
                    if ($scope.view.reply != "") {
                        var newreply = {
                            "text": $scope.view.reply,
                            "user": $scope.username,
                            "timestamp": new Date().getTime()
                        };

                        if ($scope.annotation.replies) {
                            $scope.annotation.replies.push(newreply);
                        } else {
                            $scope.annotation.replies = [];
                            $scope.annotation.replies.push(newreply);
                        }
                        $scope.view.reply = "";

                        $scope.save();
                        $scope.focus();
                    }
                }

                $scope.revert = function() {
                    $scope.annotation.comment = $scope.previousComment;
                    $scope.view.editorEnabled = false;
                    $rootScope.$emit('tooltip:stopedit', $scope.id);
                }

                $scope.onBlur = function(id) {
                    $rootScope.$emit('tooltip:blur', $scope.id);
                }

                $scope.remove = function() {
                    $rootScope.$emit('tooltip:remove', $scope.id);
                }

                $scope.save = function() {
                    // scope.setActive(-1);
                    $scope.disableEditor();
                };
            }
        };
    }
]);

/**
 * Custom comment type filter
 */

feedbackApp.filter('typeFilter', function() {
    return function(data, values) {
        var vs = [];
        angular.forEach(values, function(item) {
            if ( !! item.show) {
                vs.push(item.type);
            }
        });

        if (vs.length === 0) return data;

        var result = [];
        angular.forEach(data, function(item) {
            if (vs.indexOf(item.type) >= 0) {
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


feedbackApp.directive('cursor', ['$document',
    function($document) {
        return {
            link: function(scope, elm, attrs) {
                scope.$watch('cursor', function() {

                    var startX = scope.cursor.x;
                    var startY = scope.cursor.y;

                    elm.css({
                        top: startY + 'px',
                        left: startX + 'px'
                    });
                });
            }
        };
    }
]);


/**
 *	Directive selectedScroll
 *
 *	Will scroll the element to the top position of the selected element in the sidebar
 */


feedbackApp.directive('selectedscroll', ['$document', '$timeout',
    function($document, $timeout) {
        return {
            link: function(scope, elm, attrs) {
                scope.$watch('currentIndex', function() {
                    $timeout(function() {
                        elm.stop().animate({
                            scrollTop: $(".selected").prop("offsetTop")
                        }, "slow");
                    });

                    scope.overviewShowing = true;
                });
            }
        };
    }
]);

/**
 *	Directive fullscreen
 *
 *	Will scroll the element to the top position of the selected element in the sidebar
 */


feedbackApp.directive('fullscreen', ['$document', '$timeout', '$rootScope',
    function($document, $timeout, $rootScope) {
        return {
            link: function(scope, elm, attrs) {
                scope.$watch('isFullscreen', function() {

                    // hide header, right sidebar
                    if (scope.isFullscreen) {
                        $("header").addClass("fs");
                        $(".feedback-container").addClass("fs");
                        $("#main").addClass("fullscreen");
                        $("#wrap").addClass("fullscreen");
                        $("#imgwrapper").addClass("fullscreen");
                    } else {
                        $("header").removeClass("fs");
                        $(".feedback-container").removeClass("fs");
                        $("#main").removeClass("fullscreen");
                        $("#wrap").removeClass("fullscreen");
                        $("#imgwrapper").removeClass("fullscreen");
                    }
                });
            }
        };
    }
]);