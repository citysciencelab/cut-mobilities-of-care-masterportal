define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {
    "use strict";
    var Seite1NutzungModel = Backbone.Model.extend({
        defaults: {
            produkt: "",
            nutzung: "",
            jahr: ""
        },
        initialize: function () {
            EventBus.on("seite1_nutzung:newNutzung", this.setNutzung, this);

            EventBus.on("seite1_jahr:newJahr", this.setJahr, this);

            EventBus.on("wps:response", this.setProdukte, this);
        },
        setProdukte: function (obj) {
            $("#produktdropdown").empty();
            var werte = $(obj.data).find("wps\\:wert,wert");

            _.each(werte, function (wert) {
                var id = wert.getAttribute("id"),
                    text = wert.getAttribute("text"),
                    option = new Option(text, id);

                $("#produktdropdown").append($(option));
            });
            this.setProdukt();
        },
        setProdukt: function (val) {
            this.set("produkt", $("#produktdropdown")[0].value);
            EventBus.trigger("seite1_produkt:newProdukt", $("#produktdropdown")[0].value);
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            this.getProdukte();
        },
        setJahr: function (val) {
            this.set("jahr", val);
            this.getProdukte();
        },
        getProdukte: function () {
            var jahr = this.get("jahr"),
                nutzung = this.get("nutzung"),
                dataInputs = "";

            if (jahr !== "" && nutzung !== "") {
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
                dataInputs += "<wps:LiteralData dataType='strung'>" + nutzung + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "</wps:DataInputs>";
                EventBus.trigger("wps:request", {
                    workbenchname: "IDAWertarten",
                    dataInputs: dataInputs
                });
            }
            else {
                $("#produktdropdown").empty();
                this.set("produkt", "");
                EventBus.trigger("seite1_produkt:newProdukt", "");
            }
        }
    });

    return new Seite1NutzungModel();
});
