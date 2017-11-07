define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        SchulInfoThemeTemplate = require("text!modules/tools/gfi/themes/schulinfo/template.html"),
        SchulInfoThemeView;

    SchulInfoThemeView = ThemeView.extend({
        className: "schulinfo",
        template: _.template(SchulInfoThemeTemplate),
        events: {
            "click button": "btnClicked"
        },
        btnClicked: function (evt) {
            this.model.updateFeatureInfos(evt.currentTarget.value);
            this.render();
        }
    });

    return SchulInfoThemeView;
});
