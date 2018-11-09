import ThemeView from "../view";
import FlaecheninfoTemplate from "text-loader!./template.html";

const FlaecheninfoThemeView = ThemeView.extend({
    className: "flaecheninfo",
    template: _.template(FlaecheninfoTemplate),
    events: {
        "click button": "btnClicked"
    },

    initialize: function () {
        Radio.trigger("GFI", "isVisibleMapMarker", false);
    },

    btnClicked: function () {
        this.model.createReport();
    }
});

export default FlaecheninfoThemeView;
