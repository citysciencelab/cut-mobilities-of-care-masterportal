define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        OverviewModel;

    OverviewModel = Backbone.Model.extend({
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
            result: "",
            error: "",
            hints: "",
            wpsWorkbenchnameBRW: "BRWUmrechnungHH",
            wpsWorkbenchnameIDAUmrechnung: "IDABerechnungHH",
            includePayment: false,
            priceInfo: Config.priceInfo
        },

        initialize: function () {
            this.listenTo(this, "change:brwList", this.checkResponseReceived);

            this.listenTo(Radio.channel("WPS"), {
                "response": function (obj) {
                    this.handleBRWResponse(obj); // Result von wpsWorkbenchnameBRW
                    this.handleIDAResponse(obj); // Result von wpsWorkbenchnameIDAUmrechnung
                }
            }, this);

            this.checkIncludePayment();
        },

        /*
        * checks if portal runs in "geoportal-hamburg.de" or "localhost"
        */
        checkIncludePayment: function () {
            var url = window.location.href,
                includePayment = (url.search("geoportal-hamburg.de") !== -1 || url.search("localhost") !== -1) === true ? true : false;

            this.set("includePayment", includePayment);
        },

        /**
         * Startet die IDA-Berechnung, wenn alle BRW-Informationen abgefragt wurden
         */
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

        /**
        * wird von View in initialize gerufen
        * Bereitet die Parameter zur BRW-Abfrage auf
        * und initiiert die BRW-Umrechnung für Akt.BRW und Norm.BRW
        */
        startCalculation: function (brwList) {
            var brwList = this.addId(brwList),
                params = this.get("params"),
                STRL = _.has(params, "STRL") === true ? params.STRL : "",
                BAUW = _.has(params, "BAUW") === true ? params.BAUW : "",
                ZWGFZ = "",
                ZFLAE = _.has(params, "FLAE") === true ? parseFloat(params.FLAE.replace(/,/, ".").trim()) : "",
                WOFL, FLAE, EGFL, OGFL, MEA, ZWGFZ;

            // Berechne ZWGFZ, falls nicht gesetzt, als Produkt von Parametern.
            // Für den Miteigentumsanteil MEA wird der Quotient von MEAN / MEAZ verwendet.
            if (_.has(params, "WGFZ") === false) {
                WOFL = _.has(params, "WOFL") === true && Number(params.WOFL.replace(/,/, ".").trim()) > 0 ? Number(params.WOFL.replace(/,/, ".").trim()) : 0;
                FLAE = _.has(params, "FLAE") === true && Number(params.FLAE.replace(/,/, ".").trim()) > 0 ? Number(params.FLAE.replace(/,/, ".").trim()) : 0;
                EGFL = _.has(params, "EGFL") === true ? Number(params.EGFL.replace(/,/, ".").trim()) : 0;
                OGFL = _.has(params, "OGFL") === true ? Number(params.OGFL.replace(/,/, ".").trim()) : 0;
                MEA = _.has(params, "MEAN") === true && _.has(params, "MEAZ") === true ? Number(params.MEAN.replace(/,/, ".").trim()) / Number(params.MEAZ.replace(/,/, ".").trim()) : 1;
                ZWGFZ = (WOFL + EGFL + OGFL) > 0 && FLAE > 0 ? ((WOFL + EGFL + OGFL) / FLAE / 0.78 / MEA).toFixed(2) : "";

                // Nur wenn ZWGFZ > 0 wird der WGFZ für die BRW-Umrechnung verwendet und gelangt auch ins PDF.
                if (ZWGFZ !== "") {
                    params = _.extend(params, _.object(["WGFZ"], [ZWGFZ]));
                    if (MEA !== 1) {
                        // MEA = 1 ist uninteressant für JasperReport
                        params = _.extend(params, _.object(["MEA"], [MEA]));
                    }
                    this.set("params", params);
                }
            }
            else {
                ZWGFZ = params.WGFZ.replace(/,/, ".").trim();
                params = _.extend(params, _.object(["WGFZ"], [ZWGFZ]));
                this.set("params", params);
            }
            this.set("brwList", brwList);
            _.each(brwList, function (brw) {
                switch (brw.art) {
                    case "Akt.BRW": {
                        this.requestBRW(brw, STRL, BAUW, ZWGFZ, ZFLAE, brw.nutzung);
                        break;
                    }
                    case "Norm.BRW": {
                        this.requestBRW(brw, "F", "eh", 1, 1000, brw.nutzung); // immer Frontlage, Einfamilienhaus, 1.0 und 1000m²
                        break;
                    }
                }
            }, this);
        },

        /*
        * Stellt Requests zur Umrechnung der einzelnen BRW zusammen.
        * Die Abfrage erfolgt immer in EUR, Rückgabe ist entsprechend auch in EUR.
        */
        requestBRW: function (brw, STRL, BAUW, ZWGFZ, ZFLAE, ZNUTA) {
            var stichtag = brw.stichtag.split("."),
                dataInputs = "<wps:DataInputs>";

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
            dataInputs = this.concatStrings (dataInputs, this.returnBRWInputSnippet("ZNUTA", ZNUTA, "string"));
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
            Radio.trigger("WPS", "request", {
                workbenchname: this.get("wpsWorkbenchnameBRW"),
                dataInputs: dataInputs
            });
        },

        /*
        * empfängt Teile der umgerechneten BRW (sowohl AktBRW als auch NormBRW)
        * und speichert das Ergebnis in brwList
        */
        handleBRWResponse: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameBRW")) {
                var brwList = this.get("brwList"),
                    ergebnis = $(obj.data).find("wps\\:Ergebnis,Ergebnis"),
                    umgerechneterbrw = $(ergebnis).find("wps\\:brw,brw")[0].textContent,
                    error = $(ergebnis).find("wps\\:ErrorOccured,ErrorOccured")[0].textContent,
                    parameter = $(obj.data).find("wps\\:parameter,parameter"),
                    id = $(parameter).attr("ExtID"),
                    brw;

                if (error === "No") {
                    brw = _.find(brwList, function (brw) {
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
        * und initiiert die IDA-Berechnung
        */
        requestIDA: function () {
            var dataInputs = "<wps:DataInputs>",
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

            Radio.trigger("WPS", "request", {
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
        * Übergibt das Ergebnis wenn vom wps-Model kein Fehler festgestellt worden ist und ErrorOccured = No ist. Es wird kein
        * Fehler festgestellt, wenn bei der IDA-Pythonberechnung ein Error aufgetreten ist, da dann der Text dargestellt werden soll.
        * In diesem Fall enthält die response keine orderID.
        */
        handleIDAResponse: function (obj) {
            var result, orderid, hintsArr, status;

            if (obj.request.workbenchname === this.get("wpsWorkbenchnameIDAUmrechnung")) {
                result = $(obj.data).find("wps\\:ergebnis,ergebnis")[0].textContent;
                orderid = $(obj.data).find("wps\\:orderId,orderId")[0] ? $(obj.data).find("wps\\:orderId,orderId")[0].textContent : "";
                hintsArr = $(obj.data).find("wps\\:hints,hints")[0] ? $(obj.data).find("wps\\:hints,hints")[0].textContent : "";

                this.set("hints", hintsArr);
                if (orderid !== "") {
                    this.set("orderid", orderid);
                    this.set("result", result);

                    status = Radio.request("DBLogger", "newOrder", orderid, this.get("lage"), this.get("produkt"), this.get("jahr"), this.get("nutzung"));

                    if (status.type === "Success" || status.type === "Ignore") {
                        // Übermittele die OrderID an Billing-Modul
                        Radio.trigger("Billing", "addOrderId", orderid);
                    }
                    else {
                        this.set("error", "Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
                    }
                }
                else {
                    this.set("error", result);
                }
            }
        },

        wasSuccessfull: function () {
            if (this.get("orderid") !== "") {
                return true;
            }
            else {
                return false;
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

    return OverviewModel;
});
