define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        VerkehrsStaerkenThemeTemplateTabelle = require("text!modules/tools/gfi/themes/verkehrsstaerken/template.html"),
        VerkehrsStaerkenThemeTemplateDiagramm = require("text!modules/tools/gfi/themes/verkehrsstaerken/template_diagramm.html"),
        VerkehrsStaerkenThemeView;

    VerkehrsStaerkenThemeView = ThemeView.extend({
        tagName: "div",
        className: "table-wrapper-div",
        template: _.template(VerkehrsStaerkenThemeTemplateTabelle),
        events: {
            "click #ansicht": "toggleAnsicht"
        },
        toggleAnsicht: function (evt) {
            var ansicht = evt.currentTarget.innerHTML;

            if (ansicht === "Diagrammansicht") {
                this.model.setAnsicht("Tabellenansicht");
                this.template = _.template(VerkehrsStaerkenThemeTemplateDiagramm);
            }
            else {
                this.model.setAnsicht("Diagrammansicht");
                this.template = _.template(VerkehrsStaerkenThemeTemplateTabelle);
            }
            this.render();
        }
    });

    return VerkehrsStaerkenThemeView;
});
