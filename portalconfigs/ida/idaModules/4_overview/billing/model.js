define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        BillingModel;

    BillingModel = Backbone.Model.extend({
        defaults: {
            errors: {},
            orderid: "",
            lagebezeichnung: "",
            nutzung: "", // Klarname von Nutzung
            produkt: "", // Klarname von produkt
            jahr: "",
            rechnungName: "",
            rechnungFirma: "",
            rechnungAbteilung: "",
            rechnungAdresse: "",
            rechnungOrt: "",
            rechnungLand: "Deutschland",
            kundenreferenz: "",
            wpsWorkbenchname: "IDARechnungHH"
        },
        initialize: function () {
            var channel = Radio.channel("Billing");

            channel.on({
                "addOrderId": function (orderid) {
                    this.set("orderid", orderid);
                },
                "orderBill": this.orderBill
            }, this);
            channel.reply({
                "getBillDetails": this.getBillDetails
            }, this);

            this.listenTo(Radio.channel("WPS"), {
                "response": function (obj) {
                    this.handleWPSResponse(obj); // Result von wpsWorkbenchnameIDAUmrechnung
                }
            }, this);
        },
        getBillDetails: function () {
            var obj = {
                rechnungName: this.get("rechnungName"),
                rechnungFirma: this.get("rechnungFirma"),
                rechnungAbteilung: this.get("rechnungAbteilung"),
                rechnungAdresse: this.get("rechnungAdresse"),
                rechnungOrt: this.get("rechnungOrt"),
                rechnungLand: this.get("rechnungLand"),
                kundenreferenz: this.get("kundenreferenz")
            };

            return obj;
        },
        validate: function (attributes) {
            var errors = {};

            // sofern schon tlw. Rechnungsdaten eingegeben wurden
            if (attributes.rechnungName !== "" || attributes.rechnungAdresse !== "" || attributes.rechnungOrt !== "") {
                if (attributes.rechnungName === "") {
                    errors.rechnungName = "Bitte Empfänger eingeben.";
                }
                if (attributes.rechnungName.length >= 30) {
                    errors.rechnungName = "Maximale Länge überschritten.";
                }
                if (/[\\/&;´`"']/.test(attributes.rechnungName) !== false) {
                    errors.rechnungName = "Vermeiden Sie bitte Sonderzeichen.";
                }
                if (/[\\/&;´`"']/.test(attributes.rechnungFirma) !== false) {
                    errors.rechnungFirma = "Vermeiden Sie bitte Sonderzeichen.";
                }
                if (/[\\/&;´`"']/.test(attributes.rechnungAbteilung) !== false) {
                    errors.rechnungAbteilung = "Vermeiden Sie bitte Sonderzeichen.";
                }
                if (attributes.rechnungAdresse === "") {
                    errors.rechnungAdresse = "Bitte Adresse eingeben.";
                }
                if (attributes.rechnungAdresse.length >= 35) {
                    errors.rechnungAdresse = "Maximale Länge überschritten.";
                }
                if (/[\\/&;´`"']/.test(attributes.rechnungAdresse) !== false) {
                    errors.rechnungAdresse = "Vermeiden Sie bitte Sonderzeichen.";
                }
                if (attributes.rechnungOrt === "") {
                    errors.rechnungOrt = "Bitte PLZ und Ort eingeben.";
                }
                if (attributes.rechnungOrt.length >= 35) {
                    errors.rechnungOrt = "Maximale Länge überschritten.";
                }
                if (/[\\/&;´`"']/.test(attributes.rechnungOrt) !== false) {
                    errors.rechnungOrt = "Vermeiden Sie bitte Sonderzeichen.";
                }
                if (attributes.rechnungLand === "") {
                    errors.rechnungLand = "Bitte Land eingeben.";
                }
                if (attributes.rechnungLand.length >= 35) {
                    errors.rechnungLand = "Maximale Länge überschritten.";
                }
                if (/[\\/&;´`"']/.test(attributes.rechnungLand) !== false) {
                    errors.rechnungLand = "Vermeiden Sie bitte Sonderzeichen.";
                }
                if (attributes.orderid === "") {
                    errors.rechnungName = "Das Produkt konnte nicht ordnungsgemäß erstellt werden. Eine Erstellung des Gebührenbescheides ist daher nicht möglich. Bitte gehen Sie einen Schritt zurück und versuchen Sie es erneut.";
                }
            }

            // speichert das Ergebnis. Die View reagiert darauf.
            this.set("errors", errors);

            // Triggert über das Radio das Ergebnis
            this.sendStatus(errors);
        },
        /*
        * stellt Request zur Rechnungserstellung bereit
        */
        orderBill: function () {
            var dataInputs = "<wps:DataInputs>";

            if (this.get("rechnungName") !== "" && this.get("rechnungAdresse") !== "" && this.get("rechnungOrt") !== "") {
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("orderid", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("lagebezeichnung", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("nutzung", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("produkt", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("jahr", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("rechnungName", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("rechnungFirma", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("rechnungAbteilung", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("rechnungAdresse", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("rechnungOrt", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("rechnungLand", "string"));
                dataInputs = this.concatStrings (dataInputs, this.returnInputSnippet("kundenreferenz", "string"));
                dataInputs += "</wps:DataInputs>";
                Radio.trigger("WPS", "request", {
                    workbenchname: this.get("wpsWorkbenchname"),
                    dataInputs: dataInputs
                });
            }
            else {
                Radio.trigger("Billing", "billCreated", false);
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
        returnInputSnippet: function (name, typ) {
            var par = this.get(name);

            if (par) {
                return "<wps:Input><ows:Identifier>" + name.toUpperCase() + "</ows:Identifier><wps:Data><wps:LiteralData dataType='" + typ + "'>" + par + "</wps:LiteralData></wps:Data></wps:Input>";
            }
            else {
                return null;
            }
        },
        /**
         * Verarbeitet die WPS-Antwort.
         * @param {object} obj XML der Antwort
         * @fires Billing#billCreated
         */
        handleWPSResponse: function (obj) {
            if (obj.request.workbenchname === this.get("wpsWorkbenchname")) {
                var filepath = $(obj.data).find("wps\\:filepath,filepath")[0].textContent,
                    error = $(obj.data).find("wps\\:ErrorOccured,ErrorOccured")[0].textContent;

                if (error === "No") {
                    var status = Radio.request("DBLogger", "updateAttrByOrderId", "rechnungspfad", filepath, this.get("orderid"));

                    if (status.type === "Success" || status.type === "Ignore") {
                        Radio.trigger("Billing", "billCreated", true);
                        Radio.trigger("Alert", "alert:remove");
                    }
                    else {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Ein interner Fehler ist aufgetreten.</strong> " +
                                "Bitte versuchen Sie es erneut.",
                            kategorie: "alert-danger",
                            position: "center-center"
                        });
                    }
                }
                else {
                    var status = Radio.request("DBLogger", "updateAttrByOrderId", "rechnungspfad", "Fehler aufgetreten", this.get("orderid"));

                    if (status.type === "Success" || status.type === "Ignore") {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Der Gebührenbescheid konnte nicht erstellt werden.</strong> " +
                                "Bitte versuchen Sie es erneut.",
                                kategorie: "alert-danger",
                                position: "center-center"
                            });
                    }
                    else {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Ein interner Fehler ist aufgetreten.</strong> " +
                                "Bitte versuchen Sie es erneut.",
                            kategorie: "alert-danger",
                            position: "center-center"
                        });
                    }
                }
            }
        },
        /**
         * Übernimmt die Werte aus der View ins Model
         * @param {string} id  Name des Wertes, der gesetzt werden soll
         * @param {string} val Wert, der gesetzt werden soll
         */
        keyup: function (id, val) {
            this.set(id, val);
            this.isValid({validate: true});
        },
        /**
         * Triggert das Ergebnis der Validierung
         * @param {object} errors Fehlerliste aus Validierung
         * @fires Billing detailsCompleted#Triggert, ob alle notwendigen Rechnungsdaten eingegeben wurden.
         */
        sendStatus: function (errors) {
            if (_.isEmpty(errors) === false) {
                Radio.trigger("Billing", "detailsCompleted", false);
            }
            else {
                Radio.trigger("Billing", "detailsCompleted", true);
            }
        },
        /**
         * Die Abkürzung der Nutzung wir in einen Klartext umgewandelt.
         * @param {string} nutzung Abkürzung der Nutzung
         */
        setNutzung: function (nutzung) {
            var nutzungKlartext = nutzung;

            if (nutzung === "ETW") {
                nutzungKlartext = "Eigentumswohnung";
            }
            else if (nutzung === "ETW") {
                nutzungKlartext = "Eigentumswohnung";
            }
            else if (nutzung === "TG") {
                nutzungKlartext = "Tiefgaragenstellplatz";
            }
            else if (nutzung === "GAR") {
                nutzungKlartext = "Einzelgarage";
            }
            else if (nutzung === "STP") {
                nutzungKlartext = "Stellplatz";
            }
            else if (nutzung === "EFH") {
                nutzungKlartext = "Ein-/Zweifamilienhaus";
            }
            else if (nutzung === "MFH") {
                nutzungKlartext = "Mehrfamilienhaus";
            }
            else if (nutzung === "GH") {
                nutzungKlartext = "Geschäftshaus";
            }
            else if (nutzung === "LAD") {
                nutzungKlartext = "eingeschossiger Laden";
            }
            else if (nutzung === "BH") {
                nutzungKlartext = "Bürohaus";
            }
            else if (nutzung === "PL") {
                nutzungKlartext = "Produktions-/Logistik-Grundstück";
            }
            else if (nutzung === "BGH") {
                nutzungKlartext = "Büro- und Geschäftshaus";
            }
            else if (nutzung === "WGH") {
                nutzungKlartext = "Wohn- und Geschäftshaus";
            }
            else if (nutzung === "WGB") {
                nutzungKlartext = "Wohn-, Büro- und Geschäftshaus";
            }
            else if (nutzung === "A") {
                nutzungKlartext = "Acker";
            }
            else if (nutzung === "GR") {
                nutzungKlartext = "Grünland";
            }
            else if (nutzung === "EGA") {
                nutzungKlartext = "Erwerbsgartenbaufläche";
            }
            else if (nutzung === "GEM") {
                nutzungKlartext = "Feingemüseland";
            }
            else if (nutzung === "F") {
                nutzungKlartext = "Waldfläche";
            }
            else if (nutzung === "LW") {
                nutzungKlartext = "Begünstigtes Agrarland";
            }

            this.set("nutzung", nutzungKlartext);
        },
        /**
         * Die Abkürzung des Produkts wird in einen Klartext ungewandelt.
         * @param {string} produkt Abkürzung des Produkts
         */
        setProdukt: function (produkt) {
            var produktKlartext = produkt;

            if (produkt === "VW") {
                produktKlartext = "Vorläufiger Vergleichswert";
            }
            else if (produkt === "BW") {
                produktKlartext = "Vorläufiger Bodenwert";
            }
            else if (produkt === "BR") {
                produktKlartext = "Bodenrichtwert";
            }
            else if (produkt === "GF") {
                produktKlartext = "Gebäudefaktor";
            }
            else if (produkt === "EF") {
                produktKlartext = "Ertragsfaktor";
            }
            else if (produkt === "LZ") {
                produktKlartext = "Liegenschaftszinssatz";
            }
            else if (produkt === "SF") {
                produktKlartext = "Sachwertfaktor";
            }

            this.set("produkt", produktKlartext);
        },
        /**
         * Setzt das Jahr
         * @param {string} jahr Jahresangabe
         */
        setJahr: function (jahr) {
            this.set("jahr", jahr);
        },
        /**
         * Setzt die Lagebezeichnung
         * @param {object} lage Objekt mit Lageinformationen
         */
        setLage: function (lage) {
            var objbez = "";

            if (lage.type === "Adresse") {
                objbez = "Grundstück " + lage.strassenname + " " + lage.hausnummer + lage.hausnummerZusatz + " in " + lage.plz + " Hamburg (" + lage.stadtteil + ")";
            }
            else {
                objbez = "Flurstück " + lage.flurstueck + " in der Gemarkung " + lage.gemarkung.name + " (" + lage.gemarkung.nummer + ") in Hamburg (" + lage.stadtteil + ") mit Zuwegung über " + lage.strassendefinition.streetname;
            }

            this.set("lagebezeichnung", objbez);
        }
    });

    return BillingModel;
});
