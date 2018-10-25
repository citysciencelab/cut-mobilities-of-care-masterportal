import ThemeView from "../view";
import VerkehrsStaerkenThemeTemplate from "text-loader!./template.html";

const VerkehrsStaerkenThemeView = ThemeView.extend({
    tagName: "div",
    className: "verkehrsstaerken",
    template: _.template(VerkehrsStaerkenThemeTemplate),
    events: {
        "click .kat": "changeKat",
        "click .tab-toggle": "toggleTab"
    },
    changeKat: function (evt) {
        this.$(".graph svg").remove();
        this.model.setAttrToShow([evt.currentTarget.id]);
        this.$(".btn-group").children("button").each(function () {
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
        var attr = this.$("#diagramm").find(".active")[0].value;

        this.$(".graph svg").remove();
        this.model.setAttrToShow([attr]);
        this.model.createD3Document();
    },
    toggleTab: function (evt) {
        var contentId = this.$(evt.currentTarget).attr("value");

        // deactivate all tabs and their contents
        this.$(evt.currentTarget).parent().find("li").each(function (index, li) {
            var tabContentId = $(li).attr("value");

            $(li).removeClass("active");
            $("#" + tabContentId).removeClass("active");
            $("#" + tabContentId).removeClass("in");
        });
        // activate selected tab and its content
        this.$(evt.currentTarget).addClass("active");
        this.$("#" + contentId).addClass("active");
        this.$("#" + contentId).addClass("in");
        if (contentId === "diagramm") {
            this.loadDiagramm();
        }
    }
});

export default VerkehrsStaerkenThemeView;
