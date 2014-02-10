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
                username: '='
            },

            link: function(scope, iElement, iAttrs) {
                scope.focus = function() {
                    setTimeout(function() {
                        console.log(iElement)
                        iElement.find('input')[0].focus();

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
                    reply: ""
                };

                $scope.reply = function(comment) {
                    console.log($scope.thread);
                    if ($scope.view.reply != "") {
                        var newreply = {
                            "text": $scope.view.reply,
                            "user": $scope.username,
                            "timestamp": new Date().getTime()
                        };

                        if (comment.replies) {
                            comment.replies.push(newreply);
                        } else {
                            comment.replies = [];
                            comment.replies.push(newreply);
                        }
                        $scope.view.reply = "";
                        $scope.save();
                        $scope.focus();
                    }
                },

                $scope.save = function () {
                    $rootScope.$emit("comment:added", $scope.id, $scope.view.reply);
                }
            }
        };
    }
]);