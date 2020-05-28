import AnimationTemplate from "text-loader!./template.html";

const AnimationView = Backbone.View.extend({
    events: {
        "click .start": "start",
        "click .reset": "reset",
        "click .csv-download": "createAlertBeforeDownload",
        "click .btn-remove-features": "removeFeatures",
        "change #select-kreis": "setKreis",
        "change #select-gemeinde": "setGemeinde",
        "change #select-trefferAnzahl": "setTrefferAnzahl",
        "change input[type=radio]": "setDirection"
    },

    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            // ändert sich eins dieser Attribute wird neu gezeichnet
            "change:gemeinden change:gemeinde change:trefferAnzahl change:direction change:emptyResult change:animating change:pendlerLegend": this.render,
            "render": this.render,
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            }
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.model.changeLang
        });
        this.model.set({
            "workplace": i18next.t("common:modules.tools.pendler.lines.workplace"),
            "domicile": i18next.t("common:modules.tools.pendler.lines.domicile"),
            "chooseDistrict": i18next.t("common:modules.tools.pendler.lines.chooseDistrict"),
            "chooseBorough": i18next.t("common:modules.tools.pendler.lines.chooseBorough"),
            "relationshipsToDisplay": i18next.t("common:modules.tools.pendler.lines.relationshipsToDisplay"),
            "deleteGeometries": i18next.t("common:modules.tools.pendler.lines.deleteGeometries"),
            "noCommutersKnown": i18next.t("common:modules.tools.pendler.lines.noCommutersKnown"),
            "people": i18next.t("common:modules.tools.pendler.lines.people"),
            "csvDownload": i18next.t("common:modules.tools.pendler.lines.csvDownload"),
            "reset": i18next.t("common:modules.tools.pendler.lines.reset"),
            "start": i18next.t("common:modules.tools.pendler.lines.start")
        });
    },

    tagName: "form",
    id: "animation-tool",
    template: _.template(AnimationTemplate),

    render: function (model, value) {
        if (value || !model.get("animating")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },
    removeFeatures: function () {
        this.model.clear();
    },
    start: function () {
        this.model.prepareAnimation();
    },
    reset: function () {
        this.model.stopAnimation();
    },
    createAlertBeforeDownload: function () {
        this.model.createAlertBeforeDownload();
    },

    setKreis: function (evt) {
        this.model.setKreis(evt.target.value);
    },

    setGemeinde: function (evt) {
        this.model.setGemeinde(evt.target.value);
    },

    setTrefferAnzahl: function (evt) {
        this.model.setTrefferAnzahl(evt.target.value);
    },

    setDirection: function (evt) {
        this.model.setDirection(evt.target.value);
    }
});

export default AnimationView;
