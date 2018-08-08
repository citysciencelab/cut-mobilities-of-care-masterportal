define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        DipasThemeTemplate = require("text!modules/tools/gfi/themes/dipas/template.html"),
        DipasThemeView;

    DipasThemeView = ThemeView.extend({
        className: "dipas-gfi-theme",
        template: _.template(DipasThemeTemplate)
    });

    return DipasThemeView;
});
