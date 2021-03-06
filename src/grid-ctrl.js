angular.module('storyboard').controller('gridCtrl', function($scope, $document, $timeout) {

    $scope.gridWidth = 0;
    $scope.numColumnsLikely = 0;
    $scope.renameStorylines = false;

    $scope.sortableOptions = {
        axis: 'y',
        'ui-floating': true,
        placeholder: "highlight",
        start: function (event, ui) {
            $scope.storyboardData.gridEvents = [];
            $scope.$apply();
            ui.item.toggleClass("highlight");
        },
        stop: function (event, ui) {
            initializeEventGrid();
            updateGridBounds();
            ui.item.toggleClass("highlight");
            $scope.$emit("reorderStorylines", $scope.storyboardData.storylines);
        }
    };

    $scope.initializeGridAndStorylines = function() {
        createStoryboardStorylines();
        initializeEventGrid();
        updateGridBounds();
    };
    $scope.$on('recalculateStoryboard', function() {
        console.log("**** Recalculate grid");
        $scope.initializeGridAndStorylines();
    });

    //Storylines
    var createStoryboardStorylines = function() {
        $scope.storyboardData.storylines = ($scope.options.storylines)?$scope.options.storylines:[];
        var storylinesHashObject = {};

        //Create storylines hash object
        for(var i=0; i<$scope.options.storyboardEvents.length; i++) {
            var event = $scope.options.storyboardEvents[i];
            //event.startDate = new Date(event.startDate);
            //event.endDate = new Date(event.endDate);
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
            if( (prop != "_undefined") && ($scope.storyboardData.storylines.indexOf(prop) == -1) ) { //Do undefined last
                $scope.storyboardData.storylines.push(prop);
            }
        }
        if(storylinesHashObject._undefined) {
            if($scope.storyboardData.storylines.indexOf("_undefined") == -1)
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
        width:'auto',
        pushing: false,
        floating: false,
        swapping: false,
        //columns: 100, // the width of the grid, in columns
        colWidth: 100, // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: 180, // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [35, 10], // the pixel distance between each widget
        defaultSizeX: 1, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        resizable: {
            enabled: true,
            handles: ['e', 'w'],
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
        if(typeof(changedElement.event.startDate) == "string") {
            changedElement.event.startDate = new Date(changedElement.event.startDate);
        }

        if(typeof(changedElement.event.endDate) == "string") {
            changedElement.event.endDate = new Date(changedElement.event.endDate);
        }

        changedElement.event.endDate = calcDateFromColumn(changedElement.col+changedElement.sizeX);
        $scope.$emit("storyboardItemResized", changedElement.event);
    };

    var onElementMoved = function(changedElement) {
        if(typeof(changedElement.event.startDate) == "string") {
            changedElement.event.startDate = new Date(changedElement.event.startDate);
        }

        if(typeof(changedElement.event.endDate) == "string") {
            changedElement.event.endDate = new Date(changedElement.event.endDate);
        }

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
            $scope.$emit('triggerRecalculateStoryboard', $scope.storyboardData.minViewDate, $scope.storyboardData.maxViewDate);
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
        $scope.numColumnsLikely = numBlocks;

        //Set column width based on view width
        $scope.gridsterOpts.colWidth = 100;

        $scope.gridWidth = $scope.numColumnsLikely * $scope.gridsterOpts.colWidth;
        $scope.gridsterOpts.width = $scope.gridWidth;

        $scope.gridsterOpts.resizable.enabled = $scope.options.enableEditStoylineEvents;
        $scope.gridsterOpts.draggable.enabled = $scope.options.enableEditStoylineEvents;
    };

    var createGridEventObjects = function() {
        $scope.storyboardData.gridEvents = [];
        for(var i=0; i<$scope.options.storyboardEvents.length; i++) {
            addGridItemForEvent($scope.options.storyboardEvents[i]);
        }
    };

    var addGridItemForEvent = function(event) {
        if(typeof(event.startDate) == "string") {
            event.startDate = new Date(event.startDate);
        }

        if(typeof(event.endDate) == "string") {
            event.endDate = new Date(event.endDate);
        }

        var obj = {};
        obj.event = event;
        obj.sizeX = calcNumColumnsBetweenStartAndEnd(obj.event.startDate, obj.event.endDate);
        obj.sizeY = 1;
        obj.dragEnabled = false;
        obj.row = (event.storylineName)?$scope.storyboardData.storylines.indexOf(event.storylineName):$scope.storyboardData.storylines.indexOf("_undefined");
        obj.col = calcStartColumn(obj.event.startDate);
        $scope.storyboardData.gridEvents.push(obj);

        return obj;
    };

    var calcNumColumnsBetweenStartAndEnd = function(startDate, endDate) {
        return Math.floor(endDate.differenceInHours(startDate) / $scope.options.gridSizeInHours);
    };

    var calcStartColumn = function(startdate) {
        var diff = Math.floor(( startdate.differenceInHours($scope.storyboardData.minDate)));
        var res = diff / $scope.options.gridSizeInHours;

        return res;
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
        $scope.gridsterOpts.colWidth = Math.floor(colWidth);

        //Update scroll position
        $scope.gridWidth = $scope.numColumnsLikely * $scope.gridsterOpts.colWidth;
        $scope.gridsterOpts.width = $scope.gridWidth;
        var totalHours = $scope.storyboardData.maxDate.differenceInHours($scope.storyboardData.minDate);
        var viewStart = $scope.storyboardData.minViewDate.differenceInHours($scope.storyboardData.minDate);

        var gridElement = angular.element(document.getElementById('storyboardGridContainer'));
        var xScroll = (viewStart / totalHours)*$scope.gridWidth;

        $timeout( function() { gridElement.scrollLeft(xScroll) }, 0);
    };
    var viewBoundsChanged = function() {
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

        if($scope.options.enableEditStoylineEvents) {
            var grid = document.getElementById('storyboardGrid');
            var xpos = clickevent.offsetX === undefined ? clickevent.originalEvent.layerX : clickevent.offsetX;
            var ypos = clickevent.offsetY === undefined ? clickevent.originalEvent.layerY : clickevent.offsetY;

            var row = Math.floor(ypos / 180);
            var col = Math.floor(xpos / ($scope.gridsterOpts.colWidth));

            var visibleColumns=calcNumColumnsBetweenStartAndEnd($scope.storyboardData.minViewDate, $scope.storyboardData.maxViewDate);

            //Create new event
            var newEvent = {
                startDate: calcDateFromColumn(col),
                endDate: calcDateFromColumn(col+Math.round(visibleColumns/5)),
                title: "new event",
                storylineName: $scope.storyboardData.storylines[row]
            };

            //Add to list of events
            $scope.options.storyboardEvents.push(newEvent);

            $scope.$emit("storyboardItemAdded", newEvent);

            //Add storyboard item for event
            var gridObj = addGridItemForEvent(newEvent, row);
            if(eventAffectsMinMaxDates(gridObj)) {
                $scope.$emit('triggerRecalculateStoryboard', $scope.storyboardData.minViewDate, $scope.storyboardData.maxViewDate);
            }
        }
    };

    $scope.updateStorylineName = function(oldStorylineName, newStorylineName) {
        if($scope.options.enableEditStoylineEvents) {
            var storylineIndex = $scope.storyboardData.storylines.indexOf(oldStorylineName);
            if (storylineIndex > -1) {
                $scope.storyboardData.storylines[storylineIndex] = newStorylineName
            }

            for (var i = 0; i < $scope.options.storyboardEvents.length; i++) {
                var event = $scope.options.storyboardEvents[i];

                if (event.storylineName == oldStorylineName) {
                    event.storylineName = newStorylineName;
                }
            }

            $scope.$emit("storylineChanged", oldStorylineName, newStorylineName);
            return true;
        }
    };

    $scope.addStoryline = function() {
        if($scope.options.enableEditStoylineEvents) {
            var newStoryline = "NewStoryline_" + (Math.random() + 1).toString(36).substring(2, 7);
            $scope.storyboardData.storylines.push(newStoryline);

            var col = calcStartColumn($scope.storyboardData.minViewDate);
            var visibleColumns=calcNumColumnsBetweenStartAndEnd($scope.storyboardData.minViewDate, $scope.storyboardData.maxViewDate);


            //Create new event so gridster will add the row
            var newEvent = {
                startDate: calcDateFromColumn(col),
                endDate: calcDateFromColumn(col+Math.round(visibleColumns/5)),
                title: "new event",
                storylineName: newStoryline
            };

            //Add to list of events
            $scope.options.storyboardEvents.push(newEvent);

            //Add storyboard item for event
            addGridItemForEvent(newEvent, $scope.storyboardData.storylines-1);
            $scope.$emit("addStoryline", newStoryline);
            $scope.$emit("storyboardItemAdded", newEvent);
        }
    };

    $scope.deleteStoryline = function(delStoryline) {
        if($scope.options.enableEditStoylineEvents) {
            for (var i = 0; i < $scope.options.storyboardEvents.length; i++) {
                var event = $scope.options.storyboardEvents[i];

                if (event.storylineName == delStoryline) {
                    alert("Cannot delete storyline while any events are still attached to it.  Delete or move any events to another storyline first.");
                    return;
                }
            }
            var storylineIndex = $scope.storyboardData.storylines.indexOf(delStoryline);
            if (storylineIndex > -1) {
                $scope.storyboardData.storylines.splice(storylineIndex, 1);
                createGridEventObjects();
                $scope.$emit("deleteStoryline", delStoryline);
            }
        }
    };


    var handleAdditions = function(inputEvents, gridEvents) {
        //for(var i=0; i<inputEvents.length; i++) {
        //    findIndex = gridEvents.indexOf(inputEvents[i]);
        //    if(findIndex == -1) {
        //
        //    }
        //}
    };

    var handleRemovals = function(inputEvents, gridEvents) {
      for(var i=0; i<gridEvents.length; i++) {
          findIndex = inputEvents.indexOf(gridEvents[i].event);
          if(findIndex == -1) {
              gridEvents.splice(i, 1);
              break;
          }
      }
    };

    var onInputStoryboardEventsChanged = function(newValue, oldValue) {
        //Create an array of the events attached to grid items
        var gridEvs = $.map($scope.storyboardData.gridEvents, function(val, i) {
            return val.event;
        });
        //Compare against the input storyboard events to see if things have changed.
        if( $($scope.options.storyboardEvents).not(gridEvs).length === 0 && $(gridEvs).not($scope.options.storyboardEvents).length === 0 ) {

        } else {
            handleAdditions($scope.options.storyboardEvents, $scope.storyboardData.gridEvents);
            handleRemovals($scope.options.storyboardEvents, $scope.storyboardData.gridEvents);
        }
    };
    var debounceOnInputStoryboardEventsChanged = function(newValue, oldValue) {
        _.debounce(500, onInputStoryboardEventsChanged(newValue, oldValue), true);
    };
    $scope.$watchCollection('options.storyboardEvents', debounceOnInputStoryboardEventsChanged);


    var onInputStoryboardStorylinesChanged = function(newValue, oldValue) {
        //Compare to see if things have changed.
        if( $(newValue).not(oldValue).length === 0 && $(oldValue).not(newValue).length === 0 ) {

        } else {
            $scope.$emit('triggerRecalculateStoryboard', $scope.storyboardData.minViewDate, $scope.storyboardData.maxViewDate);
        }
    };
    $scope.$watchCollection('options.storylines', onInputStoryboardStorylinesChanged);

    $scope.createArray = function(num) {
        return new Array(num);
    };
});



