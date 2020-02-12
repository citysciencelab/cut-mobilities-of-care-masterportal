import FreezeView from "./freezeWindowView";
import FreezeToolMenuView from "./freezeToolMenuView";
import FreezeControlMenuView from "./freezeControlMenuView";

const FreezeModel = Backbone.Model.extend(/** @lends FreezeModel.prototype */{
    defaults: {
        glyphicon: "icon-lock",
        // translations
        freezeText: "",
        unfreezeText: "",
        name: "",
    },

    /**
     * @class FreezeModel
     * @description model for freeze window
     * @extends Backbone.Model
     * @memberof Controls/Freeze
     * @constructs
     * @property {String} freezeText="", filled with "Ansicht sperren"- translated
     * @property {String} unfreezeText="", filled with "Ansicht entsperren"- translated
     * @property {String} name="", filled with "Ansicht sperren"- translated
     * @listens i18next#RadioTriggerLanguageChanged
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
        this.setView(new FreezeView({model: this}));

        if (this.get("uiStyle") === "TABLE") {
            new FreezeToolMenuView({model: this});
        }
        else {
            new FreezeControlMenuView({model: this, el: this.get("el")});
        }
    },

    /**
    * change language - sets default values for the language
    * @param {String} lng the language changed to
    * @fires Controls.Freeze#changeFreezeText
    * @fires Controls.Freeze#changeUnfreezeText
    * @fires Controls.Freeze#changeName
    * @returns {Void} -
    */
    changeLang: function () {
        this.set({
            freezeText: i18next.t("common:modules.controls.freeze.freeze"),
            unfreezeText: i18next.t("common:modules.controls.freeze.unfreeze"),
            name: i18next.t("common:modules.controls.freeze.freezeTable")
        });
    },

    setStyle: function (val) {
        this.set("uiStyle", val);
    },

    setView: function (val) {
        this.set("view", val);
    },

    setElement: function (val) {
        this.set("el", val);
    },

    startFreezeWin: function () {
        this.get("view").showFreezeWin();
    }
});

export default FreezeModel;
