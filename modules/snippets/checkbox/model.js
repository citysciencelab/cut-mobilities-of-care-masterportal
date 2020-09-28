import SnippetModel from "../model";
import ValueModel from "../value/model";

const CheckboxSnippet = SnippetModel.extend(/** @lends CheckboxSnippet.prototype */{
    defaults: {
        size: "small",
        // translations
        textOn: "",
        textOff: ""
    },
    /**
     * @class CheckboxSnippet
     * @memberof snippets.checkbox
     * @extends SnippetModel
     * @constructs
     * @property {String} size="small", size of the toggle. possible values: large, normal, small, mini
     * @property {String} textOn="", filled with "An"- translated / text of the on toggle
     * @property {String} textOff="", filled with "Aus"- translated / text of the off toggle
     * @fires Core#RadioRequestMapGetMap
     * @fires Core#RadioRequestMapViewGetResolutions
     * @fires Core.ConfigLoader#RadioRequestParserGetInitVisibBaselayer
     * @fires Core#RadioTriggerMapAddControl
     * @fires Core#RadioTriggerMapRemoveControl
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.superInitialize();
        this.addValueModel(this.get("isSelected"));
        this.listenTo(this.get("valuesCollection"), {
            "change:isSelected": function (model) {
                this.trigger("valuesChanged", model.get("isSelected"));
                this.renderView();
            }
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            textOn: i18next.t("common:snippets.checkbox.on"),
            textOff: i18next.t("common:snippets.checkbox.off"),
            "currentLng": lng
        });
    },
    addValueModel: function (value) {
        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            isSelected: value,
            type: this.get("type")
        }));
    },
    renderView: function () {
        this.trigger("renderView");
    },
    setIsSelected: function (value) {
        this.get("valuesCollection").models[0].set("isSelected", value);
    },
    getIsSelected: function () {
        return this.get("valuesCollection").models[0].get("isSelected");
    },
    getSelectedValues: function () {
        return {
            attrName: this.get("name"),
            label: this.get("label"),
            type: this.get("type"),
            values: this.get("valuesCollection").pluck("isSelected")
        };
    }
});

export default CheckboxSnippet;
