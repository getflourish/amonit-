/**
 *  Module Comments
 *
 *  Generates a list of comment threads based on the input @comment-data
 */
angular.module('goover.comments', []).
directive('comments', [
    function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/commentsTemplate.html',
            replace: false,
            scope: {
                comments: '=commentsData',
                username: '='
            },

            link: function(scope, iElement, iAttrs) {
            }
        };
    }
]).directive('thread', [
    function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/commentThreadTemplate.html',
            replace: false,
            scope: {
                thread: '=threadData',
                scroll: '=',
                id: '=id',
                username: '=',
                index: '=index'
            },

            link: function(scope, element, iAttrs) {
                scope.focus = function() {
                    setTimeout(function() {
                        element.find('input')[0].focus();

                        // scroll to the last comment

                        var elm = $(".open").find('.scroll-container');
                        elm.stop().animate({
                            scrollTop: elm.find(".comment:last-of-type").prop("offsetTop")
                        }, "slow");

                    }, 1);
                }
            },
            controller: function($rootScope, $scope, $timeout) {
                $scope.view = {
                    reply: "",
                    replyObject: {}
                }

                $scope.select = function (id) {
                    $rootScope.$emit("comment:select", id);
                }

                $scope.removeReply = function (id) {
                    $rootScope.$emit("comment:remove", $scope.id);
                }

                $scope.reply = function(comment) {
                    console.log($scope.thread);
                    if ($scope.view.reply != "") {
                        $scope.view.replyObject = {
                            "text": $scope.view.reply,
                            "user": $scope.username,
                            "timestamp": new Date().getTime()
                        };
                        $scope.save();
                        $scope.view.reply = "";
                        $scope.focus();
                    }
                },

                $scope.save = function () {
                    $rootScope.$emit("comment:added", $scope.id, $scope.view.replyObject);
                }
            }
        };
    }
]);