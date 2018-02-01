define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Radio = require("backbone.radio"),
        ImgView = require("modules/tools/gfi/objects/image/view"),
        VideoView = require("modules/tools/gfi/objects/video/view"),
        RoutableView = require("modules/tools/gfi/objects/routingButton/view"),
        ItGbmTheme;

    ItGbmTheme = Theme.extend({

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseGfiContent
            });
        },

        /**
         * sets title and gfiContent attributes
         */
        parseGfiContent: function () {
            this.set("title", this.get("gfiContent")[0].Name);
            this.set("gfiContent", _.omit(this.get("gfiContent")[0], "Name"));
        },

        /**
         * triggers feature properties via postMessage
         */
        postMessageToItGbm: function () {
            var featureProperties = _.omit(this.get("feature").getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]);

            featureProperties.extent = this.get("feature").getGeometry().getExtent();
            parent.postMessage({"featureToDetail": JSON.stringify(featureProperties), "layerId": this.get("id")}, "http://localhost:8080");
        }
    });

    return ItGbmTheme;
});
