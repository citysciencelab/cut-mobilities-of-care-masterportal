define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ZoomControlTemplate = require("text!modules/controls/zoom/template.html"),
        ZoomControlView;

    ZoomControlView = Backbone.View.extend({
            template: _.template(ZoomControlTemplate),
            events: {
                "click .glyphicon-plus": "setZoomLevelUp",
                "click .glyphicon-minus": "setZoomLevelDown"
            },
            initialize: function () {
                var style = Radio.request("Util", "getUiStyle"),
                    el;
                if (style === "DEFAULT") {
                    el = Radio.request("ControlsView", "addRowTR", "setZoomLevelUp", "setZoomLevelDown");
                    this.setElement(el[0]);
                    this.render();
                }
            },
            render: function () {
                this.$el.html(this.template);
            },
            setZoomLevelUp: function () {
                Radio.trigger("MapView", "setZoomLevelUp");
                Radio.trigger("ClickCounter", "zoomChanged");
            },
            setZoomLevelDown: function () {
                Radio.trigger("MapView", "setZoomLevelDown");
                Radio.trigger("ClickCounter", "zoomChanged");
            }
        });

    return ZoomControlView;
});
