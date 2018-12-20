import Theme from "../model";

const DipasTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.getIconPath(this.get("feature").get("Thema"))
        });
    },

    getIconPath: function (value) {
        var styleModel = Radio.request("StyleList", "returnModelById", this.get("id")),
            valueStyle = null,
            iconPath = "http://geoportal-hamburg.de/lgv-beteiligung/icons/einzelmarker_dunkel.png";

        if (styleModel && styleModel.has("styleFieldValues")) {
            valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                return styleFieldValue.styleFieldValue === value;
            });
        }
        if (valueStyle && valueStyle.length > 0) {
            iconPath = styleModel.get("imagePath") + valueStyle[0].imageName;
        }
        this.setIconPath(iconPath);
    },
    setIconPath: function (value) {
        this.set("iconPath", value);
    }
});

export default DipasTheme;
