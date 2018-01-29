define(function (require) {
    var ThemeView = require("modules/tools/gfi/themes/view"),
        VerkehrsStaerkenThemeRadTemplate = require("text!modules/tools/gfi/themes/verkehrsstaerken_rad/template.html"),
        VerkehrsStaerkenThemeRadView;

    VerkehrsStaerkenThemeRadView = ThemeView.extend({
        tagName: "div",
        className: "verkehrsstaerken",
        template: _.template(VerkehrsStaerkenThemeRadTemplate),
        events: {
            "click .kat": "changeKat",
            "click .tab-toggle": "toggleTab"
        },
        changeKat: function (evt) {
            $(".graph svg").remove();
            this.model.setAttrToShow([evt.currentTarget.id]);
            $(".btn-group").children("button").each(function () {
                if ($(this)[0].id === evt.currentTarget.id) {
                    $(this).addClass("active");
                }
                else {
                    $(this).removeClass("active");
                }
            });
            this.model.createD3Document();
        },
        loadDiagramm: function () {
            var attr = $("#diagramm").find(".active")[0].value;

            $(".graph svg").remove();
            this.model.setAttrToShow([attr]);
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
            if (contentId === "diagramm") {
                this.loadDiagramm();
            }
        }
    });

    return VerkehrsStaerkenThemeRadView;
});
