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
        const StatGeb_Nr = this.model.get("StatGeb_Nr"),
            schoolLevelTitle = this.model.get("schoolLevelTitle"),
            numberOfStudentsInDistrict = this.model.get("numberOfStudentsInDistrict"),
            layerSchools = this.model.getLayerSchools(),
            schools = layerSchools ? layerSchools.get("layer").getSource().getFeatures() : [],
            featureIds = this.model.getFeatureIds(schools, StatGeb_Nr);

        this.addHtmlMouseHoverCode(schools, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict);

        if (layerSchools) {
            layerSchools.setIsSelected(true);
        }
        this.model.showFeaturesByIds(layerSchools, featureIds);
    },

    /**
     * adds html mouse hover code to all school features where the StatGeb_Nr valids StatGeb_Nr
     * @pre features may or may not have mouse hover html code already attatched
     * @post all features with a StatGeb_Nr validated by StatGeb_Nr have attatched mouse hover html code
     * @param {Feature[]} schools schools an array of features to check
     * @param {String} schoolLevelTitle schoolLevelTitle the school level as defined in defaults.schoolLevelTitle
     * @param {String} StatGeb_Nr StatGeb_Nr the urban area number based on the customers content (equals StatGeb_Nr)
     * @param {Integer} numberOfStudentsInDistrict numberOfStudentsInDistrict total number of students in the selected district
     * @returns {Void}  -
     */
    addHtmlMouseHoverCode: function (schools, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict) {
        let attr;

        schools.forEach(function (school) {
            if (this.model.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr) === false) {
                // continue with forEach
                return;
            }

            attr = this.model.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict);
            school.set("html", this.mouseoverTemplate(attr));
        }, this);
    }
});

export default SchulenWohnortThemeView;
