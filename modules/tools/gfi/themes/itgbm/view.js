import ThemeView from "../view";
import DefaultTemplate from "text-loader!./template.html";

const ItGbmThemeView = ThemeView.extend({
    className: "it-gbm",
    template: _.template(DefaultTemplate),
    events: {
        "click button": "btnClicked"
    },
    btnClicked: function () {
        this.model.postMessageToItGbm();
    }
});

export default ItGbmThemeView;
