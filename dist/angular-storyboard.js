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
;angular.module('storyboard').controller('storyboardCtrl', function($scope) {

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
    };



    var initMinMaxDates = function() {
        var len = $scope.options.storyboardEvents.length;
        if (len >0) {
            for (var i = 0; i < len; i++) {
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
        if($scope.storyboardData.minViewDate == null) {
            $scope.storyboardData.minViewDate = new Date($scope.storyboardData.minDate);
            $scope.storyboardData.maxViewDate = new Date(
                ($scope.storyboardData.maxDate - $scope.storyboardData.minDate) / 5 + $scope.storyboardData.minDate.getTime() + 1000000);
        }

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

    $scope.$on('recalculateStoryboard', initMinMaxDates);







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
        console.log("createTimelineSliderData")
        $scope.timelineSliderOptions.jqOptions.bounds = {min: $scope.storyboardData.minDate, max: $scope.storyboardData.maxDate};
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

    $scope.$watch('storyboardData.minDate',createTimelineSliderData);
});;angular.module('storyboard').controller('gridCtrl', function($scope, $document) {

    $scope.gridWidth = 0;
    $scope.renameStorylines = false;

    $scope.initializeStorylines = function() {
        createStoryboardStorylines();
        initializeEventGrid();
        updateGridBounds();
    };

    //Storylines
    $scope.createArray = function(num) {
        return new Array(num);
    };

    var createStoryboardStorylines = function() {
        $scope.storyboardData.storylines = [];
        var storylinesHashObject = {};

        //Create storylines hash object
        for(var i=0; i<$scope.options.storyboardEvents.length; i++) {
            var event = $scope.options.storyboardEvents[i];
            event.startDate = new Date(event.startDate);
            event.endDate = new Date(event.endDate);
            var storylineName = (event.storylineName)?event.storylineName : "_undefined";

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
            if(prop != "_undefined") { //Do undefined last
                $scope.storyboardData.storylines.push(prop);
            }
        }
        if(storylinesHashObject._undefined) {
            $scope.storyboardData.storylines.push("_undefined");
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
        changedElement.event.endDate = calcDateFromColumn(changedElement.col+changedElement.sizeX);
        $scope.$emit("storyboardItemResized", changedElement.event);
    };

    var onElementMoved = function(changedElement) {
        var numHours = changedElement.event.endDate.differenceInHours(changedElement.event.startDate);

        var newRow = changedElement.row;
        var newCol = changedElement.col;

        //Adjust event storyline
        changedElement.event.storylineName = $scope.storyboardData.storylines[newRow];

        //Adjust startDate / EndDate
        changedElement.event.startDate = calcDateFromColumn(newCol);
        changedElement.event.endDate = calcDateFromColumn(newCol+changedElement.sizeX);

        //If column is near first or last, need to re-adjust min/max dates of storyboard as a whole
        if(eventAffectsMinMaxDates(changedElement)) {
            $scope.$emit('recalculateStoryboard');
            $scope.initializeStorylines();
        }

        $scope.$emit("storyboardItemMoved", changedElement.event);
    };

    var eventAffectsMinMaxDates = function(item) {
        var affects = false;
        if( ($scope.options.extendBeyondInHours) && ($scope.options.extendBeyondInHours > 0) ) {
            if ( ($scope.options.gridSizeInHours*item.col < $scope.options.extendBeyondInHours) ||
                ( ($scope.gridsterOpts.columns - item.col) < $scope.options.extendBeyondInHours) ) {
                affects = true;
            }
        }

        return affects;
    };

    var createGridDimensions = function() {
        //Columns should be 1 for every 4 hours.
        var numBlocks = Math.floor($scope.storyboardData.maxDate.differenceInHours($scope.storyboardData.minDate ) / $scope.options.gridSizeInHours);
        $scope.gridsterOpts.columns = numBlocks;

        //Set column width based on view width
        $scope.gridsterOpts.colWidth = 100;

        $scope.gridWidth = $scope.gridsterOpts.columns * $scope.gridsterOpts.colWidth;
        $scope.gridsterOpts.width = $scope.gridWidth;

        console.log("columns = " + $scope.gridsterOpts.columns);
        console.log("grid width = " + $scope.gridWidth);
    };

    var createGridEventObjects = function() {
        $scope.storyboardData.gridEvents = [];
        for(var i=0; i<$scope.options.storyboardEvents.length; i++) {
            addGridItemForEvent($scope.options.storyboardEvents[i]);
        }
    };

    var addGridItemForEvent = function(event) {
        var obj = {};
        obj.event = event;
        obj.sizeX = calcNumColumnsBetweenStartAndEnd(obj.event.startDate, obj.event.endDate);
        obj.sizeY = 1;
        obj.dragEnabled = false;
        obj.row = (event.storylineName)?$scope.storyboardData.storylines.indexOf(event.storylineName):$scope.storyboardData.storylines.indexOf("_undefined");
        obj.col = calcStartColumn(obj.event.startDate);
        $scope.storyboardData.gridEvents.push(obj);
    };

    var calcNumColumnsBetweenStartAndEnd = function(startDate, endDate) {
        return Math.floor(endDate.differenceInHours(startDate) / $scope.options.gridSizeInHours);
    };

    var calcStartColumn = function(startdate) {
        return Math.floor(( startdate.differenceInHours($scope.storyboardData.minDate)) / $scope.options.gridSizeInHours);
    };

    var calcDateFromColumn = function(column) {
        var d = new Date();
        d.setTime($scope.storyboardData.minDate.getTime());
        d.addHours($scope.options.gridSizeInHours*column);
        return d;
    };

    var updateGridBounds = function() {
        //Update column width based on view
        var viewHours = $scope.storyboardData.maxViewDate.differenceInHours($scope.storyboardData.minViewDate);
        var elementWidth = document.getElementById('storyboardGridContainer').clientWidth;
        var colWidth = elementWidth/Math.floor(viewHours/$scope.options.gridSizeInHours);
        $scope.gridsterOpts.colWidth = colWidth;

        //Update scroll position
        $scope.gridWidth = $scope.gridsterOpts.columns * $scope.gridsterOpts.colWidth;
        var totalHours = $scope.storyboardData.maxDate.differenceInHours($scope.storyboardData.minDate);
        var viewStart = $scope.storyboardData.minViewDate.differenceInHours($scope.storyboardData.minDate);

        var gridElement = angular.element(document.getElementById('storyboardGridContainer'));
        var xScroll = (viewStart / totalHours)*$scope.gridWidth;

        gridElement.scrollLeft(xScroll);
    };
    var viewBoundsChanged = function() {
        //TODO: Only update if it wasn't a grid scroll
        if($scope.sliderMouseDown) {
            updateGridBounds();
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


    $scope.doubleClick = function(clickevent) {
        var grid = document.getElementById('storyboardGrid');
        var row = Math.floor(clickevent.offsetY / 180);
        var col = Math.floor(clickevent.offsetX / ($scope.gridsterOpts.colWidth));

        //Create new event
        var newEvent = {
            startDate: calcDateFromColumn(col),
            endDate: calcDateFromColumn(col+1),
            title: "new event",
            storylineName: $scope.storyboardData.storylines[row]
        };


        //Add to list of events
        $scope.options.storyboardEvents.push(newEvent);

        //Add storyboard item for event
        addGridItemForEvent(newEvent, row);
    };

    $scope.updateStorylineName = function(oldStorylineName, newStorylineName) {
        for(var i=0; i<$scope.options.storyboardEvents.length; i++) {
            var event = $scope.options.storyboardEvents[i];

            if(event.storylineName == oldStorylineName) {
                event.storylineName = newStorylineName;
            }
        }

        $scope.$emit("storylineChanged", oldStorylineName, newStorylineName);

        return true;
    };




    var onInputStoryboardEventsChanged = function(oldValue, newValue) {
        if($scope.options.storyboardEvents.length != $scope.storyboardData.gridEvents.length) {
            console.log("Different");
            initializeStorylines();
        }
        else {
            console.log("Same");
        }
    };
    $scope.$watchCollection('options.storyboardEvents', onInputStoryboardEventsChanged);

});



;angular.module('storyboard-templates', ['storyboard-template.html']);

angular.module("storyboard-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("storyboard-template.html",
    "<div ng-controller=\"storyboardCtrl\" ng-init=\"initializeStoryboard()\">\n" +
    "    <!-- Timeline Slider -->\n" +
    "    <div ng-controller=\"sliderCtrl\" ng-init=\"initializeSlider()\">\n" +
    "        <div style=\"width: 100%; padding-bottom: 4px;\" >\n" +
    "        <jqrange-slider id=\"jqSlider\" options=\"timelineSliderOptions\"></jqrange-slider>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- story lines -->\n" +
    "    <div ng-controller=\"gridCtrl\" ng-init=\"initializeStorylines()\" >\n" +
    "        <div style=\"position: relative;\">\n" +
    "\n" +
    "            <!-- Grid -->\n" +
    "            <div id=\"storyboardGridContainer\" style=\"z-index: 10; width: 100%; overflow-x: auto; \">\n" +
    "                <div id=\"storyboardGrid\" gridster=\"gridsterOpts\" ng-style=\"{width: gridWidth}\" ng-dblClick=\"doubleClick($event)\">\n" +
    "                    <ul>\n" +
    "                        <li gridster-item=\"item\" ng-repeat=\"item in storyboardData.gridEvents\">\n" +
    "                            <div ng-if=\"showGridEventInView(item)\" class=\"eventStoryboardItem\">\n" +
    "                                <div ng-include=\"options.storyboardItemTemplate\"></div>\n" +
    "                            </div>\n" +
    "                            <div ng-if=\"!showGridEventInView(item)\">\n" +
    "                                <div ng-include=\"options.smallStoryboardItemTemplate\"></div>\n" +
    "                            </div>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- Lines -->\n" +
    "            <div class=\"storyboard_table_container\" style=\"z-index: 1; width: 100%; overflow-x: auto; position: absolute; top:0px; left: 0px; pointer-events: none;\">\n" +
    "                <table class=\"storyboard_table\" ng-repeat=\"storyline in storyboardData.storylines\">\n" +
    "                    <tr class=\"storyboard_tr\">\n" +
    "                        <th class=\"storyboard_th\">\n" +
    "                            <span style=\"z-index: 100; pointer-events: auto;\">\n" +
    "                               <a href=\"#\" editable-text=\"storyline\" onbeforesave=\"updateStorylineName(storyline, $data)\">{{ storyline || 'empty' }}</a>\n" +
    "                            </span>\n" +
    "                        </th>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <button>Add New Storylineee</button>\n" +
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