define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        SolaratlasTemplate = require("text!modules/tools/gfi/themes/solaratlas/template.html"),
        SolaratlasThemeView;

    SolaratlasThemeView = ThemeView.extend({
        className: "popover-solaratlas",
        template: _.template(SolaratlasTemplate)
    });

    return SolaratlasThemeView;
});
