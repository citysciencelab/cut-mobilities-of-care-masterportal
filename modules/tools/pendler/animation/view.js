import AnimationTemplate from "text-loader!./template.html";

const AnimationView = Backbone.View.extend({
    events: {
        "click .start": "start",
        "click .reset": "reset",
        "click .csv-download": "createAlertBeforeDownload",
        "click .btn-remove-features": "removeFeatures",
        "change #select-kreis": "setKreis",
        "change #pendler-check-gemeinde": "checkGemeinde",
        "change #select-gemeinde": "setGemeinde",
        "change #select-trefferAnzahl": "setTrefferAnzahl",
        "change input[type=radio]": "setDirection",
        "mouseover #mouseOverTarget": "onRadioLabelMouseover",
        "mouseout #mouseOverTarget": "onRadioLabelMouseout",
        "click #mouseOverTarget": "onRadioLabelClick"
    },

    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            // ändert sich eins dieser Attribute wird neu gezeichnet
            "change:gemeinden change:gemeinde change:trefferAnzahl change:direction change:emptyResult change:animating change:pendlerLegend change:featureType": this.render,
            "render": this.render,
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            }
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.model.changeLang
        });
        this.model.set({
            "workplace": i18next.t("common:modules.tools.pendler.animation.workplace"),
            "domicile": i18next.t("common:modules.tools.pendler.animation.domicile"),
            "chooseDistrict": i18next.t("common:modules.tools.pendler.animation.chooseDistrict"),
            "chooseBorough": i18next.t("common:modules.tools.pendler.animation.chooseBorough"),
            "relationshipsToDisplay": i18next.t("common:modules.tools.pendler.animation.relationshipsToDisplay"),
            "deleteGeometries": i18next.t("common:modules.tools.pendler.animation.deleteGeometries"),
            "noCommutersKnown": i18next.t("common:modules.tools.pendler.animation.noCommutersKnown"),
            "people": i18next.t("common:modules.tools.pendler.animation.people"),
            "csvDownload": i18next.t("common:modules.tools.pendler.animation.csvDownload"),
            "reset": i18next.t("common:modules.tools.pendler.animation.reset"),
            "start": i18next.t("common:modules.tools.pendler.animation.start"),
            "top5": i18next.t("common:modules.tools.pendler.animation.top5"),
            "top10": i18next.t("common:modules.tools.pendler.animation.top10"),
            "top15": i18next.t("common:modules.tools.pendler.animation.top15")
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

    checkGemeinde: function (evt) {
        if (evt.currentTarget.checked === true) {
            this.model.setFeatureType(this.model.get("wfsappGemeinde"));
        }
        else {
            this.model.setFeatureType(this.model.get("wfsappKreise"));
        }
    },

    setGemeinde: function (evt) {
        this.model.setGemeinde(evt.target.value);
    },

    setTrefferAnzahl: function (evt) {
        this.model.setTrefferAnzahl(evt.target.value);
    },

    setDirection: function (evt) {
        this.model.setDirection(evt.target.value);
    },

    onRadioLabelClick: function () {
        document.querySelector("#select-gemeinde").style.border = "1px solid red";
    },

    onRadioLabelMouseover: function () {
        document.querySelector(".tooltip .tooltiptext").style.visibility = "visible";
    },

    onRadioLabelMouseout: function () {
        document.querySelector(".tooltip .tooltiptext").style.visibility = "hidden";
    }
});

export default AnimationView;
