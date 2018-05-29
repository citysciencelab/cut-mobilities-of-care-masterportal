define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        QueriesModel;

    QueriesModel = Backbone.Model.extend({
        defaults: {
            jahr: "",
            nutzung: "",
            produkt: "",
            lage: "",
            erbbaurecht: false
        },
        initialize: function () {
            this.listenTo(Radio.channel("LocalityModel"), {
                "newLage": this.setLage
            });
            this.listenTo(Radio.channel("YearModel"), {
                "newJahr": this.setJahr
            }, this);
            this.listenTo(Radio.channel("UseModel"), {
                "newNutzung": this.setNutzung
            }, this);
            this.listenTo(Radio.channel("ProductModel"), {
                "newProdukt": this.newProdukt
            }, this);
            this.listenTo(Radio.channel("LeaseModel"), {
                "newErbbaurecht": this.setErbbaurecht
            }, this);
        },
        setJahr: function (val) {
            this.set("jahr", val);
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
        },
        newProdukt: function (val) {
            this.set("produkt", val);
        },
        setLage: function (val) {
            this.set("lage", val);
        },
        setErbbaurecht: function (val) {
            this.set("erbbaurecht", val);
        },
        defaultErbbaurecht: function (val) {
            this.set("erbbaurecht", val, {silent: true});
        },
        reset: function () {
            this.set("jahr", ""),
            this.set("nutzung", ""),
            this.set("produkt", ""),
            this.set("lage", "");
            this.set("erbbaurecht", false);
        }
    });

    return QueriesModel;
});
