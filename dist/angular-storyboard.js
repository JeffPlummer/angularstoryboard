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
;angular.module('storyboard').controller('storyboardCtrl', function($scope) {

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


});;angular.module('storyboard').controller('sliderCtrl', function($scope) {

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
        $scope.timelineSliderOptions.jqOptions.bounds.min = $scope.storyboardData.minDate;
        $scope.timelineSliderOptions.jqOptions.bounds.max = $scope.storyboardData.maxDate;
        $scope.timelineSliderOptions.selectedRange.min = $scope.storyboardData.minViewDate;
        $scope.timelineSliderOptions.selectedRange.max = $scope.storyboardData.maxViewDate;
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
});;angular.module('storyboard').controller('gridCtrl', function($scope, $document) {

    $scope.gridWidth = 0;
    $scope.gridCellHeight = 180;
    $scope.data = {
        storylines: []
    };

    $scope.gridEvents = [];

    $scope.initializeStorylines = function() {
        createStoryboardStorylines();
        initializeEventGrid();
    };

    //Storylines
    $scope.createArray = function(num) {
        return new Array(num);
    };

    var createStoryboardStorylines = function() {
        var storylinesHashObject = {};

        //Create storylines hash object
        for(var i=0; i<$scope.storyboardEvents.length; i++) {
            var event = $scope.storyboardEvents[i];
            var storylineName = (event.storyline)?event.storyline : "_undefined";

            //If no hash entry exists for storyline, create one
            if(!storylinesHashObject.hasOwnProperty(storylineName)) {
                storylinesHashObject[storylineName] = {overlapDepth: 0, events: []}
            }

            //Add to storylines hash object
            storylinesHashObject[storylineName].overlapDepth = Math.max(storylinesHashObject[storylineName].overlapDepth,
                getOverlapDepth(event, storylinesHashObject[storylineName].events ));
            storylinesHashObject[storylineName].events.push(event);
        }

        //Crate array from hash object
        for (var prop in storylinesHashObject) {
            $scope.data.storylines.push({name: prop, overlapDepth: storylinesHashObject[prop].overlapDepth,
            events: storylinesHashObject[prop].events})
        }
    };

    var getOverlapDepth = function(event, eventlist) {
        var overlap = 0;
        for(var j=0; j<eventlist.length; j++) {
            var e2 = eventlist[j];
            if( (event != e2) && (event.startDate >= e2.startDate) && (event.startDate <= e2.endDate) ) {
                overlap++;
            }
        }
        return overlap;
    };


    //Gridstar Setup
    var initializeEventGrid = function() {
        createGridDimensions();
        createGridEventObjects();
        viewBoundsChanged();
    };

    $scope.gridsterOpts = {
        minRows: 1, // the minimum height of the grid, in rows
        maxRows: 100,
        maxSizeY: 1,
        minSizeX: 1,
        width:0,
        pushing: false,
        floating: false,
        swapping: false,
        columns: 2, // the width of the grid, in columns
        colWidth: 100, // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: 180, // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [35, 10], // the pixel distance between each widget
        defaultSizeX: 1, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        resizable: {
            enabled: true,
            start: function(event, uiWidget, $element) {}, // optional callback fired when resize is started,
            resize: function(event, uiWidget, $element) {}, // optional callback fired when item is resized,
            stop: function(event, uiWidget, $element) {onElementResized($element);} // optional callback fired when item is finished resizing
        },
        draggable: {
            enabled: true, // whether dragging items is supported
            handle: '.my-class', // optional selector for resize handle
            start: function(event, uiWidget, $element) {}, // optional callback fired when drag is started,
            drag: function(event, uiWidget, $element) {}, // optional callback fired when item is moved,
            stop: function(event, uiWidget, $element) {
                onElementMoved($element);
            } // optional callback fired when item is finished dragging
        }
    };

    var onElementResized = function(changedElement) {

    };

    var onElementMoved = function(changedElement) {
        var newRow = changedElement.row;
        var newCol = changedElement.col;

        //Adjust event storyline
        changedElement.event.storyline = $scope.data.storylines[newRow].name;

        //Adjust startDate / EndDate

    };

    var createGridDimensions = function() {
        //Columns should be 1 for every 4 hours.
        var numBlocks = Math.floor($scope.storyboardData.maxDate.differenceInHours($scope.storyboardData.minDate ) / 4);
        $scope.gridsterOpts.columns = numBlocks;

        //Set column width based on view width
        $scope.gridsterOpts.colWidth = 100;

        $scope.gridWidth = $scope.gridsterOpts.columns * $scope.gridsterOpts.colWidth;
        $scope.gridsterOpts.width = $scope.gridWidth;

        console.log("columns = " + $scope.gridsterOpts.columns);
        console.log("grid width = " + $scope.gridWidth);
    };

    var createGridEventObjects = function() {
        var len = $scope.data.storylines.length;
        var rowsPlusOverlap = 0;
        for (var i = 0; i < len; i++) {
            var events = $scope.data.storylines[i].events;
            for(var j=0; j<events.length; j++) {
                var obj = {};
                obj.event = events[j];
                obj.sizeX = calcNumColumnsBetweenStartAndEnd(obj.event.startDate, obj.event.endDate);
                obj.sizeY = 1;
                obj.dragEnabled = false;
                obj.row = rowsPlusOverlap;
                obj.col = calcStartColumn(obj.event.startDate);
                $scope.gridEvents.push(obj);

                console.log(obj);
            }
            rowsPlusOverlap += $scope.data.storylines[i].overlapDepth +1;
        }
        $scope.gridsterOpts.maxRows = rowsPlusOverlap;
    };

    var calcNumColumnsBetweenStartAndEnd = function(startDate, endDate) {
        return Math.floor(endDate.differenceInHours(startDate) / 4);
    };

    var calcStartColumn = function(startdate) {
        return Math.floor(( startdate.differenceInHours($scope.storyboardData.minDate)) / 4);
    };

    var viewBoundsChanged = function() {
        //TODO: Only update if it wasn't a grid scroll
        if($scope.sliderMouseDown) {
            //Update column width based on view
            var viewHours = $scope.storyboardData.maxViewDate.differenceInHours($scope.storyboardData.minViewDate);
            var elementWidth = document.getElementById('storyboardGridContainer').clientWidth;
            var colWidth = elementWidth/Math.floor(viewHours/4);
            $scope.gridsterOpts.colWidth = colWidth;

            //Update scroll position
            $scope.gridWidth = $scope.gridsterOpts.columns * $scope.gridsterOpts.colWidth;
            var totalHours = $scope.storyboardData.maxDate.differenceInHours($scope.storyboardData.minDate);
            var viewStart = $scope.storyboardData.minViewDate.differenceInHours($scope.storyboardData.minDate);

            var gridElement = angular.element(document.getElementById('storyboardGridContainer'));
            var xScroll = (viewStart / totalHours)*$scope.gridWidth;

            gridElement.scrollLeft(xScroll);
        }
    };
    var throttledViewBoundsChanged = _.throttle(viewBoundsChanged, 5);
    $scope.$watch('storyboardData.minViewDate', throttledViewBoundsChanged);
    $scope.$watch('storyboardData.maxViewDate', throttledViewBoundsChanged);


    $scope.formatDate = function(date) {
        return moment(date).format('MMM Do YYYY, h:mm:ss a');
    };

    $scope.showGridEventInView = function(gridEvent) {
        if( (gridEvent.sizeX * $scope.gridsterOpts.colWidth) < 100) {
            return false;
        }
        return true;
    };


    var angGrid = angular.element(document.getElementById('storyboardGridContainer'));
    angGrid.on('scroll', function() {
        debounceHandleScroll();
    });

    var handleScroll = function() {
        if(!$scope.sliderMouseDown) {
            var container = document.getElementById('storyboardGrid');
            var width = container.clientWidth;
            var scrollPos = angGrid.scrollLeft();
            var percentScroll = scrollPos / width;
            var rangeInHours = $scope.storyboardData.maxDate.differenceInHours($scope.storyboardData.minDate);
            var hoursToAdd = percentScroll * rangeInHours;
            var viewRangeInHours = $scope.storyboardData.maxViewDate.differenceInHours($scope.storyboardData.minViewDate);

            //Update min view date
            var newMinViewDate = new Date($scope.storyboardData.minDate);
            newMinViewDate.addHours(hoursToAdd);

            //Update max view date
            var newMaxViewDate = new Date($scope.storyboardData.minDate);
            newMaxViewDate.addHours(viewRangeInHours + hoursToAdd);

            if ((newMinViewDate.getTime() != $scope.storyboardData.minViewDate.getTime()) ||
                (newMaxViewDate.getTime() != $scope.storyboardData.maxViewDate.getTime())) {
                $scope.storyboardData.minViewDate = newMinViewDate;
                $scope.storyboardData.maxViewDate = newMaxViewDate;
                $scope.$apply();
            }
        }
    };
    var debounceHandleScroll = _.debounce(handleScroll, 1);




});



;angular.module('storyboard-templates', ['storyboard-template.html']);

angular.module("storyboard-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("storyboard-template.html",
    "<div ng-controller=\"storyboardCtrl\" ng-init=\"initializeStoryboard()\">\n" +
    "    <!-- Timeline Slider -->\n" +
    "    <div ng-controller=\"sliderCtrl\" ng-init=\"initializeSlider()\">\n" +
    "        <div  style=\"width: 100%; padding-bottom: 4px;\" >\n" +
    "        <jqrange-slider id=\"jqSlider\" options=\"timelineSliderOptions\"></jqrange-slider>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- story lines -->\n" +
    "    <div ng-controller=\"gridCtrl\" ng-init=\"initializeStorylines()\" style=\"background-color: green; position: relative;\">\n" +
    "\n" +
    "        <!-- Lines -->\n" +
    "        <div>\n" +
    "            <table class=\"storyboard_table\" ng-repeat=\"storyline in data.storylines\">\n" +
    "                <tr class=\"storyboard_tr\">\n" +
    "                    <th class=\"storyboard_th\">{{storyline.name}}</th>\n" +
    "                </tr>\n" +
    "                <tr class=\"storyboard_tr\" ng-repeat=\"row in createArray(storyline.overlapDepth)\" >\n" +
    "                </tr>\n" +
    "            </table>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Grid -->\n" +
    "        <div id=\"storyboardGridContainer\" style=\"width: 100%; overflow-x: auto; position: absolute; top:0px; left: 0px; \">\n" +
    "            <div id=\"storyboardGrid\" gridster=\"gridsterOpts\" ng-style=\"{width: gridWidth}\">\n" +
    "                <ul>\n" +
    "                    <li  gridster-item=\"item\" ng-repeat=\"item in gridEvents\">\n" +
    "                        <div ng-if=\"showGridEventInView(item)\" class=\"eventStoryboardItem\">\n" +
    "                            <div ng-include=\"storyboardItemTemplate\"></div>\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"!showGridEventInView(item)\">\n" +
    "                            <div ng-include=\"smallStoryboardItemTemplate\"></div>\n" +
    "                        </div>\n" +
    "\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);
;var ONE_HOUR_IN_MILLIS = 60*60*1000;
var ONE_DAY_IN_MILLIS = 24*60*60*1000; // hours*minutes*seconds*milliseconds

Date.prototype.differenceInDays = function(obj) {
    var diffDays = Math.round(Math.abs((this.getTime() - obj.getTime())/(ONE_DAY_IN_MILLIS)));
    return diffDays;
};

Date.prototype.differenceInHours = function(obj) {
    var diffHours = Math.round(Math.abs((this.getTime() - obj.getTime())/(ONE_HOUR_IN_MILLIS)));
    return diffHours;
};

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}