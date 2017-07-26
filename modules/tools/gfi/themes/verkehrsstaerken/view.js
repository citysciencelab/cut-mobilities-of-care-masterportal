define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        VerkehrsStaerkenThemeTemplate = require("text!modules/tools/gfi/themes/verkehrsstaerken/template.html"),
        VerkehrsStaerkenThemeView;

    VerkehrsStaerkenThemeView = ThemeView.extend({
        tagName: "div",
        className: "table-wrapper-div",
        template: _.template(VerkehrsStaerkenThemeTemplate),
        events: {
            "click .kat": "changeKat",
            "click #diagramm-tab": "initiallyLoadDiagramm"
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
        initiallyLoadDiagramm: function () {
            $(".graph svg").remove();
            this.model.setAttrToShow(["Dtv"]);
            this.model.createD3Document();
        }
    });

    return VerkehrsStaerkenThemeView;
});
