angular.module('storyboard').controller('gridCtrl', function($scope, $document) {

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
    };

    var onElementMoved = function(changedElement) {
        var numHours = changedElement.event.endDate.differenceInHours(changedElement.event.startDate);

        var newRow = changedElement.row;
        var newCol = changedElement.col;

        //Adjust event storyline
        changedElement.event.storyline = $scope.storyboardData.storylines[newRow];

        //Adjust startDate / EndDate
        changedElement.event.startDate = calcDateFromColumn(newCol);
        changedElement.event.endDate = calcDateFromColumn(newCol+changedElement.sizeX);

        //If column is near first or last, need to re-adjust min/max dates of storyboard as a whole
        if(eventAffectsMinMaxDates(changedElement)) {
            $scope.$emit('recalculateStoryboard');
            $scope.initializeStorylines();
        }
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
        obj.row = (event.storyline)?$scope.storyboardData.storylines.indexOf(event.storyline):$scope.storyboardData.storylines.indexOf("_undefined");
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
    }
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
            storyline: $scope.storyboardData.storylines[row]
        };


        //Add to list of events
        $scope.options.storyboardEvents.push(newEvent);

        //Add storyboard item for event
        addGridItemForEvent(newEvent, row);

        console.log(clickevent);
    };


});



