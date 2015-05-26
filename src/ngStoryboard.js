var storyboardModule = angular.module('storyboard', ['storyboard-templates', 'jqrange-slider',
    'gridster', 'duScroll']);

storyboardModule.directive('storyboard', function() {

    return {
        restrict: 'E',
        require: ['storyboardEvents', 'storyboardEventTemplate'],

        scope: {
            storyboardEvents: '=',
            storyboardEventTemplate: '=',
            smallStoryboardEventTemplate: '='
        },
        templateUrl: 'storyboard-template.html',
        controller: ['$scope', function($scope) {

            $scope.storyboardData = {};

        }],
        link: function(scope, iElement, iAttrs, ctrl) {
            scope.$watch('iAttrs.storyboardEvents', function() {

            });
            scope.$watch('iAttrs.storyboardEventTemplate', function() {
                scope.storyboardItemTemplate = iAttrs.storyboardEventTemplate;
            });
            scope.$watch('iAttrs.smallStoryboardEventTemplate', function() {
                scope.smallStoryboardItemTemplate = iAttrs.smallStoryboardEventTemplate;
            });

        }
    }
});

storyboardModule.directive('storyboardEvents', function() {
    return {
        controller: function($scope) {}
    }
});

storyboardModule.directive('storyboardEventTemplate', function() {
    return {
        controller: function($scope) {}
    }
});
