define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite2Model = Backbone.Model.extend({
        defaults: {
            jahr: "", // Benutzereingabe
            nutzung: "", // Benutzereingabe
            produkt: "", // Benutzereingabe
            lage: "",
            brwList: [],
            params: {
                DATU: false,
                StadtteilName: false,
                NormBRW: false,
                AktBRW: false,
                WGFZ: false,
                FLAE: false,
                BAUW: false,
                STRL: false,
                GESL: false,
                BAUJ: false,
                MODG: false,
                WOFL: false,
                ZAWO: false,
                GARI: false,
                GARA: false,
                STEA: false,
                EGFL: false,
                OGFL: false,
                WONKM: false,
                SONKM: false,
                RLZ: false,
                JEZ: false,
                Par24: false,
                ENER: false,
                Par26: false,
                EBK: false
            },
            complete: false,
            wpsWorkbenchnameListe: "IDAListeBodenrichtwerte",
            wpsWorkbenchnameDetailsAdresse: "IDABRWZoneByAdresse",
            wpsWorkbenchnameDetailsFlurstueck: "IDABRWZoneByFlurstueck"
        },
        initialize: function () {
            this.listenTo(this, "change:brwList", this.checkBRWList);

            EventBus.on("wps:response", this.handleNecessaryData, this); // Result von wpsWorkbenchnameListe
            EventBus.on("wps:response", this.saveBRWDetails, this); // Result von wpsWorkbenchnameDetails
            EventBus.on("seite2:setBRWList", this.setBrwList, this);
        },
        /*
        * Prüft, ob alle BRW gefunden wurden und setzt ggf. complete auf true oder öffnet die Seite zur manuellen Eingabe.
        */
        checkBRWList: function () {
            var brwList = this.get("brwList"),
                complete = true;

            complete = _.every(brwList, function (brw) {
                return (brw.art && brw.brw && brw.anteil && brw.wnum && brw.bezeichnung && brw.stichtag && brw.ortsteil);
            });
            if (complete === true) {
                this.set("complete", true);
            }
            else {
                EventBus.trigger("seite2:newBRWList", brwList);
            }
        },
        requestNecessaryData: function () {
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
        handleNecessaryData: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameListe")) {
                var brws = $(obj.data).find("wps\\:BRW,BRW"),
                    params = $(obj.data).find("wps\\:Params,Params")[0],
                    brwList = [];

                // speichere benötigte Parameter ab
                _.each(params.attributes, function (att) {
                    var attrObj = this.get("params"),
                        newObj = _.extend(attrObj, _.object([att.name], [Boolean(att.value === "True")]));

                    this.set("params", newObj);
                }, this);
                // speichere benötigte BRW ab
                _.each(brws, function (brw) {
                    if (brw.getAttribute("bezeichnung")) {
                        brwList.push({
                            art: brw.getAttribute("art"),
                            bezeichnung: brw.getAttribute("bezeichnung"),
                            anteil: brw.getAttribute("anteil"),
                            stichtag: brw.getAttribute("stichtag")
                        });
                    }
                });
                this.set("brwList", brwList);
                if (brwList.length > 0) {
                    this.getBRWDetails();
                }
                else {
                    this.set("complete", true);
                }
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
                    dataInputs;

                if (lage.type === "Flurstück") {
                    dataInputs = "<wps:DataInputs>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>gemarkung</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.gemarkung + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>flurstueck</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.flurstueck + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>strassendefinition</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.strassendefinition + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>nutzung</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.bezeichnung + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>stichtag</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.stichtag + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "</wps:DataInputs>";
                    EventBus.trigger("wps:request", {
                        workbenchname: this.get("wpsWorkbenchnameDetailsFlurstueck"),
                        dataInputs: dataInputs
                    });
                }
                else if (lage.type === "Adresse") {
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
                    dataInputs += "<ows:Identifier>stichtag</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.stichtag + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "</wps:DataInputs>";
                    EventBus.trigger("wps:request", {
                        workbenchname: this.get("wpsWorkbenchnameDetailsAdresse"),
                        dataInputs: dataInputs
                    });
                }
            }
        },
        saveBRWDetails: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameDetailsAdresse") || obj.request.workbenchname === this.get("wpsWorkbenchnameDetailsFlurstueck")) {
                var ergebnis = $(obj.data).find("wps\\:Ergebnis,Ergebnis"),
                    parameter = $(obj.data).find("wps\\:Parameter,Parameter"),
                    nutzung = parameter[0].getAttribute("nutzung"),
                    brwList = this.get("brwList");

                if ($(ergebnis[0]).children().length > 0) {
                    var ortsteil = ergebnis.find("wps\\:ortsteil,ortsteil")[0].textContent,
                    wnum = ergebnis.find("wps\\:wnum,wnum")[0].textContent,
                    brw = ergebnis.find("wps\\:brw,brw")[0].textContent,
                    entw = ergebnis.find("wps\\:entw,entw")[0].textContent,
                    beit = ergebnis.find("wps\\:beit,beit")[0].textContent,
                    nuta = ergebnis.find("wps\\:nuta,nuta")[0].textContent,
                    ergnuta = ergebnis.find("wps\\:ergnuta,ergnuta")[0].textContent,
                    wgfz = ergebnis.find("wps\\:wgfz,wgfz")[0].textContent,
                    bauw = ergebnis.find("wps\\:bauw,bauw")[0].textContent,
                    flae = ergebnis.find("wps\\:flae,flae")[0].textContent,
                    stichtag = ergebnis.find("wps\\:stichtag,stichtag")[0].textContent;

                    _.each(brwList, function (obj) {
                        if (obj.bezeichnung === nutzung && obj.stichtag === stichtag) {
                            obj = _.extend(obj, {
                                brw: brw,
                                wnum: wnum,
                                ortsteil: ortsteil,
                                entw: entw,
                                beit: beit,
                                nuta: nuta,
                                ergnuta: ergnuta,
                                wgfz: wgfz,
                                bauw: bauw,
                                flae: flae,
                                ermittlungsart: this.get("lage").type
                            });
                        }
                    }, this);
                    this.unset("brwList", {silent: true});
                    this.set("brwList", brwList);
                }
            }
        },
        setBrwList: function (brwList) {
            this.unset("brwList", {silent: true});
            this.set("brwList", brwList);
        }
    });

    return new Seite2Model();
});
