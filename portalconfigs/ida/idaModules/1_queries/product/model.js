define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ProductModel;

    ProductModel = Backbone.Model.extend({
        defaults: {
            produkte: [],
            produkt: "",
            nutzung: "",
            jahr: "",
            erbbaurecht: false,
            wpsWorkbenchname: "IDAWertarten"
        },
        initialize: function () {
            var channel = Radio.channel("ProductModel");

            this.listenTo(this, {
                "change:produkt": function () {
                    channel.trigger("newProdukt", this.getProdukt());
                }
            });
            this.listenTo(Radio.channel("WPS"), {
                "response": this.setProdukte
            }, this);

            this.listenTo(Radio.channel("UseModel"), {
                "newNutzung": this.setNutzung
            }, this);

            this.listenTo(Radio.channel("YearModel"), {
                "newJahr": this.setJahr
            }, this);
            this.listenTo(Radio.channel("LeaseModel"), {
                "newErbbaurecht": this.setErbbaurecht
            }, this);
        },
        setProdukte: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchname")) {
                var werte = $(obj.data).find("wps\\:wert,wert"),
                    produkte = [];

                if (werte.length === 0) {
                    this.unset("produkte", {silent: true});
                    this.set("produkte", []);
                    this.setProdukt("");
                }
                else {
                    _.each(werte, function (wert) {
                        var id = wert.getAttribute("id"),
                            text = wert.getAttribute("text"),
                            info = wert.getAttribute("info");

                        produkte.push({
                            id: id,
                            value: text,
                            info: info
                        });
                    });
                    this.set("produkte", produkte);
                }
            }
        },
        setProdukt: function (value) {
            this.set("produkt", value);
            this.set("header", value);
        },
        getProdukt: function () {
            return this.get("produkt");
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            this.getProdukte();
        },
        setErbbaurecht: function (val) {
            this.set("erbbaurecht", val);
            this.getProdukte();
        },
        setJahr: function (val) {
            this.set("jahr", val);
            this.getProdukte();
        },
        getProdukte: function () {
            var jahr = this.get("jahr"),
                nutzung = this.get("nutzung"),
                erbbaurecht = this.get("erbbaurecht"),
                dataInputs = "";

            if (jahr !== "" && nutzung !== "" && erbbaurecht !== "") {
                dataInputs = "<wps:DataInputs>";
                dataInputs += "<wps:Input>";
                dataInputs += "<ows:Identifier>jahr</ows:Identifier>";
                dataInputs += "<wps:Data>";
                dataInputs += "<wps:LiteralData dataType='integer'>" + jahr + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "<wps:Input>";
                dataInputs += "<ows:Identifier>nutzung</ows:Identifier>";
                dataInputs += "<wps:Data>";
                dataInputs += "<wps:LiteralData dataType='string'>" + nutzung + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "<wps:Input>";
                dataInputs += "<ows:Identifier>erbbaurecht</ows:Identifier>";
                dataInputs += "<wps:Data>";
                dataInputs += "<wps:LiteralData dataType='boolean'>" + erbbaurecht + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "</wps:DataInputs>";
                Radio.trigger("WPS", "request", {
                    workbenchname: this.get("wpsWorkbenchname"),
                    dataInputs: dataInputs
                });
            }
            else {
                this.set("produkte", []);
                this.setProdukt("");
            }
        }
    });

    return ProductModel;
});
