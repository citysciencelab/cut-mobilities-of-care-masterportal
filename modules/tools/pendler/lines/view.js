import LinesTemplate from "text-loader!./template.html";

const LinesView = Backbone.View.extend({
    events: {
        "change #select-kreis": "setKreis",
        "change #select-gemeinde": "setGemeinde",
        "change #select-trefferAnzahl": "setTrefferAnzahl",
        "change input[type=radio]": "setDirection",
        "click .csv-download": "createAlertBeforeDownload",
        "click .btn-remove-features": "removeFeatures"
    },

    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            // ändert sich eins dieser Attribute wird neu gezeichnet
            "change:gemeinden change:gemeinde change:trefferAnzahl change:direction change:animating change:emptyResult change:pendlerLegend": this.render,
            "render": this.render,
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            }
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.model.changeLang
        });
    },

    tagName: "form",
    id: "lines-tool",
    template: _.template(LinesTemplate),

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

export default LinesView;
