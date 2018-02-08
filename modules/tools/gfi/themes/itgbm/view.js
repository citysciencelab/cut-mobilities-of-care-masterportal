define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        DefaultTemplate = require("text!modules/tools/gfi/themes/itgbm/template.html"),
        DefaultThemeView;

    DefaultThemeView = ThemeView.extend({
        className: "it-gbm",
        template: _.template(DefaultTemplate),
        events: {
            "click button": "btnClicked"
        },
        btnClicked: function () {
            this.model.postMessageToItGbm();
        }
    });

    return DefaultThemeView;
});
