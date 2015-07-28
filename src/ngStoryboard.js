var storyboardModule = angular.module('storyboard', ['storyboard-templates', 'jqrange-slider',
    'gridster', 'duScroll', 'ui.sortable']);

storyboardModule.directive('storyboard', function() {

    return {
        restrict: 'E',
        require: ['options'],
        scope: {
            options: '='
        },
        templateUrl: 'storyboard-template.html',
        controller: ['$scope', function($scope) {
            $scope.storyboardData = {};
        }],
        link: function(scope, iElement, iAttrs, ctrl) {
            scope.$watch('iAttrs.options.storyboardEvents', function() {
                //scope.storyboardEvents = iAttrs.options.storyboardEvents;
            });
            scope.$watch('iAttrs.options.storyboardEventTemplate', function() {
               // scope.storyboardItemTemplate = iAttrs.options.storyboardEventTemplate;
            });
            scope.$watch('iAttrs.options.smallStoryboardEventTemplate', function() {
                //scope.smallStoryboardItemTemplate = iAttrs.options.smallStoryboardEventTemplate;
            });

            scope.renderStoryboard = function() {
                $scope.$broadcast('triggerRecalculateStoryboard');
            };

            scope.displayOnce = false;
            scope.$watch(function() { return elem.is(':visible') }, function() {
                var visible = elem.is(":visible");
                if(visible){
                    if(!scope.displayOnce) {
                        scope.displayOnce = true;
                        //elem.empty();
                        scope.renderStoryboard();
                    }
                }
            });

        }
    }
});

storyboardModule.directive('options', function() {
    return {
        controller: function($scope) {}
    }
});
//
//storyboardModule.directive('storyboardEventTemplate', function() {
//    return {
//        controller: function($scope) {}
//    }
//});
