define([
    "backbone",
    "eventbus",
    "modules/alerting/view"
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
        requestBRWDetails: function (wnum, stichtag, nutzung) {
            var dataInputs = "<wps:DataInputs>";

            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>idaIdent</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='string'>" + nutzung + "</wps:LiteralData>";
            dataInputs += "</wps:Data>";
            dataInputs += "</wps:Input>";
            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>wnum</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='string'>" + wnum + "</wps:LiteralData>";
            dataInputs += "</wps:Data>";
            dataInputs += "</wps:Input>";
            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>stichtag</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='string'>" + stichtag + "</wps:LiteralData>";
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
                        stichtag = $(parameter).attr("stichtag"),
                        idaIdent = $(parameter).attr("idaIdent"),
                        strassenname = $(ergebnis).find("wps\\:strassenname,strassenname")[0].textContent,
                        hausnummer = $(ergebnis).find("wps\\:hausnummer,hausnummer")[0].textContent,
                        zusatz = $(ergebnis).find("wps\\:zusatz,zusatz")[0].textContent,
                        brw = ergebnis.find("wps\\:brw,brw")[0].textContent ? parseFloat(ergebnis.find("wps\\:brw,brw")[0].textContent.replace(/,/, ".")) : "",
                        wnum = $(ergebnis).find("wps\\:wnum,wnum")[0].textContent,
                        ortsteil = $(ergebnis).find("wps\\:ortsteil,ortsteil")[0].textContent,
                        entw = ergebnis.find("wps\\:entw,entw")[0].textContent,
                        beit = ergebnis.find("wps\\:beit,beit")[0].textContent,
                        nuta = ergebnis.find("wps\\:nuta,nuta")[0].textContent,
                        ergnuta = ergebnis.find("wps\\:ergnuta,ergnuta")[0].textContent,
                        wgfz = ergebnis.find("wps\\:wgfz,wgfz")[0].textContent ? parseFloat(ergebnis.find("wps\\:wgfz,wgfz")[0].textContent.replace(/,/, ".")) : "",
                        bauw = ergebnis.find("wps\\:bauw,bauw")[0].textContent,
                        flae = ergebnis.find("wps\\:flae,flae")[0].textContent ? parseFloat(ergebnis.find("wps\\:flae,flae")[0].textContent.replace(/,/, ".")) : "",
                        frei = ergebnis.find("wps\\:frei,frei")[0].textContent ? ergebnis.find("wps\\:frei,frei")[0].textContent.split(";") : [],
                        nWohnW = frei[6] && frei[6].trim() != "" ? parseFloat(frei[6].replace(/,/, ".").trim()) : "",
                        nBueroW = frei[7] && frei[7].trim() != "" ? parseFloat(frei[7].replace(/,/, ".").trim()) : "",
                        nLadenW = frei[8] && frei[8].trim() != "" ? parseFloat(frei[8].replace(/,/, ".").trim()) : "",
                        egnutzung = frei[12] && frei[12].trim() != "" ? frei[12].trim().charAt(0) : "",
                        eggfzAnt = frei[13] && frei[13].trim() != "" ? parseFloat(frei[13].replace(/,/, ".").trim()) : "",
                        egw = frei[14] && frei[14].trim() != "" ? parseFloat(frei[14].replace(/,/, ".").trim()) : "",
                        ignutzung = frei[15] && frei[15].trim() != "" ? frei[15].trim().charAt(0) : "",
                        iggfzAnt = frei[16] && frei[16].trim() != "" ? parseFloat(frei[16].replace(/,/, ".").trim()) : "",
                        igw = frei[17] && frei[17].trim() != "" ? parseFloat(frei[17].replace(/,/, ".").trim()) : "",
                        zgnutzung = frei[18] && frei[18].trim() != "" ? frei[18].trim().charAt(0) : "",
                        zggfzAnt = frei[19] && frei[19].trim() != "" ? parseFloat(frei[19].replace(/,/, ".").trim()) : "",
                        zgw = frei[20] && frei[20].trim() != "" ? parseFloat(frei[20].replace(/,/, ".").trim()) : "",
                        ognutzung = frei[21] && frei[21].trim() != "" ? frei[21].trim().charAt(0) : "",
                        oggfzAnt = frei[22] && frei[22].trim() != "" ? parseFloat(frei[22].replace(/,/, ".").trim()) : "",
                        ogw = frei[23] && frei[23].trim() != "" ? parseFloat(frei[23].replace(/,/, ".").trim()) : "";

                    _.each(this.get("brwList"), function (obj) {
                        if (obj.nutzung === idaIdent && obj.stichtag === stichtag) {
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
                                nWohnW: nWohnW,
                                nBueroW: nBueroW,
                                nLadenW: nLadenW,
                                egnutzung: egnutzung,
                                eggfzAnt: eggfzAnt,
                                egw: egw,
                                ignutzung: ignutzung,
                                iggfzAnt: iggfzAnt,
                                igw: igw,
                                zgnutzung: zgnutzung,
                                zggfzAnt: zggfzAnt,
                                zgw: zgw,
                                ognutzung: ognutzung,
                                oggfzAnt: oggfzAnt,
                                ogw: ogw,
                                ermittlungsart: "WNUM"
                            });
                        }
                    });
                    EventBus.trigger("seite2:setBRWList", this.get("brwList"));
                }
                else {
                    EventBus.trigger("alert", "Die eingegebene BRW-Nummer existiert nicht zum Stichtag.");
                }
            }
        }
    });

    return new Seite2BRWModel();
});
