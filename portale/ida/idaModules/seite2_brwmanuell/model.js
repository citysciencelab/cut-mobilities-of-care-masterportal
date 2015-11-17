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
                        brwList = this.get("brwList");

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
                    EventBus.trigger("seite2:setBRWList", brwList);
                }
            }
        }
    });

    return new Seite2BRWModel();
});
