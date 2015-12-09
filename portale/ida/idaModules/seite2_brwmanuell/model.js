define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite2BRWModel = Backbone.Model.extend({
        defaults: {
            brwList: [],
            wpsWorkbenchnameWNUM: "IDABRWByWNUM"
        },
        initialize: function () {
            EventBus.on("seite2:newBRWList", this.setBRWList, this);

            EventBus.on("wps:response", this.saveBRW, this); // Result von wpsWorkbenchnameWNUM
        },
        setBRWList: function (val) {
            this.unset("brwList", {silent: true});
            this.set("brwList", val);
        },
        requestBRWDetails: function (wnum, jahrgang) {
            var dataInputs = "<wps:DataInputs>";

            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>wnum</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='string'>" + wnum + "</wps:LiteralData>";
            dataInputs += "</wps:Data>";
            dataInputs += "</wps:Input>";
            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>jahrgang</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='string'>" + jahrgang + "</wps:LiteralData>";
            dataInputs += "</wps:Data>";
            dataInputs += "</wps:Input>";
            dataInputs += "</wps:DataInputs>";
            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsWorkbenchnameWNUM"),
                dataInputs: dataInputs
            });
        },
        saveBRW: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameWNUM")) {
                var ergebnis = $(obj.data).find("wps\\:ergebnis,ergebnis");

                if ($(ergebnis[0]).children().length > 0) {
                    var parameter = $(obj.data).find("wps\\:parameter,parameter"),
                        jahrgang = $(parameter).attr("jahrgang"),
                        strassenname = $(ergebnis).find("wps\\:strassenname,strassenname")[0].textContent,
                        hausnummer = $(ergebnis).find("wps\\:hausnummer,hausnummer")[0].textContent,
                        zusatz = $(ergebnis).find("wps\\:zusatz,zusatz")[0].textContent,
                        brw = $(ergebnis).find("wps\\:brw,brw")[0].textContent,
                        wnum = $(ergebnis).find("wps\\:wnum,wnum")[0].textContent,
                        nutzung = $(ergebnis).find("wps\\:nutzung,nutzung")[0].textContent,
                        ortsteil = $(ergebnis).find("wps\\:ortsteil,ortsteil")[0].textContent,
                        stichtag = $(ergebnis).find("wps\\:stichtag,stichtag")[0].textContent,
                        entw = ergebnis.find("wps\\:entw,entw")[0].textContent,
                        beit = ergebnis.find("wps\\:beit,beit")[0].textContent,
                        nuta = ergebnis.find("wps\\:nuta,nuta")[0].textContent,
                        ergnuta = ergebnis.find("wps\\:ergnuta,ergnuta")[0].textContent,
                        wgfz = ergebnis.find("wps\\:wgfz,wgfz")[0].textContent,
                        bauw = ergebnis.find("wps\\:bauw,bauw")[0].textContent,
                        flae = ergebnis.find("wps\\:flae,flae")[0].textContent,
                        brwList = this.get("brwList");

                    _.each(brwList, function (obj) {
                        if (obj.bezeichnung === nutzung && obj.jahr === jahrgang) {
                            obj = _.extend(obj, {
                                brw: brw,
                                wnum: wnum,
                                ortsteil: ortsteil,
                                stichtag: stichtag,
                                entw: entw,
                                beit: beit,
                                nuta: nuta,
                                ergnuta: ergnuta,
                                wgfz: wgfz,
                                bauw: bauw,
                                flae: flae
                            });
                        }
                    });
                    EventBus.trigger("seite2:setBRWList", brwList);
                }
            }
        }
    });

    return new Seite2BRWModel();
});
