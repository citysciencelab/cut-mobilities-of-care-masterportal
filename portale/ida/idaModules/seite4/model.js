define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite4Model = Backbone.Model.extend({
        defaults: {
            params: {},
            brwList: [],
            aktBRW: "",
            normBRW: "",
            nutzung: "",
            produkt: "",
            jahr: "",
            page: "",
            wpsWorkbenchnameNormBRW: "BRWUmrechnungHH",
            wpsWorkbenchnameIDAUmrechnung: "IDABerechnungHH"
        },
        initialize: function () {
            EventBus.on("wps:response", this.handleNormBRMResponse, this), // Result von wpsWorkbenchnameNormBRW
            EventBus.on("wps:response", this.handleIDAResponse, this); // Result von wpsWorkbenchnameIDAUmrechnung
        },
        startCalculation: function () {
            var brwList = this.get("brwList"),
                aktbrwList = _.filter(brwList, {art: "Akt.BRW"}),
                normBRWParams = _.values(_.filter(brwList, {art: "Norm.BRW"}))[0];

            this.set("aktBRW", this.calcAktBRW(aktbrwList));
            if (normBRWParams) {
                this.requestNormBRW(normBRWParams);
            }
            else {
                this.set("normBRW", "");
                this.requestIDA();
            }
        },
        /*
        * berechnet den Mittelwert der Gruppen und deren arithmetisches Mittel oder gibt null zurück
        */
        calcAktBRW: function (list) {
            if (list.length > 0) {
                var groupedAktBRW = _.groupBy(list, function (brw) {
                    return brw.bezeichnung;
                }),
                    aktbrw = 0,
                    groupValue = 0;

                _.each(groupedAktBRW, function (group) {
                    groupValue = 0;
                    _.each (group, function (brw) {
                        groupValue = (groupValue + (brw.brw * brw.anteil));
                    });
                    if (aktbrw === 0) {
                        aktbrw = groupValue;
                    }
                    else {
                        aktbrw = ((aktbrw + groupValue) / 2);
                    }
                });
                return aktbrw;
            }
            else {
                return null;
            }
        },
        /*
        * stellt Request zur Abfrage des NormBRW zusammen
        */
        requestNormBRW: function (brw) {
            if (brw) {
                var dataInputs = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'>";

                dataInputs += "<ows:Identifier>BRWUmrechnungHH.fmw</ows:Identifier>";
                dataInputs += "    <wps:DataInputs>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>BRW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'>" + brw.brw + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>STAG</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.stichtag + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ENTW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.entw + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>BEIT</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.beit + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>NUTA</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.nuta + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ERGNUTA</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.ergnuta + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>BAUW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.bauw + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>WGFZ</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'>" + brw.wgfz + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>FLAE</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'>" + brw.flae + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZENTW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.entw + "</wps:LiteralData>"; // identisch mit Quellgrundstück
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZBEIT</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.beit + "</wps:LiteralData>"; // identisch mit Quellgrundstück
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZNUTA</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.nuta + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZBAUW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>" + brw.bauw + "</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZWGFZ</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'>1</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZFLAE</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'>1000</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZGTIE</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZStrLage</ows:Identifier>"; // dropdownEintrag
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'>F</wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>EGNutzung</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>EGGFZAnt</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>EGW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>IGNutzung</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>IGGFZAnt</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>IGW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZGNutzung</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZGGFZAnt</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>ZGW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>OGNutzung</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='string'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>OGGFZAnt</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>OGW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>NWohnW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>NBueroW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "      <wps:Input>";
                dataInputs += "        <ows:Identifier>NLadenW</ows:Identifier>";
                dataInputs += "        <wps:Data>";
                dataInputs += "          <wps:LiteralData dataType='float'></wps:LiteralData>";
                dataInputs += "        </wps:Data>";
                dataInputs += "      </wps:Input>";
                dataInputs += "    </wps:DataInputs>";
                dataInputs += "</wps:Execute>";
                EventBus.trigger("wps:request", {
                    workbenchname: this.get("wpsWorkbenchnameNormBRW"),
                    dataInputs: dataInputs
                });
            }
        },
        /*
        * speichert den NormBRW und startetcalcIDA
        */
        handleNormBRMResponse: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchnameNormBRW")) {
                var ergebnis = $(obj.data).find("wps\\:Ergebnis,Ergebnis"),
                    brw = $(ergebnis).find("wps\\:brw,brw")[0].textContent,
                    error = $(ergebnis).find("wps\\:ErrorOccured,ErrorOccured")[0].textContent,
                    fehlertext = $(ergebnis).find("wps\\:Fehlermeldung,Fehlermeldung")[0].textContent;

                if (error === "No") {
                    this.set("normBRW", brw);
                    this.requestIDA();
                }
                else {
                    console.log(fehlertext);
                    alert("Normierter Bodenrichtwert konnte nicht berechnet werden. Abbruch!");
                }
            }
        },
        /*
        * stellt Request zur Abfrage von IDA-Werten zusammen
        */
        requestIDA: function () {
            var params = this.get("params"),
                dataInputs = "<wps:DataInputs>";

            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("nutzung", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("produkt", "string"));
            dataInputs += "<wps:Input>";
            dataInputs += "<ows:Identifier>DATU</ows:Identifier>";
            dataInputs += "<wps:Data>";
            dataInputs += "<wps:LiteralData dataType='string'>" + this.get("jahr") + "-07-01</wps:LiteralData>"; // immer 1. Juli des gewählten Jahres
            dataInputs += "</wps:Data>";
            dataInputs += "</wps:Input>";
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("StadtteilName", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("normBRW", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("aktBRW", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("WGFZ", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("FLAE", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("BAUW", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("STRL", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("GESL", "string"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("BAUJ", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("MODG", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("WOFL", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("ZAWO", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("GARI", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("GARA", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("STEA", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("EGFL", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("OGFL", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("WONKM", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("SONKM", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("RLZ", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("JEZ", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("ENER", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("KELL", "boolean"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("LIFT", "boolean"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("STST", "integer"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("FKWERT", "float"));
            dataInputs = this.concatStrings (dataInputs, this.returnDataInputSnippet("SACH", "float"));
            dataInputs += "</wps:DataInputs>";
            EventBus.trigger("wps:request", {
                workbenchname: this.get("wpsWorkbenchnameIDAUmrechnung"),
                dataInputs: dataInputs
            });
        },
        returnDataInputSnippet: function (name, typ) {
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
                    error = $(obj.data).find("wps\\:error,error")[0].textContent,
                    params = $(obj.data).find("wps\\:eingabeparameter,eingabeparameter")[0],
                    html = "";

                this.set("result", result);
                this.set("error", error.replace(/\n/g, "<br>"));
                if (params.hasAttribute("NUTZUNG")) {
                    html += "</br>NUTZUNG " + params.getAttribute("NUTZUNG");
                }
                if (params.hasAttribute("PRODUKT")) {
                    html += "</br>PRODUKT " + params.getAttribute("PRODUKT");
                }
                if (params.hasAttribute("DATU")) {
                    html += "</br>DATU " + params.getAttribute("DATU");
                }
                if (params.hasAttribute("STADTTEILNAME")) {
                    html += "</br>STADTTEILNAME " + params.getAttribute("STADTTEILNAME");
                }
                if (params.hasAttribute("NORMBRW")) {
                    html += "</br>NORMBRW " + params.getAttribute("NORMBRW");
                }
                if (params.hasAttribute("AKTBRW")) {
                    html += "</br>AKTBRW " + params.getAttribute("AKTBRW");
                }
                if (params.hasAttribute("WGFZ")) {
                    html += "</br>WGFZ " + params.getAttribute("WGFZ");
                }
                if (params.hasAttribute("FLAE")) {
                    html += "</br>FLAE " + params.getAttribute("FLAE");
                }
                if (params.hasAttribute("BAUW")) {
                    html += "</br>BAUW " + params.getAttribute("BAUW");
                }
                if (params.hasAttribute("STRL")) {
                    html += "</br>STRL " + params.getAttribute("STRL");
                }
                if (params.hasAttribute("GESL")) {
                    html += "</br>GESL " + params.getAttribute("GESL");
                }
                if (params.hasAttribute("BAUJ")) {
                    html += "</br>BAUJ " + params.getAttribute("BAUJ");
                }
                if (params.hasAttribute("MODG")) {
                    html += "</br>MODG " + params.getAttribute("MODG");
                }
                if (params.hasAttribute("WOFL")) {
                    html += "</br>WOFL " + params.getAttribute("WOFL");
                }
                if (params.hasAttribute("ZAWO")) {
                    html += "</br>ZAWO " + params.getAttribute("ZAWO");
                }
                if (params.hasAttribute("GARI")) {
                    html += "</br>GARI " + params.getAttribute("GARI");
                }
                if (params.hasAttribute("GARA")) {
                    html += "</br>GARA " + params.getAttribute("GARA");
                }
                if (params.hasAttribute("STEA")) {
                    html += "</br>STEA " + params.getAttribute("STEA");
                }
                if (params.hasAttribute("EGFL")) {
                    html += "</br>EGFL " + params.getAttribute("EGFL");
                }
                if (params.hasAttribute("OGFL")) {
                    html += "</br>OGFL " + params.getAttribute("OGFL");
                }
                if (params.hasAttribute("WONKM")) {
                    html += "</br>WONKM " + params.getAttribute("WONKM");
                }
                if (params.hasAttribute("SONKM")) {
                    html += "</br>SONKM " + params.getAttribute("SONKM");
                }
                if (params.hasAttribute("RLZ")) {
                    html += "</br>RLZ " + params.getAttribute("RLZ");
                }
                if (params.hasAttribute("JEZ")) {
                    html += "</br>JEZ " + params.getAttribute("JEZ");
                }
                if (params.hasAttribute("STST")) {
                    html += "</br>STST " + params.getAttribute("STST");
                }
                if (params.hasAttribute("FKWERT")) {
                    html += "</br>FKWERT " + params.getAttribute("FKWERT");
                }
                if (params.hasAttribute("SACH")) {
                    html += "</br>SACH " + params.getAttribute("SACH");
                }
                if (params.hasAttribute("ENER")) {
                    html += "</br>ENER " + params.getAttribute("ENER");
                }
                if (params.hasAttribute("KELL")) {
                    html += "</br>KELL " + params.getAttribute("KELL");
                }
                if (params.hasAttribute("LIFT")) {
                    html += "</br>LIFT " + params.getAttribute("LIFT");
                }
                if (params.hasAttribute("EBK")) {
                    html += "</br>EBK " + params.getAttribute("EBK");
                }
                this.set("parameter", html);
            }
        }
    });

    return new Seite4Model();
});
