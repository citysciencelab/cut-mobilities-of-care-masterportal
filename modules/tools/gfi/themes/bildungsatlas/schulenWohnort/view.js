import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";
import MouseoverTemplate from "text-loader!./mouseoverTemplate.html";

/**
 * @member SchulenWohnortThemeTemplate
 * @description Template used to create gfi for schulenWohnort
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulenWohnortThemeView = ThemeView.extend(/** @lends SchulenWohnortThemeView.prototype */{
    tagName: "div",
    className: "gfi-school-address",
    template: _.template(DefaultTemplate),
    mouseoverTemplate: _.template(MouseoverTemplate),

    /**
     * @class SchulenWohnortThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @constructs
     */
    initialize: function () {
        ThemeView.prototype.initialize.apply(this);

        // Fired only once when layer of statistical areas is loaded initially to filter areas
        this.listenTo(Radio.channel("VectorLayer"), {
            "featuresLoaded": this.showSchoolLayer
        });

        this.showSchoolLayer();
    },

    /**
     * activates selected features of the school layer and adds html data for mouse hovering
     * @returns {Void}  -
     */
    showSchoolLayer: function () {
        const layerSchools = this.model.getLayerSchools(),
            urbanAreaNr = this.model.get("urbanAreaNr"),
            schools = layerSchools.get("layer").getSource().getFeatures(),
            featureIds = [];
        let attr;

        schools.forEach(function (school) {
            const urbanAreaFinal = school.get("SG_" + urbanAreaNr);

            if (urbanAreaFinal !== undefined) {
                featureIds.push(school.getId());

                attr = this.model.getDataForMouseHoverTemplate(school, urbanAreaFinal);
                school.set("html", this.mouseoverTemplate(attr));
            }
        }.bind(this));

        layerSchools.setIsSelected(true);
        this.model.showFeaturesByIds(layerSchools, featureIds);
    }
});

export default SchulenWohnortThemeView;
