import Theme from "../model";

const DipasTheme = Theme.extend(/** @lends DipasTheme.prototype */{
    defaults: {
        iconPath: "https://geoportal-hamburg.de/lgv-beteiligung/icons/einzelmarker_dunkel.png",
        gfiAttributesDipas: {
            "Thema": "",
            "name": "",
            "description": "",
            "link": "",
            "nid": "",
            "Rubric": ""
        }
    },
    /**
     * @class DipasTheme
     * @extends Theme
     * @memberof Tools.GFI.Themes.Dipas
     * @constructs
     * @listens Theme#changeIsReady
     */
    initialize: function () {
        const featureList = this.get("gfiFeatureList");

        this.listenTo(this, {
            "change:isReady": function () {
                this.getIconPath(featureList[0].get("Thema"));
                this.getGfiTheme();
            }
        });
    },

    /**
     * generates the gfi Attributes when gfi is active
     * @returns {void}
     */
    getGfiTheme: function () {
        const gfiContent = this.get("gfiContent"),
            uiStyle = this.get("uiStyle");
        let parentLocation = "",
            contributionLink = "";

        if (uiStyle !== "TABLE") {
            parentLocation = document.referrer;
            contributionLink = parentLocation.split("#")[0] + "#/contribution/" + gfiContent[0].nid;
            gfiContent[0].link = contributionLink;
        }
    },

    /**
     * generates the path for gfi icons
     * @param  {String} value - gfi feature attribute values
     * @fires StyleList#RadioRequestStyleListReturnModeById
     * @returns {void}
     */
    getIconPath: function (value) {
        const styleModel = Radio.request("StyleList", "returnModelById", this.get("themeId")),
            isNewVectorStyle = Config.hasOwnProperty("useVectorStyleBeta") && Config.useVectorStyleBeta ? Config.useVectorStyleBeta : false,
            iconPath = this.get("gfiParams")?.iconPath ? this.get("gfiParams").iconPath : this.get("iconPath");

        let valueStyle;

        if (styleModel) {
            if (!isNewVectorStyle && styleModel.has("styleFieldValues")) {
                // @deprecated with new vectorStyle module. Should be removed with version 3.0.
                valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                    return styleFieldValue.styleFieldValue === value;
                });
                this.fetchIconPathDeprecated(iconPath, valueStyle);
            }
            else if (isNewVectorStyle && styleModel.has("rules") && styleModel.get("rules").length > 0) {
                valueStyle = styleModel.get("rules").filter(function (rule) {
                    return rule.conditions.properties.Thema === value;
                });

                this.fetchIconPath(iconPath, valueStyle);
            }
        }
    },

    /**
     * @deprecated with new vectorStyle module. Should be removed with version 3.0.
     * Getting icon from old style format
     * @param  {String} iconPath - the default icon path
     * @param  {Array} valueStyle - the list of style values
     * @returns {Void} -
     */
    fetchIconPathDeprecated: function (iconPath, valueStyle) {
        let finalIconPath = iconPath;

        if (valueStyle && valueStyle.length > 0 && ("imageName" in valueStyle[0])) {
            finalIconPath = valueStyle[0].imageName;
        }

        this.setIconPath(finalIconPath);
    },

    /**
     * Getting icon from new style format
     * @param  {String} iconPath - the default icon path
     * @param  {Array} valueStyle - the list of style values
     * @returns {Void} -
     */
    fetchIconPath: function (iconPath, valueStyle) {
        let finalIconPath = iconPath;

        if (valueStyle && valueStyle.length > 0 && ("imageName" in valueStyle[0].style)) {
            finalIconPath = valueStyle[0].style.imageName;
        }

        this.setIconPath(finalIconPath);
    },

    /**
     * setter for icons path
     * @param  {String} value - gfi icon path
     * @returns {void}
     */
    setIconPath: function (value) {
        this.set("iconPath", value);
    }

});

export default DipasTheme;
