angular.module('storyboard-templates', ['storyboard-template.html']);

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
