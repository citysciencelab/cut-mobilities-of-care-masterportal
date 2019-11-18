import ThemeView from "../../view";
import DefaultTemplate from "text-loader!./template.html";
import MouseoverTemplate from "text-loader!./mouseoverTemplate.html";
import SchulenWohnortModel from "./model";

/**
 * @member SchulenWohnortThemeTemplate
 * @description Template used to create gfi for schulenWohnort
 * @memberof Tools.GFI.Themes.Bildungsatlas
 */

const SchulenWohnortThemeView = ThemeView.extend(/** @lends SchulenWohnortThemeView.prototype */{
    /**
     * @class SchulenWohnortThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Bildungsatlas
     * @constructs
     */
    tagName: "div",
    className: "gfi-school-address",

    initialize: function () {
        this.template = _.template(DefaultTemplate);
        this.mouseoverTemplate = _.template(MouseoverTemplate);
        this.model = new SchulenWohnortModel();
        this.listenTo(this.model, {
            "renderMouseover": this.renderMouseHover
        });
        this.render();
    },


    renderMouseHover: function (school, accountsAll, urbanAreaFinal, layerSchoolLevel) {
        const name = school.get("C_S_Name"),
            address = school.get("C_S_Str") + " " + school.get("C_S_HNr") + "<br>" + school.get("C_S_PLZ") + " " + school.get("C_S_Ort"),
            totalSum = school.get("C_S_SuS"),
            priSum = school.get("C_S_SuS_PS"),
            socialIndex = school.get("C_S_SI") === -1 ? "nicht vergeben" : school.get("C_S_SI"),
            percentage = Math.round(urbanAreaFinal) + "%",
            sum = Math.round(accountsAll * urbanAreaFinal / 100),
            level = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"},
            attr = {
                accountsAll: accountsAll,
                urbanAreaFinal: urbanAreaFinal,
                layerSchoolLevel: layerSchoolLevel,
                name: name,
                address: address,
                totalSum: totalSum,
                priSum: priSum,
                socialIndex: socialIndex,
                percentage: percentage,
                sum: sum,
                level: level
            };

        school.set("html", this.mouseoverTemplate(attr));
    },

    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    }

});

export default SchulenWohnortThemeView;
