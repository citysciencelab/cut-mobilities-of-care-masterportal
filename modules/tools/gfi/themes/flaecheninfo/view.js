define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        FlaecheninfoTemplate = require("text!modules/tools/gfi/themes/flaecheninfo/template.html"),
        FlaecheninfoThemeView;

    FlaecheninfoThemeView = ThemeView.extend({
        className: "flaecheninfo",
        template: _.template(FlaecheninfoTemplate),
        events: {
            "click button": "btnClicked"
        },
        btnClicked: function () {
            this.model.createReport();
        }
    });

    return FlaecheninfoThemeView;
});
