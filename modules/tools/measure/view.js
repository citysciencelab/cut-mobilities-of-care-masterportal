define([
    "backbone.radio",
    "modules/tools/measure/default/view",
    "modules/tools/measure/table/view"
], function () {
    var Radio = require("backbone.radio"),
        MeasureView;

    MeasureView = function () {
            var menuStyle = Radio.request("Util", "getUiStyle");

            if (menuStyle === "TABLE") {
                require(["modules/tools/measure/table/view"], function (MeasureView) {
                    new MeasureView();
                });
            }
            else {
                require(["modules/tools/measure/default/view"], function (MeasureView) {
                    new MeasureView();
                });
            }
    };
    return MeasureView;
});
