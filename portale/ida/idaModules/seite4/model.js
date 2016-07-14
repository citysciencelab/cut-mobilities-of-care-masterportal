define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite4Model = Backbone.Model.extend({
        defaults: {
            params: {},
            brwList: "", // default !== [], damit startCalculation auch checkResponseReceived ausführen läßt
            aktBRW: "",
            normBRW: "",
            nutzung: "",
            produkt: "",
            jahr: "",
            lage: "",
            page: "",
            wpsWorkbenchnameBRW: "BRWUmrechnungHH",
            wpsWorkbenchnameIDAUmrechnung: "IDABerechnungHH"
        },
        initialize: function () {
            this.listenTo(this, "change:brwList", this.checkResponseReceived);

            EventBus.on("wps:response", this.handleBRWResponse, this), // Result von wpsWorkbenchnameBRW
            EventBus.on("wps:response", this.handleIDAResponse, this); // Result von wpsWorkbenchnameIDAUmrechnung
        },
        checkResponseReceived: function () {
            var brwList = this.get("brwList"),
                rr = _.pluck(brwList, "responseReceived"),
                every = _.every(rr, function (r) {
                    if (r === true) {
                        return true;
                    }
                });

            if (every === true) {
                this.requestIDA();
            }
        },
        /*
        * Ergänze alle Objekte um id
        */
        addId: function (obj) {
            _.each(obj, function (o) {
                var uniqueID = _.uniqueId("ida_");

                o = _.extend(o, {id: uniqueID});
                o = _.extend(o, {responseReceived: false});
                o = _.extend(o, {umgerechneterbrw: ""});
            });
            return obj;
        },
        /*
        * wird von View bei init gerufen
        */
        startCalculation: function (brwList) {
            var brwList = this.addId(brwList),
                params = this.get("params"),
                STRL = _.has(params, "STRL") === true ? params.STRL : "",
                BAUW = _.has(params, "BAUW") === true ? params.BAUW : "",
                ZWGFZ = "",
                ZFLAE = _.has(params, "FLAE") === true ? parseFloat(params.FLAE.replace(/,/, ".").trim()) : "";

            // Berechne ZWGFZ, falls nicht gesetzt, als Produkt von Parametern.
            // Für den Miteigentumsanteil MEA wird der Quotient von MEAN / MEAZ verwendet.
            if (_.has(params, "WGFZ") === false) {
                if (_.has(params, "WOFL") === true && _.has(params, "FLAE") === true) {
                    var WOFL = Number(params.WOFL.replace(/,/, ".").trim()),
                        FLAE = Number(params.FLAE.replace(/,/, ".").trim()),
                        EGFL = _.has(params, "EGFL") === true ? Number(params.EGFL.replace(/,/, ".").trim()) : 0,
                        OGFL = _.has(params, "OGFL") === true ? Number(params.OGFL.replace(/,/, ".").trim()) : 0,
                        MEA = _.has(params, "MEAN") === true && _.has(params, "MEAZ") === true ? Number(params.MEAN.replace(/,/, ".").trim()) / Number(params.MEAZ.replace(/,/, ".").trim()) : 1,
                        WGFZ = ((WOFL + EGFL + OGFL) / FLAE / 0.78 / MEA).toFixed(2);

                    ZWGFZ = WGFZ;
                    params = _.extend(params, _.object(["WGFZ"], [WGFZ]));
                    if (MEA !== 1) {
                        // MEA = 1 ist uninteressant für JasperReport
                        params = _.extend(params, _.object(["MEA"], [MEA]));
                    }
                    this.set("params", params);
                }
            }
            else {
                ZWGFZ = params.WGFZ.replace(/,/, ".").trim();
            }
            this.set("brwList", brwList);
            _.each(brwList, function (brw) {
                switch (brw.art) {
                    case "Akt.BRW": {
                        this.requestBRW(brw, STRL, BAUW, ZWGFZ, ZFLAE);
                        break;
                    }
                    case "Norm.BRW": {
                        this.requestBRW(brw, "F", "eh", 1, 1000); // immer Frontlage, Einfamilienhaus, 1.0 und 1000m²
                        break;
                    }
                }
            }, this);
        },
        /*
        * stellt Requests zur Abfrage der einzelnen BRW zusammen
        */
        requestBRW: function (brw, STRL, BAUW, ZWGFZ, ZFLAE) {
            var stichtag = brw.stichtag.split("."),
                dataInputs = "<wps:DataInputs>",
                znuta = brw.brwValues.ergnuta && brw.brwValues.ergnuta !== "" ? brw.brwValues.ergnuta : brw.brwValues.nuta;

            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ExtID", brw.id, "string")); // Externer Identifikator des WPS-Prozesses, wird mit ausgegeben.
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("BRW", brw.brwValues.brw, "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("STAG", stichtag[2] + "-" + stichtag[1] + "-" + stichtag[0], "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ENTW", brw.brwValues.entw, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("BEIT", brw.brwValues.beit, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("NUTA", brw.brwValues.nuta, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ERGNUTA", brw.brwValues.ergnuta, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("BAUW", brw.brwValues.bauw, "string"));
            if (brw.wgfz !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("WGFZ", brw.brwValues.wgfz, "float"));
            }
            if (brw.flae !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("FLAE", brw.brwValues.flae, "float"));
            }
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZENTW", brw.brwValues.entw, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZBEIT", brw.brwValues.beit, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZNUTA", znuta, "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZBAUW", BAUW, "string"));
            if (ZWGFZ !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZWGFZ", ZWGFZ, "float"));
            }
            if (ZFLAE !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZFLAE", ZFLAE, "float"));
            }
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZStrLage", STRL, "string"));
            if (brw.nWohnW !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("NWohnW", brw.brwValues.nWohnW, "float"));
            }
            if (brw.nBueroW !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("NBueroW", brw.brwValues.nBueroW, "float"));
            }
            if (brw.nLadenW !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("NLadenW", brw.brwValues.nLadenW, "float"));
            }
            if (brw.ugnutzung !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("UGNutzung", brw.brwValues.ugnutzung, "string"));
            }
            if (brw.uggfzAnt !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("UGGFZAnt", brw.brwValues.uggfzAnt, "float"));
            }
            if (brw.ugw !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("UGW", brw.brwValues.ugw, "float"));
            }
            if (brw.egnutzung !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("EGNutzung", brw.brwValues.egnutzung, "string"));
            }
            if (brw.eggfzAnt !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("EGGFZAnt", brw.brwValues.eggfzAnt, "float"));
            }
            if (brw.egw !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("EGW", brw.brwValues.egw, "float"));
            }
            if (brw.ignutzung !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("IGNutzung", brw.brwValues.ignutzung, "string"));
            }
            if (brw.iggfzAnt !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("IGGFZAnt", brw.brwValues.iggfzAnt, "float"));
            }
            if (brw.igw !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("IGW", brw.brwValues.igw, "float"));
            }
            if (brw.zgnutzung !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZGNutzung", brw.brwValues.zgnutzung, "string"));
            }
            if (brw.zggfzAnt !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZGGFZAnt", brw.brwValues.zggfzAnt, "float"));
            }
            if (brw.zgw !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZGW", brw.brwValues.zgw, "float"));
            }
            if (brw.ognutzung !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("OGNutzung", brw.brwValues.ognutzung, "string"));
            }
            if (brw.oggfzAnt !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("OGGFZAnt", brw.brwValues.oggfzAnt, "float"));
            }
            if (brw.ogw !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("OGW", brw.brwValues.ogw, "float"));
            }
            dataInputs += "</wps:DataInputs>";
            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsWorkbenchnameBRW"),
                dataInputs: dataInputs
            });
        },
        /*
        * empfängt Teile der umgerechneten BRW (sowohl AktBRW als auch NormBRW)
        */
        handleBRWResponse: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameBRW")) {
                var brwList = this.get("brwList"),
                    aktbrwList = _.filter(brwList, {art: "Akt.BRW"}),
                    normBRWParams = _.values(_.filter(brwList, {art: "Norm.BRW"}))[0],
                    ergebnis = $(obj.data).find("wps\\:Ergebnis,Ergebnis"),
                    umgerechneterbrw = $(ergebnis).find("wps\\:brw,brw")[0].textContent,
                    error = $(ergebnis).find("wps\\:ErrorOccured,ErrorOccured")[0].textContent,
                    fehlertext = $(ergebnis).find("wps\\:Fehlermeldung,Fehlermeldung")[0].textContent,
                    parameter = $(obj.data).find("wps\\:parameter,parameter"),
                    id = $(parameter).attr("ExtID");

                if (error === "No") {
                    var brw = _.find(brwList, function (brw) {
                        return brw.id === id;
                    });
                    if (brw) {
                        brw.umgerechneterbrw = umgerechneterbrw;
                        brw.responseReceived = true;
                        this.unset("brwList", {silent: true});
                        this.set("brwList", brwList);
                    }
                }
            }
        },
        /*
        * stellt Request zur Abfrage von IDA-Werten zusammen
        */
        requestIDA: function () {
            var params = this.get("params"),
                dataInputs = "<wps:DataInputs>",
                BRWJSON = JSON.stringify(this.get("brwList")),
                LAGE = JSON.stringify(this.get("lage"));

            this.set("BRWJSON", BRWJSON);
            this.set("LAGE", LAGE);

            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("nutzung", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("produkt", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("jahr", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("StadtteilName", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("WGFZ", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("FLAE", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("BAUW", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("STRL", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("GESL", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("BAUJ", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("MODG", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("WOFL", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("MEA", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("ZAWO", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("GARI", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("GARA", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("STEA", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("EGFL", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("OGFL", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("WONKM", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("SONKM", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("RLZ", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("JEZ", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("ENER", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("KELL", "boolean"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("LIFT", "boolean"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("EBK", "boolean"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("STST", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("FKWERT", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("SACH", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("BRWJSON", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnIDAInputSnippet("LAGE", "string"));
            dataInputs += "</wps:DataInputs>";
            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsWorkbenchnameIDAUmrechnung"),
                dataInputs: dataInputs
            });
        },
        returnBRWInputSnippet: function (name, value, typ) {
            return "<wps:Input><ows:Identifier>" + name + "</ows:Identifier><wps:Data><wps:LiteralData dataType='" + typ + "'>" + value + "</wps:LiteralData></wps:Data></wps:Input>";
        },
        returnIDAInputSnippet: function (name, typ) {
            var params = this.get("params"),
                par = this.get(name);

            if (_.has(params, name) === true) {
                return "<wps:Input><ows:Identifier>" + name.toUpperCase() + "</ows:Identifier><wps:Data><wps:LiteralData dataType='" + typ + "'>" + _.values(_.pick(params, name))[0] + "</wps:LiteralData></wps:Data></wps:Input>";
            }
            else if (par) {
                return "<wps:Input><ows:Identifier>" + name.toUpperCase() + "</ows:Identifier><wps:Data><wps:LiteralData dataType='" + typ + "'>" + par + "</wps:LiteralData></wps:Data></wps:Input>";
            }
            else {
                return null;
            }
        },
        concatStrings: function (string, newString) {
            if (newString) {
                return string + newString;
            }
            else {
                return string;
            }
        },
        /*
        * Übergibt das Ergebnis an die View
        */
        handleIDAResponse: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameIDAUmrechnung")) {
                var result = $(obj.data).find("wps\\:ergebnis,ergebnis")[0].textContent,
                    filepath = $(obj.data).find("wps\\:filepath,filepath")[0],
                    params = $(obj.data).find("wps\\:eingabeparameter,eingabeparameter")[0],
                    html = "";

                if (filepath) {
                    this.set("filepath", filepath.textContent);
                    this.set("result", result);
                }
                else {
                    this.set("error", result);
                }
            }
        }
    });

    return new Seite4Model();
});
