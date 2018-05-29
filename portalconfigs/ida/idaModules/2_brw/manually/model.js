define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ManuallyModel;

    ManuallyModel = Backbone.Model.extend({
        defaults: {
            brwList: [],
            wpsWorkbenchnameWNUM: "IDABRWByWNUM",
            jahr: "",
            nutzung: "",
            produkt: ""
        },
        initialize: function () {
            var channel = Radio.channel("ManuallyModel");

            channel.on({
                "newBRWList": this.setBRWList
            }, this);

            this.listenTo(Radio.channel("WPS"), {
                "response": this.saveBRW // Result von wpsWorkbenchnameWNUM
            }, this);
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
            Radio.trigger("WPS", "request", {
                workbenchname: this.get("wpsWorkbenchnameWNUM"),
                dataInputs: dataInputs
            });
        },
        saveBRW: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameWNUM")) {
                var ergebnis = $(obj.data).find("wps\\:ergebnis,ergebnis"),
                    parameter = $(obj.data).find("wps\\:parameter,parameter");

                if ($(ergebnis[0]).children().length > 0) {
                    var stichtag = $(parameter).attr("stichtag"),
                        idaIdent = $(parameter).attr("idaIdent"),
                        brwValues = ergebnis.find("wps\\:brwvalues,brwvalues"),
                        brw = brwValues.find("wps\\:brw,brw")[0].textContent ? parseFloat(brwValues.find("wps\\:brw,brw")[0].textContent.replace(/,/, ".")) : "",
                        wnum = $(brwValues).find("wps\\:wnum,wnum")[0].textContent,
                        entw = brwValues.find("wps\\:entw,entw")[0].textContent,
                        beit = brwValues.find("wps\\:beit,beit")[0].textContent,
                        nuta = brwValues.find("wps\\:nuta,nuta")[0].textContent,
                        ergnuta = brwValues.find("wps\\:ergnuta,ergnuta")[0].textContent,
                        wgfz = brwValues.find("wps\\:wgfz,wgfz")[0].textContent ? parseFloat(brwValues.find("wps\\:wgfz,wgfz")[0].textContent.replace(/,/, ".")) : "",
                        bauw = brwValues.find("wps\\:bauw,bauw")[0].textContent,
                        flae = brwValues.find("wps\\:flae,flae")[0].textContent ? parseFloat(brwValues.find("wps\\:flae,flae")[0].textContent.replace(/,/, ".")) : "",
                        acza = brwValues.find("wps\\:acza,acza")[0].textContent ? parseFloat(brwValues.find("wps\\:acza,acza")[0].textContent.replace(/,/, ".")) : "",
                        grza = brwValues.find("wps\\:grza,grza")[0].textContent ? parseFloat(brwValues.find("wps\\:grza,grza")[0].textContent.replace(/,/, ".")) : "",
                        frei = brwValues.find("wps\\:frei,frei")[0].textContent ? brwValues.find("wps\\:frei,frei")[0].textContent.split(";") : [],
                        brwGruppeNr = frei[1] && frei[1].trim() !== "" ? parseFloat(frei[1].replace(/,/, ".").trim()) : "",
                        nWohnW = frei[6] && frei[6].trim() !== "" ? parseFloat(frei[6].replace(/,/, ".").trim()) : "",
                        nBueroW = frei[7] && frei[7].trim() !== "" ? parseFloat(frei[7].replace(/,/, ".").trim()) : "",
                        nLadenW = frei[8] && frei[8].trim() !== "" ? parseFloat(frei[8].replace(/,/, ".").trim()) : "",
                        ugnutzung = frei[9] && frei[9].trim() !== "" ? frei[9].trim().charAt(0) : "",
                        uggfzAnt = frei[10] && frei[10].trim() !== "" ? parseFloat(frei[10].replace(/,/, ".").trim()) : "",
                        ugw = frei[11] && frei[11].trim() !== "" ? parseFloat(frei[11].replace(/,/, ".").trim()) : "",
                        egnutzung = frei[12] && frei[12].trim() !== "" ? frei[12].trim().charAt(0) : "",
                        eggfzAnt = frei[13] && frei[13].trim() !== "" ? parseFloat(frei[13].replace(/,/, ".").trim()) : "",
                        egw = frei[14] && frei[14].trim() !== "" ? parseFloat(frei[14].replace(/,/, ".").trim()) : "",
                        ignutzung = frei[15] && frei[15].trim() !== "" ? frei[15].trim().charAt(0) : "",
                        iggfzAnt = frei[16] && frei[16].trim() !== "" ? parseFloat(frei[16].replace(/,/, ".").trim()) : "",
                        igw = frei[17] && frei[17].trim() !== "" ? parseFloat(frei[17].replace(/,/, ".").trim()) : "",
                        zgnutzung = frei[18] && frei[18].trim() !== "" ? frei[18].trim().charAt(0) : "",
                        zggfzAnt = frei[19] && frei[19].trim() !== "" ? parseFloat(frei[19].replace(/,/, ".").trim()) : "",
                        zgw = frei[20] && frei[20].trim() !== "" ? parseFloat(frei[20].replace(/,/, ".").trim()) : "",
                        ognutzung = frei[21] && frei[21].trim() !== "" ? frei[21].trim().charAt(0) : "",
                        oggfzAnt = frei[22] && frei[22].trim() !== "" ? parseFloat(frei[22].replace(/,/, ".").trim()) : "",
                        ogw = frei[23] && frei[23].trim() !== "" ? parseFloat(frei[23].replace(/,/, ".").trim()) : "",
                        brwLage = ergebnis.find("wps\\:brwlage,brwlage"),
                        adresse = brwLage.find("wps\\:adresse,adresse")[0].textContent,
                        plz = brwLage.find("wps\\:plz,plz")[0].textContent,
                        bezirk = brwLage.find("wps\\:bezirk,bezirk")[0].textContent,
                        stadtteil = brwLage.find("wps\\:stadtteil,stadtteil")[0].textContent,
                        statistikGebiet = brwLage.find("wps\\:statistikgebiet,adstatistikgebietresse")[0].textContent,
                        baublock = brwLage.find("wps\\:baublock,baublock")[0].textContent,
                        weitereLage = brwLage.find("wps\\:weiterelage,weiterelage")[0].textContent,
                        x = brwLage.find("wps\\:x,x")[0].textContent,
                        y = brwLage.find("wps\\:y,y")[0].textContent;

                    _.each(this.get("brwList"), function (obj) {
                        if (obj.nutzung === idaIdent && obj.stichtag === stichtag) {
                            // Gültigkeitsprüfung des eingegebenen BRW
                            if (idaIdent === "MFH" && ergnuta === "WGH" && nWohnW === "") {
                                Radio.trigger("Alert", "alert", {
                                    text: "<strong>Der angegebene Bodenrichtwert für eine " +
                                        "gemischte Nutzung kann nicht auf monofunktionale Nutzungen aufgeschlüsselt werden.</strong> " +
                                        "Bitte wählen Sie einen monofunktionalen Bodenrichtwert.",
                                    kategorie: "alert-danger",
                                    position: "center-center"
                                });
                            }
                            else if (idaIdent === "BH" && (ergnuta === "WGH" || ergnuta === "BGH" || ergnuta === "EKZ") && nBueroW === "") {
                                Radio.trigger("Alert", "alert", {
                                    text: "<strong>Der angegebene Bodenrichtwert für eine " +
                                        "gemischte Nutzung kann nicht auf monofunktionale Nutzungen aufgeschlüsselt werden.</strong> " +
                                        "Bitte wählen Sie einen monofunktionalen Bodenrichtwert.",
                                    kategorie: "alert-danger",
                                    position: "center-center"
                                });
                            }
                            else if ((this.get("produkt") === "BR" || this.get("produkt") === "BW") && this.get("jahr") >= 1983 && this.get("jahr") <= 1992 && (this.get("nutzung") === "ETW" || this.get("nutzung") === "TG" || this.get("nutzung") === "GAR" || this.get("nutzung") === "STP") && (brwGruppeNr !== 42 || brwGruppeNr !== 53)) {
                                Radio.trigger("Alert", "alert", {
                                    text: "<strong>Der angegebene Bodenrichtwert bezieht sich nicht auf Eigentumswohnungen.</strong> " +
                                        "Bitte wählen Sie einen BRW mit dem Zusatz ETW.",
                                    kategorie: "alert-danger",
                                    position: "center-center"
                                });
                            }
                            // gültig
                            else {
                                Radio.trigger("Alert", "alert:remove");
                                obj = _.extend(obj, {
                                    brwValues: {
                                        acza: acza,
                                        grza: grza,
                                        brw: brw,
                                        wnum: wnum,
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
                                        ugnutzung: ugnutzung,
                                        uggfzAnt: uggfzAnt,
                                        ugw: ugw,
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
                                        ogw: ogw
                                    },
                                    brwLage: {
                                        adresse: adresse,
                                        plz: plz,
                                        bezirk: bezirk,
                                        stadtteil: stadtteil,
                                        statistikGebiet: statistikGebiet,
                                        baublock: baublock,
                                        weitereLage: weitereLage,
                                        x: x,
                                        y: y
                                    },
                                    ermittlungsart: "WNUM"
                                });
                            }
                        }
                    }, this);
                    Radio.trigger("BRWModel", "setBRWList", this.get("brwList"));
                }
                else {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Fehler bei der BRW-Abfrage aufgetreten.</strong> " +
                            "Bitte versuchen Sie es erneut.",
                        kategorie: "alert-danger",
                        position: "center-center"
                    });
                }
            }
        },
        /**
         * Zerstört das Modul vollständig
         * remove Radio-Listener
         * remove Backbone-Listener
         * clear Attributes
         */
        destroy: function () {
            this.stopListening();
            this.off();
            this.clear();
        }
    });

    return ManuallyModel;
});
