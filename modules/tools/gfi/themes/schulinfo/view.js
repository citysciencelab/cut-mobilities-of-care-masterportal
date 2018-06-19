define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        SchulInfoThemeTemplate = require("text!modules/tools/gfi/themes/schulinfo/template.html"),
        SchulInfoThemeView;

    SchulInfoThemeView = ThemeView.extend({
        className: "schulinfo container",
        template: _.template(SchulInfoThemeTemplate),
        events: {
            "click .schulinfo-head button": "btnClicked",
            "click .glyphicon-map-marker": "takeRoute",
            "click .glyphicon-star-empty": "addFeatureToCompareList",
            "click .glyphicon-star": "removeFeatureFromCompareList"
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
        },

        addFeatureToCompareList: function () {
            this.toggleStarGlyphicon();
        },

        removeFeatureFromCompareList: function () {
            this.toggleStarGlyphicon();
        },

        /**
         * toggles the glyphicon star and sets the title attribute
         * @returns {void}
         */
        toggleStarGlyphicon: function () {
            var title = "Auf die Vergleichsliste",
                glyphiconElement = this.$("span:nth-child(2)");

            glyphiconElement.toggleClass("glyphicon-star glyphicon-star-empty");
            if (glyphiconElement.attr("title") === "Auf die Vergleichsliste") {
                title = "Von der Vergleichslite entfernen";
            }
            glyphiconElement.attr("title", title);
        }
    });

    return SchulInfoThemeView;
});
