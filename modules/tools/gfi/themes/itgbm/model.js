import Theme from "../model";

const ItGbmTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        });
    },

    parseGfiContent: function () {

        this.get("gfiContent")[0] = _.mapObject(this.get("gfiContent")[0], function (val) {
            if (typeof val === "string" && val.indexOf("|") !== -1) {
                return val.replace(/\|/g, ", ");
            }

            return val;

        });
        this.setTitle(this.get("gfiContent")[0].Belegenheit);
        this.setGfiContent(_.omit(this.get("gfiContent")[0], "Belegenheit"));
        this.setGfiContent(this.addUnits(this.get("gfiContent"), ["Größe"]));
    },
    /**
    * adds " ha" on Gewerbliche Standorte and " m²" on Flurstücke where key is inside attrArray
    * @param {Object} gfiContent -
    * @param {String[]} attrArray -
    * @returns {Object} gfiContent
    */
    addUnits: function (gfiContent, attrArray) {
        _.each(gfiContent, function (value, key) {
            // Gewerbliche Standorte
            if (this.get("id") === "10319" && _.contains(attrArray, key)) {
                gfiContent[key] = this.punctuate(value) + " ha";
            }
            // Flurstücke
            if (this.get("id") === "10320" && _.contains(attrArray, key)) {
                gfiContent[key] = this.punctuate(value) + " m²";
            }
        }, this);

        return gfiContent;
    },
    /**
     * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
     * @param  {String} value - feature attribute values
     * @return {String} newValue - feature attribute values as string with new punctuation
     */
    punctuate: function (value) {
        var pattern = /(-?\d+)(\d{3})/,
            newValue = value.toString();

        newValue = newValue.replace(".", ",");
        while (pattern.test(newValue)) {
            newValue = newValue.replace(pattern, "$1.$2");
        }
        return newValue;
    },
    /**
     * triggers feature properties via postMessage
     * @returns {void}
     */
    postMessageToItGbm: function () {
        var featureProperties = _.omit(this.get("feature").getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]);

        featureProperties.extent = this.get("feature").getGeometry().getExtent();
        featureProperties.id = this.get("feature").getId();
        Radio.trigger("RemoteInterface", "postMessage", {"featureToDetail": JSON.stringify(featureProperties), "layerId": this.get("id"), "layerName": this.get("name")});
    },

    // setter for title
    setTitle: function (value) {
        this.set("title", value);
    },

    // setter for id
    setId: function (value) {
        this.set("id", value);
    },

    // setter for feature
    setFeature: function (value) {
        this.set("feature", value);
    }
});

export default ItGbmTheme;
