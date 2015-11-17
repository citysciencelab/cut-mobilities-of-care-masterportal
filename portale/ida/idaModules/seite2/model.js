define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite2Model = Backbone.Model.extend({
        defaults: {
            jahr: "",
            nutzung: "",
            produkt: "",
            lage: "",
            brwList: [],
            wpsWorkbenchnameListe: "IDAListeBodenrichtwerte",
            wpsWorkbenchnameDetails: "IDABRWZoneByAdresse"
        },
        initialize: function () {
            this.listenTo(this, "change:brwList", this.triggerBRWList);

            EventBus.on("wps:response", this.saveBRWList, this); // Result von wpsWorkbenchnameListe
            EventBus.on("wps:response", this.saveBRWDetails, this); // Result von wpsWorkbenchnameDetails
            EventBus.on("seite2:setBRWList", this.setBrwList, this);
        },
        triggerBRWList: function () {
            EventBus.trigger("seite2:newBRWList", this.get("brwList"));
        },
        requestBRWs: function () {
            var jahr = this.get("jahr"),
                nutzung = this.get("nutzung"),
                produkt = this.get("produkt"),
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
            this.set("brwList", []);
            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsWorkbenchnameListe"),
                dataInputs: dataInputs
            });
        },
        saveBRWList: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameListe")) {
                var brws = $(obj.data).find("wps\\:BRW,BRW"),
                    brwList = [];

                _.each(brws, function (brw) {
                    if (brw.getAttribute("bezeichnung")) {
                        brwList.push({
                            bezeichnung: brw.getAttribute("bezeichnung"),
                            jahr1: brw.getAttribute("jahr1"),
                            anteil1: brw.getAttribute("anteil1"),
                            jahr2: brw.getAttribute("jahr2"),
                            anteil2: brw.getAttribute("anteil2")
                        });
                    }
                });
                this.set("brwList", brwList);
                this.getBRWDetails();
            }
        },
        getBRWDetails: function () {
            var brwList = this.get("brwList");

            _.each(brwList, function (brw) {
                this.requestBRWDetails(brw);
            }.bind(this));
        },
        requestBRWDetails: function (brw) {
            if (brw.bezeichnung !== "") {
                var lage = this.get("lage"),
                    dataInputs,
                    jahre = [brw.jahr1, brw.jahr2],
                    i;

                for (i = 0; i < jahre.length; i++) {
                    dataInputs = "<wps:DataInputs>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>strassenschluessel</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.strassenschluessel + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>hausnummer</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.hausnummer + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>zusatz</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.hausnummerZusatz + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>rechtswert</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='float'>" + lage.rechtswert + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>hochwert</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='float'>" + lage.hochwert + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>nutzung</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.bezeichnung + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>jahrgang</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='integer'>" + jahre[i] + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "</wps:DataInputs>";
                    EventBus.trigger("wps:request", {
                        workbenchname: this.get("wpsWorkbenchnameDetails"),
                        dataInputs: dataInputs
                    });
                }
            }
        },
        saveBRWDetails: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameDetails")) {
                var ergebnis = $(obj.data).find("wps\\:Ergebnis,Ergebnis"),
                    parameter = $(obj.data).find("wps\\:Parameter,Parameter"),
                    nutzung = parameter[0].getAttribute("nutzung"),
                    jahrgang = parameter[0].getAttribute("jahrgang"),
                    brwList = this.get("brwList");

                if ($(ergebnis[0]).children().length > 0) {
                    var ortsteil = ergebnis.find("wps\\:ortsteil,ortsteil")[0].textContent,
                    wnum = ergebnis.find("wps\\:wnum,wnum")[0].textContent,
                    brw = ergebnis.find("wps\\:brw,brw")[0].textContent,
                    stichtag = ergebnis.find("wps\\:stichtag,stichtag")[0].textContent;

                    _.each(brwList, function (obj) {
                        if (obj.bezeichnung === nutzung) {
                            if (obj.jahr1 === jahrgang) {
                                obj = _.extend(obj, {
                                    brw1: brw,
                                    wnum1: wnum,
                                    ortsteil1: ortsteil,
                                    stichtag1: stichtag
                                });
                            }
                            else if (obj.jahr2 === jahrgang) {
                                obj = _.extend(obj, {
                                    brw2: brw,
                                    wnum2: wnum,
                                    ortsteil2: ortsteil,
                                    stichtag2: stichtag
                                });
                            }
                        }
                    });
                    this.set("brwList", []);
                    this.set("brwList", brwList);
                }
            }
        },
        setBrwList: function (brwList) {
            this.set("brwList", []);
            this.set("brwList", brwList);
        }
    });

    return new Seite2Model();
});
