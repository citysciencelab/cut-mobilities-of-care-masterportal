define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        TrinkwasserTemplate = require("text!modules/tools/gfi/themes/trinkwasser/template.html"),
        TrinkwasserThemeView;

    TrinkwasserThemeView = ThemeView.extend({
        tagName: "table",
        className: "table table-condensed table-hover popover-trinkwasser",
        template: _.template(TrinkwasserTemplate)
    });

    return TrinkwasserThemeView;
});
