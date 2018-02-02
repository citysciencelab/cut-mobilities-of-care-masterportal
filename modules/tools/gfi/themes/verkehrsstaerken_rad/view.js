define(function (require) {
    var ThemeView = require("modules/tools/gfi/themes/view"),
        VerkehrsStaerkenThemeRadTemplate = require("text!modules/tools/gfi/themes/verkehrsstaerken_rad/template.html"),
        VerkehrsStaerkenThemeRadView;

    VerkehrsStaerkenThemeRadView = ThemeView.extend({
        tagName: "div",
        className: "verkehrsstaerken_rad",
        template: _.template(VerkehrsStaerkenThemeRadTemplate),
        events: {
            "click .tab-toggle": "toggleTab"
        },
        loadDiagramm: function (attr) {
            $(".graph svg").remove();
            this.model.setActiveTab(attr);
            this.model.createD3Document();
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
            this.loadDiagramm(contentId);
        }
    });

    return VerkehrsStaerkenThemeRadView;
});
