define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite1Model = Backbone.Model.extend({
        defaults: {
            jahr: "",
            nutzung: "",
            produkt: "",
            lage: {},
            wpsWorkbenchname: "IDAListeBodenrichtwerte"
        },
        initialize: function () {
            EventBus.on("seite1_lage:newLage", this.setLage, this);

            EventBus.on("seite1_jahr:newJahr", this.setJahr, this);

            EventBus.on("seite1_nutzung:newNutzung", this.setNutzung, this);

            EventBus.on("seite1_produkt:newProdukt", this.newProdukt, this);

            EventBus.on("wps:response", this.showNeededBRW, this);
        },
        setJahr: function (val) {
            this.set("jahr", val);
            this.checkParameter();
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            this.checkParameter();
        },
        newProdukt: function (val) {
            this.set("produkt", val);
            this.checkParameter();
        },
        setLage: function (val) {
            this.set("lage", val);
            this.checkParameter();
        },
        checkParameter: function () {
            if (this.get("jahr") !== "" && this.get("nutzung") !== "" && this.get("produkt") !== "" && this.get("lage") !== "") {
                $("#seite1_weiter").prop("disabled", false);
            }
            else {
                $("#seite1_weiter").prop("disabled", true);
            }
        },
        requestBRWs: function () {
            var jahr = this.get("jahr"),
                nutzung = this.get("nutzung"),
                produkt = this.get("produkt"),
                dataInputs = "";

            if (jahr !== "" && nutzung !== "" && produkt != "") {
                dataInputs = "<wps:DataInputs>";
                dataInputs += "<wps:Input>";
                dataInputs += "<ows:Identifier>nutzung</ows:Identifier>";
                dataInputs += "<wps:Data>";
                dataInputs += "<wps:LiteralData dataType='string'>" + nutzung + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "<wps:Input>";
                dataInputs += "<ows:Identifier>produkt</ows:Identifier>";
                dataInputs += "<wps:Data>";
                dataInputs += "<wps:LiteralData dataType='string'>" + produkt + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "<wps:Input>";
                dataInputs += "<ows:Identifier>jahr</ows:Identifier>";
                dataInputs += "<wps:Data>";
                dataInputs += "<wps:LiteralData dataType='integer'>" + jahr + "</wps:LiteralData>";
                dataInputs += "</wps:Data>";
                dataInputs += "</wps:Input>";
                dataInputs += "</wps:DataInputs>";
                EventBus.trigger("wps:request", {
                    workbenchname: this.get("wpsWorkbenchname"),
                    dataInputs: dataInputs
                });
            }
            else {
                this.showNeededBRW();
            }
        },
        showNeededBRW: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchname")) {
                console.log(obj);
            }
        }
    });

    return new Seite1Model();
});
