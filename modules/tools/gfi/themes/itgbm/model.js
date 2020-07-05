import Theme from "../model";

const ItGbmTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        });
    },

    parseGfiContent: function () {
        this.get("gfiContent")[0] = Object.fromEntries(Object.entries(this.get("gfiContent")[0]).map(content => {
            const value = content[1];

            if (typeof value === "string" && value.indexOf("|") !== -1) {
                return value.replace(/\|/g, ", ");
            }

            return value;
        }));


        this.setTitle(this.get("gfiContent")[0].Belegenheit);
        this.setGfiContent(Radio.request("Util", "omit", this.get("gfiContent")[0], ["Belegenheit"]));
        this.setGfiContent(this.addUnits(this.get("gfiContent"), ["Größe"]));
    },
    /**
    * adds " ha" on Gewerbliche Standorte and " m²" on Flurstücke where key is inside attrArray
    * @param {Object} gfiContent -
    * @param {String[]} attrArray -
    * @returns {Object} gfiContent
    */
    addUnits: function (gfiContent, attrArray) {
        Object.entries(gfiContent).forEach(content =>{
            const value = content[1],
                key = content[0];

            // Gewerbliche Standorte
            if (this.get("id") === "10319" && attrArray.includes(key)) {
                gfiContent[key] = this.punctuate(value) + " ha";
            }
            // Flurstücke
            if (this.get("id") === "10320" && attrArray.includes(key)) {
                gfiContent[key] = this.punctuate(value) + " m²";
            }
        });

        return gfiContent;
    },
    /**
     * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
     * @param  {String} value - feature attribute values
     * @return {String} newValue - feature attribute values as string with new punctuation
     */
    punctuate: function (value) {
        const pattern = /(-?\d+)(\d{3})/;
        let newValue = value.toString();

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
        const featureProperties = Radio.request("Util", "omit", this.get("feature").getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]);

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
