import cookie from "../cookie/view";
import Tool from "../core/modelList/tool/model";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Stroke, Style} from "ol/style.js";
import {Draw} from "ol/interaction.js";

const GrenznachweisModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        nutzungsbedingungakzeptiert: false,
        gebuehrenordnungakzeptiert: false,
        lage: "",
        zweckGebaeudeeinmessung: false,
        zweckGebaeudeabsteckung: false,
        zweckLageplan: false,
        zweckSonstiges: false,
        freitext: "",
        punkte: "knick-eckpunkte",
        kundenanrede: "Herr",
        source: new VectorSource(),
        kundenname: "",
        kundenfirma: "",
        kundenadresse: "",
        kundenplz: "",
        kundenort: "",
        kundenemail: "",
        kundenfestnetz: "",
        kundenmobilfunk: "",
        auftragsnummer: "",
        kundennummer: "",
        errors: {},
        activatedInteraction: false,
        weiterButton: {enabled: true, name: "weiter"},
        zurueckButton: {enabled: false, name: "zurück"},
        activeDIV: "beschreibung", // beschreibung oder kundendaten
        wpsurl: "",
        renderToWindow: true
    }),
    initialize: function () {
        // lese WPS-Url aus JSON ein
        var wpsService = Radio.request("RestReader", "getServiceById", Config.wpsID),
            wpsURL = wpsService && wpsService && wpsService.get("url") ? wpsService.get("url") : null,
            newURL = wpsURL ? Radio.request("Util", "getProxyURL", wpsURL) : null;

        this.superInitialize();
        if (newURL) {
            this.set("wpsurl", newURL);
            // Erzeuge OL-Layer für Geometrie
            this.set("layer", new VectorLayer({
                source: this.get("source"),
                name: "grenznachweisDraw"
            }));
            Radio.trigger("Map", "addLayer", this.get("layer"));
            // Cookie lesen
            if (cookie.model.hasItem() === true) {
                this.readCookie();
            }
        }
        else {
            Radio.trigger("Alert", "alert", "Die WPS-URL konnte nicht ermittelt werden.");
        }
    },
    // Fenstermanagement-Events
    prepWindow: function () {
        if (this.get("lage") === "" && $("#searchInput") && $("#searchInput").val() !== "") {
            this.set("lage", $("#searchInput").val());
        }
    },

    // Validation
    validators: {
        minLength: function (value, minLength) {
            return value.length >= minLength;
        },
        maxLength: function (value, maxLength) {
            return value.length <= maxLength;
        },
        maxValue: function (value, maxValue) {
            return value <= maxValue;
        },
        minValue: function (value, minValue) {
            return value >= minValue;
        },
        isLessThan: function (min, max) {
            return min <= max;
        },
        pattern: function (value, pattern) {
            return Boolean(new RegExp(pattern, "gi").test(value));
        }
    },
    validate: function (attributes, identifier) {
        var errors = {};

        if (identifier.validate === true) {
            if (this.get("activeDIV") === "kundendaten") {
                if (attributes.nutzungsbedingungakzeptiert === false) {
                    errors.nutzungsbedingungakzeptiert = "Zustimmung ist obligatorisch.";
                }
                if (attributes.gebuehrenordnungakzeptiert === false) {
                    errors.gebuehrenordnungakzeptiert = "Kenntnisnahme ist obligatorisch.";
                }
                if (attributes.kundennummer !== "") {
                    if (this.validators.pattern(attributes.kundennummer, "[^0-9]") === true || attributes.kundennummer.length !== 6) {
                        errors.kundennummer = "Numerischer Wert der Länge 6 erwartet.";
                    }
                }
                if (this.validators.minLength(attributes.kundenname, 3) === false) {
                    errors.kundenname = "Name notwendig.";
                }
                if (this.validators.pattern(attributes.kundenname, "[0-9]") === true) {
                    errors.kundenname = "Alphanumerischer Wert erwartet.";
                }
                if (this.validators.minLength(attributes.kundenadresse, 3) === false) {
                    errors.kundenadresse = "Adressangabe notwendig.";
                }
                if (this.validators.pattern(attributes.kundenplz, "[^0-9]") === true || attributes.kundenplz.length !== 5) {
                    errors.kundenplz = "Numerischer Wert der Länge 5 erwartet.";
                }
                if (this.validators.minLength(attributes.kundenemail, 1) === false || attributes.kundenemail.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm) === null) {
                    errors.kundenemail = "Syntax inkorrekt.";
                }
                if (this.validators.pattern(attributes.kundenort, "[0-9]") === true || this.validators.minLength(attributes.kundenort, 3) === false) {
                    errors.kundenort = "Alphanumerischer Wert erwartet.";
                }
                if (this.get("kundenanrede") === "Firma") {
                    if (this.validators.minLength(attributes.kundenfirma, 2) === false) {
                        errors.kundenfirma = "Firmenname erwartet.";
                    }
                }
                if (identifier.validate === "kundenfestnetz" || identifier.validate === true) {
                    if (this.validators.pattern(attributes.kundenfestnetz, "[^0-9-/]") === true) {
                        errors.kundenfestnetz = "Numerischer Wert erwartet.";
                    }
                }
                if (identifier.validate === "kundenmobilfunk" || identifier.validate === true) {
                    if (this.validators.pattern(attributes.kundenmobilfunk, "[^0-9-/]") === true) {
                        errors.kundenmobilfunk = "Numerischer Wert erwartet.";
                    }
                }
                // Bei Kundendaten werden auch Bestelldaten rudimentär geprüft, weil diese nach erfolgreicher Übermittlung gelöscht werden und so eine Doppelbestellung mit leeren Werten möglich wäre.
                if (this.get("source").getFeatures().length === 0 || this.validators.minLength(attributes.lage, 3) === false) {
                    errors.bestelldaten = "Gehen Sie zurück, um neue Bestelldaten einzugeben.";
                }
            }
            else {
                if (this.validators.maxLength(attributes.auftragsnummer, 18) === false) {
                    errors.auftragsnummer = "Maximallänge 18 Zeichen überschritten";
                }
                if (this.validators.minLength(attributes.lage, 3) === false) {
                    errors.lage = "Lagebeschreibung notwendig";
                }
                if (attributes.zweckGebaeudeeinmessung === false && attributes.zweckGebaeudeabsteckung === false && attributes.zweckLageplan === false && attributes.zweckSonstiges === false) {
                    errors.zweck = "Min. ein Feld muss markiert sein.";
                }
                if (this.get("source").getFeatures().length === 0 || this.get("activatedInteraction") === true) {
                    errors.source = "Umringe erfassen und beenden.";
                }
            }
        }
        // return die Errors
        this.set("errors", errors);
        if (_.isEmpty(errors) === false) {
            return errors;
        }
        return null;
    },
    // anonymisierte Events
    focusout: function (evt) {
        if (evt.target.id === "lagebeschreibung") {
            this.set("lage", evt.target.value);
        }
        else if (evt.target.id === "kundennummer") {
            this.set("kundennummer", evt.target.value);
            this.writeCookie();
        }
        else if (evt.target.id === "kundenname") {
            this.set("kundenname", evt.target.value);
            this.writeCookie();
        }
        else if (evt.target.id === "kundenadresse") {
            this.set("kundenadresse", evt.target.value);
            this.writeCookie();
        }
        else if (evt.target.id === "kundenplz") {
            this.set("kundenplz", evt.target.value);
            this.writeCookie();
        }
        else if (evt.target.id === "kundenort") {
            this.set("kundenort", evt.target.value);
            this.writeCookie();
        }
        else if (evt.target.id === "kundenemail") {
            this.set("kundenemail", evt.target.value);
            this.writeCookie();
        }
    },
    keyup: function (evt) {
        if (evt.target.id === "lagebeschreibung") {
            this.set("lage", evt.target.value);
        }
        else if (evt.target.id === "auftragsnummer") {
            this.set("auftragsnummer", evt.target.value);
        }
        else if (evt.target.id === "kundennummer") {
            this.set("kundennummer", evt.target.value);
        }
        else if (evt.target.id === "freitext") {
            this.set("freitext", evt.target.value);
        }
        else if (evt.target.id === "kundenname") {
            this.set("kundenname", evt.target.value);
        }
        else if (evt.target.id === "kundenfirma") {
            this.set("kundenfirma", evt.target.value);
        }
        else if (evt.target.id === "kundenadresse") {
            this.set("kundenadresse", evt.target.value);
        }
        else if (evt.target.id === "kundenplz") {
            this.set("kundenplz", evt.target.value);
        }
        else if (evt.target.id === "kundenort") {
            this.set("kundenort", evt.target.value);
        }
        else if (evt.target.id === "kundenemail") {
            // nutze lieber focusout
        }
        else if (evt.target.id === "kundenfestnetz") {
            this.set("kundenfestnetz", evt.target.value);
        }
        else if (evt.target.id === "kundenmobilfunk") {
            this.set("kundenmobilfunk", evt.target.value);
        }
    },
    click: function (evt) {
        if (evt.target.id === "zweckGebaeudeeinmessung") {
            this.set("zweckGebaeudeeinmessung", evt.target.checked);
            this.trigger("render", this, this.get("isActive"));
        }
        else if (evt.target.id === "zweckGebaeudeabsteckung") {
            this.set("zweckGebaeudeabsteckung", evt.target.checked);
            this.trigger("render", this, this.get("isActive"));
        }
        else if (evt.target.id === "zweckLageplan") {
            this.set("zweckLageplan", evt.target.checked);
            this.trigger("render", this, this.get("isActive"));
        }
        else if (evt.target.id === "zweckSonstiges") {
            this.set("zweckSonstiges", evt.target.checked);
            this.trigger("render", this, this.get("isActive"));
        }
        else if (evt.target.id === "weiter") {
            this.changeZurueckButton(true, "zurück");
            if (this.get("activeDIV") === "beschreibung") {
                this.checkInputBestelldaten();
            }
            else if (this.get("activeDIV") === "kundendaten") {
                this.checkInputKundendaten();
            }
        }
        else if (evt.target.id === "zurueck") {
            if (this.get("activeDIV") === "kundendaten") {
                this.changeWeiterButton(true, "weiter");
                this.set("activeDIV", "beschreibung");
                this.changeZurueckButton(false, "zurück");
                this.trigger("render", this, this.get("isActive"));
            }
        }
        else if (evt.target.id === "setgeometrie") {
            this.toggleDrawInteraction();
        }
        else if (evt.target.id === "removegeometrie") {
            this.removeAllGeometries();
        }
        else if (evt.target.id === "anredeherr" || evt.target.id === "anredefrau" || evt.target.id === "anredefirma") {
            this.$("#anrede1").removeClass("active");
            this.$("#anrede2").removeClass("active");
            this.$("#anrede3").removeClass("active");
            this.$("#" + evt.target.parentElement.id).addClass("active");
            this.set("kundenanrede", evt.target.textContent);
            this.trigger("render", this, this.get("isActive"));
        }
        else if (evt.target.id === "nutzungsbedingungen") {
            if (evt.target.checked === true) {
                this.$("#nutzungsbedingungentext").removeClass("alert-danger");
            }
            else {
                this.$("#nutzungsbedingungentext").addClass("alert-danger");
            }
            this.set("nutzungsbedingungakzeptiert", evt.target.checked);
        }
        else if (evt.target.id === "gebuehrenordnung") {
            if (evt.target.checked === true) {
                this.$("#gebuehrenordnungtext").removeClass("alert-danger");
            }
            else {
                this.$("#gebuehrenordnungtext").addClass("alert-danger");
            }
            this.set("gebuehrenordnungakzeptiert", evt.target.checked);
        }
    },
    changeWeiterButton: function (enabled, name) {
        this.set("weiterButton", {enabled: enabled, name: name});
    },
    changeZurueckButton: function (enabled, name) {
        this.set("zurueckButton", {enabled: enabled, name: name});
    },
    checkInputKundendaten: function () {
        var checker = this.isValid({validate: true});

        if (checker === true) {
            this.writeCookie();
            this.transmitOrder();
        }
    },
    checkInputBestelldaten: function () {
        var checker = this.isValid();

        if (checker === true) {
            this.set("activeDIV", "kundendaten");
            this.changeWeiterButton(true, "Gebührenpflichtig bestellen");
            this.trigger("render", this, this.get("isActive"));
        }
    },
    transmitOrder: function () {
        // kopiere Attributwerte in für den FME-Prozess taugliche Form
        var zweckGebaeudeeinmessung, zweckGebaeudeabsteckung, zweckLageplan, zweckSonstiges, request_str;

        if (this.get("zweckGebaeudeeinmessung") === true) {
            zweckGebaeudeeinmessung = "ja";
        }
        else {
            zweckGebaeudeeinmessung = "nein";
        }
        if (this.get("zweckGebaeudeabsteckung") === true) {
            zweckGebaeudeabsteckung = "ja";
        }
        else {
            zweckGebaeudeabsteckung = "nein";
        }
        if (this.get("zweckLageplan") === true) {
            zweckLageplan = "ja";
        }
        else {
            zweckLageplan = "nein";
        }
        if (this.get("zweckSonstiges") === true) {
            zweckSonstiges = "ja";
        }
        else {
            zweckSonstiges = "nein";
        }
        // hier wird der request zusammengesetzt
        request_str = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'>";
        request_str += "<ows:Identifier>grenznachweis_communicator.fmw</ows:Identifier>";
        request_str += "  <wps:DataInputs>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>auftragsnummer</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("auftragsnummer")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>lagebeschreibung</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("lage")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>zweck_gebaeudeeinmessung</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + zweckGebaeudeeinmessung + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>zweck_gebaeudeabstckung</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + zweckGebaeudeabsteckung + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>zweck_lageplan</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + zweckLageplan + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>zweck_sonstiges</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + zweckSonstiges + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>freitext</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("freitext")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>kundennummer</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundennummer")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>anrede</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + this.get("kundenanrede") + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>name</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenname")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>firma</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenfirma")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>adresse</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenadresse")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>plz</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenplz")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>ort</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenort")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input><wps:Input>";
        request_str += "    <ows:Identifier>email</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenemail")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>festnetz</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenfestnetz")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>mobilfunk</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + encodeURI(this.get("kundenmobilfunk")) + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "  <wps:Input>";
        request_str += "    <ows:Identifier>geometrien</ows:Identifier>";
        request_str += "    <wps:Data>";
        request_str += "      <wps:LiteralData dataType='string'>" + this.buildJSONGeom() + "</wps:LiteralData>";
        request_str += "    </wps:Data>";
        request_str += "  </wps:Input>";
        request_str += "</wps:DataInputs>";
        request_str += "</wps:Execute>";
        $.ajax({
            url: this.get("wpsurl") + "?Request=Execute&Service=WPS&Version=1.0.0",
            data: request_str,
            headers: {
                "Content-Type": "text/xml; charset=UTF-8"
            },
            context: this,
            method: "POST",
            success: function (data) {
                if (data.getElementsByTagName("jobStatus") !== undefined && data.getElementsByTagName("jobStatus")[0].textContent === "FME_FAILURE") {
                    this.showErrorMessage();
                }
                else {
                    Radio.trigger("Searchbar", "deleteSearchString");
                    this.showSuccessMessage();
                    this.set("auftragsnummer", "");
                    this.set("lage", "");
                    this.set("freitext", "");
                    this.removeAllGeometries();
                }
                Radio.trigger("Window", "collapseWin", this);
                Radio.trigger("Util", "hideLoader");
            },
            error: function () {
                Radio.trigger("Util", "hideLoader");
                Radio.trigger("Window", "collapseWin", this);
                this.showErrorMessage();
            }
        });
        Radio.trigger("Util", "showLoader");
    },
    showErrorMessage: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Ihr Auftrag wurde leider nicht übermittelt.</strong> Bitte versuchen Sie es später erneut.",
            kategorie: "alert-danger"
        });
    },
    showSuccessMessage: function () {
        var ergMsg;

        if (this.get("auftragsnummer") !== "") {
            ergMsg = "mit der Auftragsnummer " + this.get("auftragsnummer") + " ";
        }
        else {
            ergMsg = "";
        }
        Radio.trigger("Alert", "alert", {
            text: "<strong>Ihre Bestellung " + ergMsg + "wurde an unser Funktionspostfach übermittelt.</strong> Die Bearbeitungsdauer wird ca. ein bis drei Werktage betragen. Für telefonische Rückfragen steht Ihnen die Nummer (040) 42826 - 5204 von Montag bis Freitag (8:00-13:00) zur Verfügung. Wir danken für Ihren Auftrag! Sie erhalten umgehend eine E-Mail mit den Bestelldetails.",
            kategorie: "alert-success"
        });
    },
    buildJSONGeom: function () {
        var featurearray = [];

        _.each(this.get("source").getFeatures(), function (item, index) {
            var geom, feature;

            geom = item.getGeometry();
            feature = {
                type: geom.getType(),
                index: index,
                coordinates: geom.getCoordinates()
            };
            featurearray.push(feature);
        });
        return JSON.stringify(featurearray);
    },
    readCookie: function () {
        var pCookie = JSON.parse(cookie.model.getItem());

        if (pCookie !== null) {
            this.set("kundennummer", pCookie.kundennummer);
            this.set("kundenanrede", pCookie.kundenanrede);
            this.set("kundenname", pCookie.kundenname);
            this.set("kundenfirma", pCookie.kundenfirma);
            this.set("kundenadresse", pCookie.kundenadresse);
            this.set("kundenplz", pCookie.kundenplz);
            this.set("kundenort", pCookie.kundenort);
            this.set("kundenemail", pCookie.kundenemail);
            this.set("kundenfestnetz", pCookie.kundenfestnetz);
            this.set("kundenmobilfunk", pCookie.kundenmobilfunk);
        }
    },
    writeCookie: function () {
        var newCookie = {};

        if (cookie.model.get("approved") === true) {
            // schreibe cookie
            newCookie.kundennummer = this.get("kundennummer");
            newCookie.kundenanrede = this.get("kundenanrede");
            newCookie.kundenname = this.get("kundenname");
            newCookie.kundenfirma = this.get("kundenfirma");
            newCookie.kundenadresse = this.get("kundenadresse");
            newCookie.kundenplz = this.get("kundenplz");
            newCookie.kundenort = this.get("kundenort");
            newCookie.kundenemail = this.get("kundenemail");
            newCookie.kundenfestnetz = this.get("kundenfestnetz");
            newCookie.kundenmobilfunk = this.get("kundenmobilfunk");
            cookie.model.setItem(JSON.stringify(newCookie), Infinity);
        }
    },
    toggleDrawInteraction: function () {
        if (this.get("activatedInteraction") === false) {
            this.set("draw", new Draw({
                source: this.get("source"),
                type: "Polygon",
                style: new Style({
                    stroke: new Stroke({
                        color: "orange",
                        width: 2
                    })
                })
            }));
            this.get("draw").on("drawend", function (evt) {
                evt.feature.setStyle(new Style({
                    stroke: new Stroke({
                        color: "green",
                        width: 2
                    })
                }));
            }, this);
            Radio.trigger("Map", "addInteraction", this.get("draw"));
            this.set("activatedInteraction", true);
        }
        else {
            Radio.trigger("Map", "removeInteraction", this.get("draw"));
            this.set("activatedInteraction", false);
            this.sourcechanged();
        }
        this.trigger("render", this, this.get("isActive"));
    },
    removeAllGeometries: function () {
        // lösche alle Geometrien
        this.get("source").clear();
        this.sourcechanged();
    },
    sourcechanged: function () {
        if (this.get("source").getFeatures().length > 0) {
            this.$("#removegeometrie").removeAttr("disabled");
            this.$("#setgeometrie").removeClass("btn-primary");
            this.$("#setgeometrie").addClass("btn-default");
        }
        else {
            this.$("#removegeometrie").prop("disabled", true);
            this.$("#setgeometrie").removeClass("btn-default");
            this.$("#setgeometrie").addClass("btn-primary");
        }
    }
});

export default GrenznachweisModel;
