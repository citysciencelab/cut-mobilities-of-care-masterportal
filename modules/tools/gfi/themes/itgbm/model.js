define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Config = require("config"),
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
            this.set("gfiContent", this.addUnits(this.get("gfiContent"), ["Größe"]));
        },
        /**
        * adds " ha" on Gewerbliche Standorte and " m²" on Flurstücke where key is inside attrArray
        */
        addUnits: function (gfiContent, attrArray) {
            _.each(gfiContent, function (value, key) {
                // Gewerbliche Standorte
                if (this.get("id") === "10319" && _.contains(attrArray, key)) {
                    gfiContent[key] = String(value) + " ha";
                }
                // Flurstücke
                if (this.get("id") === "10320" && _.contains(attrArray, key)) {
                    gfiContent[key] = String(value) + " m²";
                }
            }, this);

            return gfiContent;
        },
        /**
         * triggers feature properties via postMessage
         */
        postMessageToItGbm: function () {
            var featureProperties = _.omit(this.get("feature").getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]);

            featureProperties.extent = this.get("feature").getGeometry().getExtent();
            Radio.trigger("RemoteInterface", "postMessage", {"featureToDetail": JSON.stringify(featureProperties), "layerId": this.get("id"), "layerName": this.get("name")});
        }
    });

    return ItGbmTheme;
});
