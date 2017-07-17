define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        VerkehrsStaerkenThemeTemplateTabelle = require("text!modules/tools/gfi/themes/verkehrsstaerken/template_tabelle.html"),
        VerkehrsStaerkenThemeTemplateDiagramm = require("text!modules/tools/gfi/themes/verkehrsstaerken/template_diagramm.html"),
        VerkehrsStaerkenThemeView;

    VerkehrsStaerkenThemeView = ThemeView.extend({
        tagName: "div",
        className: "table-wrapper-div",
        template: _.template(VerkehrsStaerkenThemeTemplateTabelle),
        events: {
            "click #ansicht": "toggleAnsicht",
            "click .kat": "changeKat"
        },
        toggleAnsicht: function (evt) {
            var ansicht = evt.currentTarget.innerHTML;

            if (ansicht === "Diagrammansicht") {
                this.model.setAnsicht("Tabellenansicht");
                this.template = _.template(VerkehrsStaerkenThemeTemplateDiagramm);
                this.render();
                this.model.set("attrToShowInD3", "Dtv");
                this.model.createD3Document();
            }
            else {
                this.model.setAnsicht("Diagrammansicht");
                this.template = _.template(VerkehrsStaerkenThemeTemplateTabelle);
                this.render();
            }
        },
        changeKat: function (evt) {
            this.render();
            this.model.set("attrToShowInD3", evt.currentTarget.id);
            $(".btn-group").children("button").each(function () {
                if ($(this)[0].id === evt.currentTarget.id) {
                    $(this).addClass("active");
                }
                else {
                    $(this).removeClass("active");
                }
            });
            this.model.createD3Document();
        }
    });

    return VerkehrsStaerkenThemeView;
});
