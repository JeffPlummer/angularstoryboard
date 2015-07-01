angular.module('storyboard').controller('sliderCtrl', function($scope) {

    $scope.timelineSliderOptions = {
        type: "date",
        jqOptions: {
            bounds: {
            },
            formatter: function(value){
                return moment(value).format('LLL')
            },
            range:{
                min: {hours: 4}
            },
            step:{
                hours: 4
            }
        },
        selectedRange: {
        }
    };

    $scope.initializeSlider = function() {
        createTimelineSliderData();
    };


    var createTimelineSliderData = function() {
        console.log("createTimelineSliderData");
        $scope.timelineSliderOptions.jqOptions.bounds = {min: $scope.storyboardData.minDate, max: $scope.storyboardData.maxDate};
        $scope.timelineSliderOptions.selectedRange = { min: $scope.storyboardData.minViewDate, max: $scope.storyboardData.maxViewDate }
        //$scope.$apply();
    };

    //Update variables from slider action
    var angSlider = angular.element(document.getElementById('jqSlider'));
    angSlider.bind("valuesChanging", function(evt, data) {
        $scope.storyboardData.minViewDate = data.values.min;
        $scope.storyboardData.maxViewDate = data.values.max;
        $scope.$apply();
    });


    var sliderChanged = function() {
        $scope.storyboardData.minViewDate = $scope.timelineSliderOptions.selectedRange.min;
        $scope.storyboardData.maxViewDate = $scope.timelineSliderOptions.selectedRange.max;
        $scope.$apply();
    };
    var debounceSliderChanged = _.debounce(sliderChanged, 10);

    $scope.$watch('timelineSliderOptions.selectedRange.min', debounceSliderChanged);
    $scope.$watch('timelineSliderOptions.selectedRange.max', debounceSliderChanged);


    var updateFromScroll = function() {
        if(!$scope.sliderMouseDown) {
            $scope.timelineSliderOptions.selectedRange = {
                min: $scope.storyboardData.minViewDate,
                max: $scope.storyboardData.maxViewDate
            };

            $scope.$apply();
        }
    };
    var debounceUpdateFromScroll = _.debounce(updateFromScroll, 2);
    $scope.$watch('storyboardData.minViewDate', debounceUpdateFromScroll);
    $scope.$watch('storyboardData.maxViewDate', debounceUpdateFromScroll);

    $scope.$watch('storyboardData.minDate',createTimelineSliderData);


    $scope.$on('recalculateStoryboard', function() {
        //console.log("***** slider recalculating");
        $scope.initializeSlider()
    });
});