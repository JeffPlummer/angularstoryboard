angular.module('storyboard').controller('storyboardCtrl', function($scope) {

    $scope.storyboardData = {
        minDate: null,
        maxDate: null,
        minViewDate: null,
        maxViewDate: null,
        storylines : [],
        gridEvents:[]
    };

    $scope.initializeStoryboard = function() {
        initMinMaxDates();
        //$scope.$broadcast('recalculateStoryboard');
    };


    var initMinMaxDates = function() {
        var len = $scope.options.storyboardEvents.length;
        if (len >0) {
            for (var i = 0; i < len; i++) {
                var event = $scope.options.storyboardEvents[i];
                event.startDate.setMinutes(0,0,0);
                event.endDate.setMinutes(0,0,0);

                if (i == 0) {
                    $scope.storyboardData.minDate = new Date($scope.options.storyboardEvents[i].startDate);
                    $scope.storyboardData.maxDate = new Date($scope.options.storyboardEvents[i].startDate);
                }

                if (new Date($scope.options.storyboardEvents[i].startDate) < $scope.storyboardData.minDate) {
                    $scope.storyboardData.minDate = new Date($scope.options.storyboardEvents[i].startDate);
                }
                if (new Date($scope.options.storyboardEvents[i].endDate) > $scope.storyboardData.maxDate) {
                    $scope.storyboardData.maxDate = new Date($scope.options.storyboardEvents[i].endDate);
                }
            }
        }
        else {
            $scope.storyboardData.minDate = new Date().addHours(24*-2);
            $scope.storyboardData.maxDate = new Date().addHours(24*2);
        }

        //Add a couple days to before and after to give some room
        $scope.storyboardData.minDate.setDate($scope.storyboardData.minDate.getDate()-2);
        $scope.storyboardData.maxDate.setDate($scope.storyboardData.maxDate.getDate() + 2);

        //Set default view range
        if ( ($scope.storyboardData.minViewDate == null) ||
            ($scope.storyboardData.minViewDate < $scope.storyboardData.minDate) ||
            ($scope.storyboardData.maxViewDate > $scope.storyboardData.maxDate)
        ){
            $scope.storyboardData.minViewDate = new Date($scope.storyboardData.minDate);
            $scope.storyboardData.maxViewDate = new Date(
                ($scope.storyboardData.maxDate - $scope.storyboardData.minDate) / 5 + $scope.storyboardData.minDate.getTime() + 1000000);
        }

        //console.log("minDate = " + $scope.storyboardData.minDate);
        //console.log("maxDate = " + $scope.storyboardData.maxDate);
        //console.log("minViewDate = " + $scope.storyboardData.minViewDate);
        //console.log("maxViewDate = " + $scope.storyboardData.maxViewDate);
    };

    $scope.sliderMouseDown = false;
    var angSlider = angular.element(document.getElementById('jqSlider'));
    angSlider.bind("mousestart", function(evt, data) {
        $scope.sliderMouseDown = true;
    });

    angSlider.bind("stop", function(evt, data) {
        $scope.sliderMouseDown = false;
    });

    $scope.$on('triggerRecalculateStoryboard', function() {
        //console.log("**************** TRIGGER RE_CALCULATE **************");;
        $scope.initializeStoryboard();
        $scope.$broadcast('recalculateStoryboard');
    });


});