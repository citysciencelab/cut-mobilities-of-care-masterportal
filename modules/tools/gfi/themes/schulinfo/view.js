define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        SchulInfoThemeTemplate = require("text!modules/tools/gfi/themes/schulinfo/template.html"),
        SchulInfoThemeView;

    SchulInfoThemeView = ThemeView.extend({
        className: "schulinfo",
        template: _.template(SchulInfoThemeTemplate),
        events: {
            "click .schulinfo-head button": "btnClicked",
            "click .route-container button": "takeRoute"
        },
        btnClicked: function (evt) {
            this.model.updateFeatureInfos(evt.currentTarget.value);
            this.render();
        },

        /**
         * sets the schulwegrouting tool active,
         * hide the gfi window and takes over the school for the routing
         * @returns {void}
         */
        takeRoute: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "schulwegrouting", {isActive: true});
            Radio.trigger("GFI", "setIsVisible", false);
            Radio.trigger("SchulwegRouting", "selectSchool", this.model.get("feature").get("schul_id"));
        }
    });

    return SchulInfoThemeView;
});
