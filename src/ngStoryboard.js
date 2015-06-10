var storyboardModule = angular.module('storyboard', ['storyboard-templates', 'jqrange-slider',
    'gridster', 'duScroll']);

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
