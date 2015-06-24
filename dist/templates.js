angular.module('storyboard-templates', ['storyboard-template.html']);

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
