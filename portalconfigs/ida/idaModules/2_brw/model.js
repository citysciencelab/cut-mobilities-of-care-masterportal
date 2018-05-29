define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        BRWModel;

    BRWModel = Backbone.Model.extend({
        defaults: {
            jahr: "", // Benutzereingabe
            nutzung: "", // Benutzereingabe
            produkt: "", // Benutzereingabe
            lage: "",
            erbbaurecht: "", // besteht ein Erbbaurecht auf Grundstück? Bestimmt die abzufragenden BRW und Parameter.
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
            var channel = Radio.channel("BRWModel");

            channel.on({
                "setBRWList": this.setBRWList
            }, this);

            this.listenTo(this, "change:brwList", this.checkBRWList);

            this.listenTo(Radio.channel("WPS"), {
                "response": function (obj) {
                    this.handleNecessaryData(obj); // Result von wpsWorkbenchnameListe
                    this.saveBRWDetails(obj); // Result von wpsWorkbenchnameDetails
                }
            }, this);
        },
        /*
        * Prüft, ob alle BRW gefunden wurden und setzt ggf. complete auf true oder öffnet die Seite zur manuellen Eingabe.
        */
        checkBRWList: function () {
            var brwList = this.get("brwList"),
                complete = true;

            complete = _.every(brwList, function (brw) {
                return (brw.brwValues && brw.brwLage); // brwValues und brwLage sind Objekte innerhalb des Objekts "brw", die erst nach erfolgreicher Suche angefügt worden sind.
            });
            if (complete === true) {
                this.unset("complete", {silent: true});
                this.set("complete", true);
            }
            else {
                Radio.trigger("ManuallyModel", "newBRWList", brwList);
            }
        },
        requestNecessaryData: function () {
            var jahr = this.get("jahr"),
                nutzung = this.get("nutzung"),
                produkt = this.get("produkt"),
                erbbaurecht = this.get("erbbaurecht"),
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
            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>erbbaurecht</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='boolean'>" + erbbaurecht + "</wps:LiteralData>";
            dataInputs += "</wps:Data>";
            dataInputs += "</wps:Input>";
            dataInputs += "</wps:DataInputs>";
            Radio.trigger("WPS", "request", {
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
                            nutzung: brw.getAttribute("nutzung"),
                            bezeichnung: brw.getAttribute("bezeichnung"),
                            anteil: parseFloat(brw.getAttribute("anteil").replace(/,/, ".").trim()),
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
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.gemarkung.nummer + "</wps:LiteralData>";
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
                    dataInputs += "<wps:LiteralData dataType='string'>" + lage.strassendefinition.streetkey + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>nutzung</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.nutzung + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>stichtag</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.stichtag + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "</wps:DataInputs>";
                    Radio.trigger("WPS", "request", {
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
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.nutzung + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "<wps:Input>";
                    dataInputs += "<ows:Identifier>stichtag</ows:Identifier>";
                    dataInputs += "<wps:Data>";
                    dataInputs += "<wps:LiteralData dataType='string'>" + brw.stichtag + "</wps:LiteralData>";
                    dataInputs += "</wps:Data>";
                    dataInputs += "</wps:Input>";
                    dataInputs += "</wps:DataInputs>";
                    Radio.trigger("WPS", "request", {
                        workbenchname: this.get("wpsWorkbenchnameDetailsAdresse"),
                        dataInputs: dataInputs
                    });
                }
            }
        },
        saveBRWDetails: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameDetailsAdresse") || obj.request.workbenchname === this.get("wpsWorkbenchnameDetailsFlurstueck")) {
                var ergebnis = $(obj.data).find("wps\\:ergebnis,ergebnis"),
                    parameter = $(obj.data).find("wps\\:parameter,parameter");

                if ($(ergebnis[0]).children().length > 0) {
                        var stichtag = $(parameter).attr("stichtag"),
                        nutzung = $(parameter).attr("nutzung"),
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
                        if (obj.bezeichnung === nutzung && obj.stichtag === stichtag) {
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
                                ermittlungsart: this.get("lage").type
                            });
                        }
                    }, this);
                    this.setBRWList(this.get("brwList"));
                }
            }
        },
        setBRWList: function (brwList) {
            this.unset("brwList", {silent: true});
            this.set("brwList", brwList);
        },
        getValForBRWInfo: function (evt) {
            var id = evt.target.id,
                bezeichnung,
                brw,
                msg;
            // if click on span with icon. find span of grandparent (the span we need)
            if (id.length < 1) {
                brw = $(evt.target).parent().parent().find("span")[0];
            }
            // else find span of parent
            else {
                brw = $(evt.target).parent().find("span")[0];
            }

            bezeichnung = $(brw).html().split("Nutzung: ")[1];
            switch (bezeichnung) {
                case "EFH": {
                    msg = "EFH-Bodenrichtwert (grünes Dreieck)";
                    break;
                }
                case "MFH": {
                    msg = "MFH-Bodenrichtwert (gelbes Quadrat)";
                    break;
                }
                case "WGH": {
                    msg = "WGH-Bodenrichtwert (gelber Stern)";
                    break;
                }
                case "BH": {
                    msg = "BH-Bodenrichtwert (hellblaues Quadrat)";
                    break;
                }
                case "BGH": {
                    msg = "BGH-Bodenrichtwert (roter Stern)";
                    break;
                }
                case "GH": {
                    msg = "GH-Bodenrichtwert (violetter Stern)";
                    break;
                }
                case "LAD": {
                    msg = "LAD-Bodenrichtwert (violettes Quadrat)";
                    break;
                }
                case "PL": {
                    msg = "PL-Bodenrichtwert (dunkelblaues Quadrat)";
                    break;
                }
                case "GH, WGH, BGH oder EKZ": {
                    msg = "GH-Bodenrichtwert (violetter Stern) oder WGH-Bodenrichtwert (gelber Stern) oder BGH-Bodenrichtwert (roter Stern) oder EKZ-Bodenrichtwert (roter Stern)";
                    break;
                }
                case "BH, BGH oder WGH (mit Büro-Anteil)": {
                    msg = "BH-Bodenrichtwert (hellblaues Quadrat) oder BGH-Bodenrichtwert (roter Stern) oder WGH-Bodenrichtwert (gelber Stern mit Schichtwert für die Nutzung Büro)";
                    break;
                }
                case "MFH oder WGH": {
                    msg = "MFH-Bodenrichtwert (gelbes Quadrat) oder WGH-Bodenrichtwert (gelber Stern)";
                    break;
                }
                case "MFH oder WGH, jeweils mit Zusatz ETW": {
                    msg = "MFH-Bodenrichtwert (gelbes Quadrat mit Schichtwert für die Nutzung ETW) oder WGH-Bodenrichtwert (gelber Stern mit Schichtwert für die Nutzung ETW)";
                    break;
                }
                case "WGB": {
                    msg = "WGH-Bodenrichtwert (gelber Stern mit Schichtwert für die Nutzung Büro)";
                    break;
                }
                case "BH, BGH oder WGH mit Büro-Anteil": {
                    msg = "BH-Bodenrichtwert (hellblaues Quadrat) oder BGH-Bodenrichtwert (roter Stern) oder WGH-Bodenrichtwert (gelber Stern mit Schichtwert für die Nutzung Büro)";
                    break;
                }
                default: {
                    msg = "Bodenrichtwert";
                }
            }
            return msg;
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

    return BRWModel;
});
