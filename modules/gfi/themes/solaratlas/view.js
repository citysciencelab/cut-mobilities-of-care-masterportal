define(function (require) {

    var ThemeView = require("modules/gfi/themes/view"),
        SolaratlasTemplate = require("text!modules/gfi/themes/solaratlas/template.html"),
        SolaratlasThemeView;

    SolaratlasThemeView = ThemeView.extend({
        className: "popover-solaratlas",
        template: _.template(SolaratlasTemplate)
    });

    return SolaratlasThemeView;
});
