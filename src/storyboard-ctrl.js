angular.module('storyboard').controller('storyboardCtrl', function($scope) {

    $scope.storyboardData = {
        minDate: null,
        maxDate: null,
        minViewDate: null,
        maxViewDate: null
    };

    $scope.initializeStoryboard = function() {
        initMinMaxDates();
    };

    var initMinMaxDates = function() {
        var len = $scope.storyboardEvents.length;
        for (var i = 0; i < len; i++) {
            if(i==0) {
                $scope.storyboardData.minDate = new Date($scope.storyboardEvents[i].startDate);
                $scope.storyboardData.maxDate = new Date($scope.storyboardEvents[i].startDate);
            }

            if(new Date($scope.storyboardEvents[i].startDate) < $scope.storyboardData.minDate) {
                $scope.storyboardData.minDate = new Date($scope.storyboardEvents[i].startDate);
            }
            if(new Date($scope.storyboardEvents[i].endDate) > $scope.storyboardData.maxDate) {
                $scope.storyboardData.maxDate = new Date($scope.storyboardEvents[i].endDate);
            }
        }

        //Add a couple days to before and after to give some room
        $scope.storyboardData.minDate.setDate($scope.storyboardData.minDate.getDate()-2);
        $scope.storyboardData.maxDate.setDate($scope.storyboardData.maxDate.getDate() + 2);

        //Set default view range
        $scope.storyboardData.minViewDate = new Date($scope.storyboardData.minDate);
        $scope.storyboardData.maxViewDate  =  new Date(
            ($scope.storyboardData.maxDate - $scope.storyboardData.minDate)/5 +  $scope.storyboardData.minDate.getTime() + 1000000);


        console.log("minDate = " + $scope.storyboardData.minDate);
        console.log("maxDate = " + $scope.storyboardData.maxDate);
    };

    $scope.sliderMouseDown = false;
    var angSlider = angular.element(document.getElementById('jqSlider'));
    angSlider.bind("mousestart", function(evt, data) {
        $scope.sliderMouseDown = true;
    });

    angSlider.bind("stop", function(evt, data) {
        $scope.sliderMouseDown = false;
    });


});