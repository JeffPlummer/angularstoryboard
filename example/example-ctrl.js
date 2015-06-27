angular.module('example').controller('exampleCtrl', function($scope) {
    $scope.myOptions = {};
    $scope.myOptions.storyboardItemTemplate="myTemplate.html";
    $scope.myOptions.smallStoryboardItemTemplate="mySmallTemplate.html";
    $scope.myOptions.gridSizeInHours = 4;
    $scope.myOptions.extendBeyondInHours = 48;
    $scope.myOptions.enableRenameStorylines = true;
    $scope.myOptions.storyboardEvents = [
        {
            startDate: new Date(2015,0,1,4,05),
            endDate: new Date(2015, 0, 2, 4, 30),
            title: "Item1",
            text: "Hello this is a test",
            image: "http://www.slopemedia.org/wp-content/uploads/2015/02/cats.jpg",
            storylineName: "story1"
        },
        {
            startDate: new Date(2015,1,1,12,07),
            endDate: new Date(2015, 1, 6, 5, 0),
            title: "Item2",
            text: "World",
            image: "http://www.dogtrainingnation.com/wp-content/uploads/2015/02/iStock_000016265624_Large.jpg",
            storylineName: "story1"
        }//,
        //{
        //    startDate: new Date(2015,0,1,12,0),
        //    endDate: new Date(2015, 0, 6, 5, 0),
        //    title: "Item1",
        //    text: "Howdy",
        //    image: "http://www.dogtrainingnation.com/wp-content/uploads/2015/02/iStock_000016265624_Large.jpg"
        //
        //},
        //{
        //    startDate: new Date(2015,0,1,4,0),
        //    endDate: new Date(2015, 0, 2, 4, 0),
        //    title: "Item1",
        //    text: "Hello this is a test",
        //    image: "http://www.slopemedia.org/wp-content/uploads/2015/02/cats.jpg",
        //    storylineName: "story2"
        //},
        //{
        //    startDate: new Date(2015,1,1,12,0),
        //    endDate: new Date(2015, 1, 6, 5, 0),
        //    title: "Item2",
        //    text: "World",
        //    image: "http://www.dogtrainingnation.com/wp-content/uploads/2015/02/iStock_000016265624_Large.jpg",
        //    storylineName: "story3"
        //},
        //{
        //    startDate: new Date(2015,0,1,12,0),
        //    endDate: new Date(2015, 0, 6, 5, 0),
        //    title: "Item1",
        //    text: "Howdy",
        //    image: "http://www.dogtrainingnation.com/wp-content/uploads/2015/02/iStock_000016265624_Large.jpg",
        //    storylineName: "story4"
        //}
    ];
});
