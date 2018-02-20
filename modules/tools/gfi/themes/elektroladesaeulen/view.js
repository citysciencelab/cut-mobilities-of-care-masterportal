define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        ElektroladesaeulenThemeTemplate = require("text!modules/tools/gfi/themes/elektroladesaeulen/template.html"),
        ElektroladesaeulenThemeView;

    ElektroladesaeulenThemeView = ThemeView.extend({
        tagName: "div",
        className: "ladesaeulen",
        template: _.template(ElektroladesaeulenThemeTemplate),
        events: {
            "click .tab-toggle": "toggleTab"
        },

        toggleTab: function (evt) {
            var contentId = $(evt.currentTarget).attr("value");

            // deactivate all tabs and their contents
            $(evt.currentTarget).parent().find("li").each(function (index, li) {
                var tabContentId = $(li).attr("value");

                $(li).removeClass("active");
                $("#" + tabContentId).removeClass("active");
                $("#" + tabContentId).removeClass("in");
            });

            // activate selected tab and its content
            $(evt.currentTarget).addClass("active");
            $("#" + contentId).addClass("active");
            $("#" + contentId).addClass("in");

            if (contentId === "diagramm") {
                this.loadDiagramm();
            }
        },

        loadDiagramm: function () {
            this.model.createD3Document();
        }
    });

    return ElektroladesaeulenThemeView;
});
