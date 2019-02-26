import ThemeView from "../view";
import SchulInfoThemeTemplate from "text-loader!./template.html";

const SchulInfoThemeView = ThemeView.extend({
    className: "schulinfo container",
    template: _.template(SchulInfoThemeTemplate),
    events: {
        "click .schulinfo-head button": "btnClicked",
        "click .glyphicon-map-marker": "takeRoute",
        "click .glyphicon-star-empty": "addFeatureToCompareList",
        "click .glyphicon-star": "removeFeatureFromCompareList"
    },

    initialize: function () {
        // call ThemeView's initialize method explicitly
        ThemeView.prototype.initialize.apply(this);

        this.listenTo(this.model, {
            "toggleStarGlyphicon": this.toggleStarGlyphicon
        });
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

    /**
     * triggers the event "addFeatureToList"
     * to the CompareFeatures module to add the feature
     * @returns {void}
     */
    addFeatureToCompareList: function () {
        Radio.trigger("CompareFeatures", "addFeatureToList", this.model.get("feature"));
    },

    /**
     * triggers the event "removeFeatureFromList"
     * to the CompareFeatures module to remove the feature
     * @returns {void}
     */
    removeFeatureFromCompareList: function () {
        Radio.trigger("CompareFeatures", "removeFeatureFromList", this.model.get("feature"));
    },

    /**
     * toggles the glyphicon star
     * @param {ol.feature} feature -
     * @returns {void}
     */
    toggleStarGlyphicon: function (feature) {
        // glyphicon-star || glyphicon-star-empty
        var glyphiconElement = this.$("span:nth-child(2)");

        if (feature.get("isOnCompareList")) {
            this.highlightStarGlyphicon(glyphiconElement);
        }
        else {
            this.unhighlighStarGlyphicon(glyphiconElement);
        }
    },

    /**
     * highlights the star glyphicon and sets the title attribute
     * @param {jQuery} glyphiconElement - the glyphicon span element
     * @returns {void}
     */
    highlightStarGlyphicon: function (glyphiconElement) {
        glyphiconElement.addClass("glyphicon-star");
        glyphiconElement.removeClass("glyphicon-star-empty");
        glyphiconElement.attr("title", "Von der Vergleichsliste entfernen");
    },

    /**
     * unhighlights the star glyphicon and sets the title attribute
     * @param {jQuery} glyphiconElement - the glyphicon span element
     * @returns {void}
     */
    unhighlighStarGlyphicon: function (glyphiconElement) {
        glyphiconElement.addClass("glyphicon-star-empty");
        glyphiconElement.removeClass("glyphicon-star");
        glyphiconElement.attr("title", "Auf die Vergleichsliste");
    }
});

export default SchulInfoThemeView;
