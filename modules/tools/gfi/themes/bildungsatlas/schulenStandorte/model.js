import Theme from "../../model";

const SchulenStandorteViewTheme = Theme.extend(/** @lends SchulenStandorteViewTheme.prototype */{
    /**
     * @class SchulenStandorteViewTheme
     * @extends Theme
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                this.replaceValuesWithRealResults();
            }
        });
    },

    /**
     * here we need to parse the key and value, so that the real value could be shown in the gfi theme and all the keys will contain underline instead of white space
     * @returns {void}
     */
    replaceValuesWithRealResults: function () {
        var element = this.get("gfiContent"),
            key,
            idx,
            value;

        for (key in element[0]) {
            idx = key.replace(" ", "_");
            value = element[0][key];
            if (idx === "SchPu_PrSt") {
                value = value === 0 ? "nein" : "ja";
            }
            else if (idx === "C_S_SuS_ES") {
                value = value === 0 ? "nein" : "ja";
            }
            else if (idx === "C_S_GTA") {
                value = value === 0 ? "nein" : "ja";
            }

            this.set(idx, value);
        }
    }
});

export default SchulenStandorteViewTheme;
