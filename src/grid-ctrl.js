angular.module('storyboard').controller('gridCtrl', function($scope, $document) {

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



