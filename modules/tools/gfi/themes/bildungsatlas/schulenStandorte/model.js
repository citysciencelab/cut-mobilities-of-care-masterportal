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
                this.setInfoHtml();
            }
        });
    },

    /**
     * here we need to parse the key and value, so that the real value could be shown in the gfi theme and all the keys will contain underline instead of white space
     * @returns {void}
     */
    replaceValuesWithRealResults: function () {
        const element = this.get("gfiContent");
        let key,
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
            else if (idx === "C_S_SI") {
                value = value === -1 ? "nicht vergeben" : value;
            }

            this.set(idx, value);
        }
    },

    /**
     * here we need to get the format information to decide which info to show
     * @returns {void}
     */
    setInfoHtml: function () {
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": this.get("gfiTheme"), "id": this.get("themeId")});
        let level;

        if (layerList) {
            level = layerList[0].get("gfiFormat").gfiBildungsatlasFormat.themeType;
        }

        this.set("level", level);
    }
});

export default SchulenStandorteViewTheme;
