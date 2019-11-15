import Theme from "../model";

const DipasTheme = Theme.extend(/** @lends DipasTheme.prototype */{
    defaults: {
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
            gfiAttributes = this.get("gfiAttributes");

        _.each(gfiAttributes, function (value, key) {
            this.get("gfiAttributesDipas")[key] = gfiContent[0][value] || key;
        }, this);
    },

    /**
     * generates the path for gfi icons
     * @param  {String} value - gfi feature attribute values
     * @fires StyleList#RadioRequestStyleListReturnModeById
     * @returns {void}
     */
    getIconPath: function (value) {
        const styleModel = Radio.request("StyleList", "returnModelById", this.get("themeId"));
        let iconPath = "http://geoportal-hamburg.de/lgv-beteiligung/icons/einzelmarker_dunkel.png",
            valueStyle = null;

        if (styleModel && styleModel.has("styleFieldValues")) {
            valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                return styleFieldValue.styleFieldValue === value;
            });
        }
        if (valueStyle && valueStyle.length > 0 && ("imageName" in valueStyle[0])) {
            iconPath = styleModel.get("imagePath") + valueStyle[0].imageName;
        }
        this.setIconPath(iconPath);
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
