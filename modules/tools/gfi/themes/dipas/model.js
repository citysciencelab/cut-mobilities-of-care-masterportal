import Theme from "../model";

const DipasTheme = Theme.extend({
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.getIconPath()
        });

    },

    getIconPath: function () {
        var styleModel = Radio.request("StyleList", "returnModelById", this.get("id")),
            valueStyle,
            iconPath,
            value = this.get("feature").get("thema");

        if (styleModel) {
            valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                return styleFieldValue.styleFieldValue === value;
            });
        }
        if (valueStyle) {
            iconPath = styleModel.get("imagePath") + valueStyle[0].imageName;
        }
        this.setIconPath(iconPath);
    },
    setIconPath: function (value) {
        this.set("iconPath", value);
    }


});

export default DipasTheme;
