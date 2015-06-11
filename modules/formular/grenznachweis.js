define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'openlayers',
    'modules/cookie/view',
    'bootstrap/alert'
], function (_, Backbone, EventBus, Config, ol, cookie) {

    var grenznachweisModel = Backbone.Model.extend({
        defaults: {
            nutzungsbedingungakzeptiert: false,
            gebuehrenordnungakzeptiert: false,
            lage: '',
            zweckGebaeudeeinmessung: false,
            zweckGebaeudeabsteckung: false,
            zweckLageplan: false,
            zweckSonstiges: false,
            freitext: '',
            punkte: 'knick-eckpunkte',
            kundenanrede: 'Herr',
            source: new ol.source.Vector(),
            kundenname: '',
            kundenfirma: '',
            kundenadresse: '',
            kundenplz: '',
            kundenort: '',
            kundenemail: '',
            kundenfestnetz: '',
            kundenmobilfunk: '',
            auftragsnummer: '',
            kundennummer: '',
            errors: {},
            activatedInteraction: false,
            weiterButton: {enabled: false, name: 'weiter'},
            zurueckButton: {enabled: false, name: 'zurück'},
            activeDIV: 'beschreibung' //beschreibung oder kundendaten
        },
        initialize: function () {
            EventBus.on("winParams", this.setStatus, this); // Fenstermanagement
            this.set("layer", new ol.layer.Vector({
                source: this.get("source")
            }));
            if (cookie.model.hasItem() === true) {
                this.readCookie();
            }
        },
        setStatus: function (args) {   // Fenstermanagement
            if (args[2] === "grenznachweis") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        // Fenstermanagement-Events
        prepWindow: function () {
        },
        resetWindow: function () {
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
                return new RegExp(pattern, "gi").test(value) ? true : false;
            },
            hasCharacters: function (value) {
                return TreeFilter.prototype.validators.pattern(value, TreeFilter.prototype.patterns.digits);
            }
        },
        validate: function (attributes, identifier) {
            var errors = {};
            if (identifier.validate === 'auftragsnummer') {
                if (this.validators.maxLength(attributes.auftragsnummer, 12) === false) {
                    errors.auftragsnummer = "Maximallänge 12 Zeichen überschritten";
                }
            }
            if (identifier.validate === 'lage') {
                if (this.validators.minLength(attributes.lage, 3) === false) {
                    errors.lage = "Lagebeschreibung notwendig";
                }
            }
            if (identifier.validate === 'zweck') {
                if (attributes.zweckGebaeudeeinmessung === false && attributes.zweckGebaeudeabsteckung === false && attributes.zweckLageplan === false && attributes.zweckSonstiges === false) {
                    errors.zweck = "Min. ein Feld muss markiert sein.";
                }
            }
            if (identifier.validate === 'kundennummer') {
                if (errors.kundennummer !== '') {
                    if (this.validators.pattern(attributes.kundennummer, '[^0-9\]') === true || attributes.kundennummer.length !== 6) {
                        errors.kundennummer = "Numerischer Wert der Länge 6 erwartet.";
                    }
                }
            }
            if (identifier.validate === 'kundenname1') {
                if (this.validators.pattern(attributes.kundenname, '[0-9\]') === true) {
                    errors.kundenname = "Alphanumerischer Wert erwartet.";
                }
            }
            if (identifier.validate === 'kundenname2' || identifier.validate === true) {
                if (this.validators.minLength(attributes.kundenname, 3) === false) {
                    errors.kundenname = "Name notwendig.";
                }
            }
            if (identifier.validate === 'kundenadresse' || identifier.validate === true) {
                if (this.validators.minLength(attributes.kundenadresse, 3) === false) {
                    errors.kundenadresse = "Adressangabe notwendig.";
                }
            }
            if (identifier.validate === 'kundenplz' || identifier.validate === true) {
                if (this.validators.pattern(attributes.kundenplz, '[^0-9\]') === true || attributes.kundenplz.length !== 5) {
                    errors.kundenplz = "Numerischer Wert der Länge 5 erwartet.";
                }
            }
            if (identifier.validate === 'kundenort' || identifier.validate === true) {
                if (this.validators.pattern(attributes.kundenort, '[0-9\]') === true || this.validators.minLength(attributes.kundenort, 3) === false) {
                    errors.kundenort = "Alphanumerischer Wert erwartet.";
                }
            }
            if (identifier.validate === 'kundenemail' || identifier.validate === true) {
                if (this.validators.minLength(attributes.kundenort, 1) === false || attributes.kundenemail.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm) === null) {
                    errors.kundenemail = "Syntax inkorrekt.";
                }
            }
            if (identifier.validate === 'kundenfestnetz' || identifier.validate === true) {
                if (this.validators.pattern(attributes.kundenfestnetz, '[^0-9\-/]') === true) {
                    errors.kundenfestnetz = "Numerischer Wert erwartet.";
                }
            }
            if (identifier.validate === 'kundenmobilfunk' || identifier.validate === true) {
                if (this.validators.pattern(attributes.kundenmobilfunk, '[^0-9\-/]') === true) {
                    errors.kundenmobilfunk = "Numerischer Wert erwartet.";
                }
            }
            if (identifier.validate === true) {
                if (attributes.nutzungsbedingungakzeptiert === false) {
                    errors.nutzungsbedingungakzeptiert = "Zustimmung ist obligatorisch.";
                }
                if (attributes.gebuehrenordnungakzeptiert === false) {
                    errors.gebuehrenordnungakzeptiert = "Kenntnisnahme ist obligatorisch.";
                }
            }
            // return die Errors
            this.set("errors", errors);
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        },
        // anonymisierte Events
        focusout: function (evt) {
            if (evt.target.id === 'lagebeschreibung') {
                this.set('lage', evt.target.value, {validate:'lage'});
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'kundennummer') {
                this.set('kundennummer', evt.target.value, {validate: 'kundennummer'});
            } else if (evt.target.id === 'kundenname') {
                this.set('kundenname', evt.target.value, {validate: 'kundenname2'});
            } else if (evt.target.id === 'kundenadresse') {
                this.set('kundenadresse', evt.target.value, {validate: 'kundenadresse'});
            } else if (evt.target.id === 'kundenplz') {
                this.set('kundenplz', evt.target.value, {validate: 'kundenplz'});
            } else if (evt.target.id === 'kundenort') {
                this.set('kundenort', evt.target.value, {validate: 'kundenort'});
            } else if (evt.target.id === 'kundenemail') {
                this.set('kundenemail', evt.target.value, {validate: 'kundenemail'});
            }
        },
        keyup: function (evt) {
            if (evt.target.id === 'lagebeschreibung') {
                this.set('lage', evt.target.value);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'auftragsnummer') {
                this.set('auftragsnummer', evt.target.value, {validate: 'auftragsnummer'});
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'kundennummer') {
                this.set('kundennummer', evt.target.value);
            } else if (evt.target.id === 'freitext') {
                this.set('freitext', evt.target.value);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'kundenname') {
                this.set('kundenname', evt.target.value, {validate: 'kundenname1'});
            } else if (evt.target.id === 'kundenfirma') {
                this.set('kundenfirma', evt.target.value);
            } else if (evt.target.id === 'kundenadresse') {
                this.set('kundenadresse', evt.target.value);
            } else if (evt.target.id === 'kundenplz') {
                this.set('kundenplz', evt.target.value);
            } else if (evt.target.id === 'kundenort') {
                this.set('kundenort', evt.target.value);
            } else if (evt.target.id === 'kundenemail') {
                // nutze lieber focusout
            } else if (evt.target.id === 'kundenfestnetz') {
                this.set('kundenfestnetz', evt.target.value, {validate: 'kundenfestnetz'});
            } else if (evt.target.id === 'kundenmobilfunk') {
                this.set('kundenmobilfunk', evt.target.value, {validate: 'kundenmobilfunk'});
            }
        },
        click: function (evt) {
            if (evt.target.id === 'zweckGebaeudeeinmessung') {
                this.set('zweckGebaeudeeinmessung', evt.target.checked, {validate: 'zweck'});
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'zweckGebaeudeabsteckung') {
                this.set('zweckGebaeudeabsteckung', evt.target.checked, {validate: 'zweck'});
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'zweckLageplan') {
                this.set('zweckLageplan', evt.target.checked, {validate: 'zweck'});
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'zweckSonstiges') {
                this.set('zweckSonstiges', evt.target.checked, {validate: 'zweck'});
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'weiter') {
                this.changeZurueckButton(true, 'zurück');
                if (this.get('activeDIV') === 'beschreibung') {
                    this.set('activeDIV', 'kundendaten');
                    this.changeWeiterButton(true, 'Gebührenpflichtig bestellen');
                } else if (this.get('activeDIV') === 'kundendaten') {
                    this.checkInputKundendaten();
                }
            } else if (evt.target.id === 'zurueck') {
                if (this.get('activeDIV') === 'kundendaten') {
                    this.changeWeiterButton(true, 'weiter');
                    this.set('activeDIV', 'beschreibung');
                    this.changeZurueckButton(false, 'zurück');
                }
            } else if (evt.target.id === 'setgeometrie') {
                this.toggleDrawInteraction();
            } else if (evt.target.id === 'removegeometrie') {
                this.removeAllGeometries();
            } else if (evt.target.id === 'anredeherr' || evt.target.id === 'anredefrau' || evt.target.id === 'anredefirma') {
                $("#anrede1").removeClass('active');
                $("#anrede2").removeClass('active');
                $("#anrede3").removeClass('active');
                $("#" + evt.target.parentElement.id).addClass('active');
                this.set('kundenanrede', evt.target.textContent);
            } else if (evt.target.id === 'nutzungsbedingungen') {
                if (evt.target.checked === true) {
                    $('#nutzungsbedingungentext').removeClass('alert-danger');
                } else {
                    $('#nutzungsbedingungentext').addClass('alert-danger');
                }
                this.set('nutzungsbedingungakzeptiert', evt.target.checked);
            } else if (evt.target.id === 'gebuehrenordnung') {
                if (evt.target.checked === true) {
                    $('#gebuehrenordnungtext').removeClass('alert-danger');
                } else {
                    $('#gebuehrenordnungtext').addClass('alert-danger');
                }
                this.set('gebuehrenordnungakzeptiert', evt.target.checked);
            }
        },
        changeWeiterButton: function (enabled, name) {
            this.set('weiterButton', {enabled: enabled, name: name});
        },
        changeZurueckButton: function (enabled, name) {
            this.set('zurueckButton', {enabled: enabled, name: name});
        },
        checkInputKundendaten: function () {
            var checker = this.isValid({validate:true});
            if (checker === true) {
                this.writeCookie();
                this.transmitOrder();
            }
        },
        checkInputBestelldaten: function () {
            var checker = true;
            if (this.get('source').getFeatures().length === 0) {
                checker = false;
            }
            if (this.get('lage') === '') {
                checker = false;
            }
            if (this.get('zweckGebaeudeabsteckung') === false &&
                this.get('zweckGebaeudeeinmessung') === false &&
                this.get('zweckLageplan') === false &&
                this.get('zweckSonstiges') === false) {
                checker = false;
            }
            // weiter oder abbruch?
            if (checker === true) {
                this.changeWeiterButton(true, 'weiter');
            } else {
                this.changeWeiterButton(false, 'weiter');
            }
        },
        transmitOrder: function () {
            // kopiere Attributwerte in für den FME-Prozess taugliche Form
            if (this.get('zweckGebaeudeeinmessung') === true) {
                var zweckGebaeudeeinmessung = 'ja';
            } else {
                var zweckGebaeudeeinmessung = 'nein';
            }
            if (this.get('zweckGebaeudeabsteckung') === true) {
                var zweckGebaeudeabsteckung = 'ja';
            } else {
                var zweckGebaeudeabsteckung = 'nein';
            }
            if (this.get('zweckLageplan') === true) {
                var zweckLageplan = 'ja';
            } else {
                var zweckLageplan = 'nein';
            }
            if (this.get('zweckSonstiges') === true) {
                var zweckSonstiges = 'ja';
            } else {
                var zweckSonstiges = 'nein';
            }
            // hier wird der request zusammengesetzt
            var request_str = '<wps:Execute xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ows="http://www.opengis.net/ows/1.1" service="WPS" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd">';
            request_str += '<ows:Identifier>grenznachweis_communicator.fmw</ows:Identifier>';
            request_str += '  <wps:DataInputs>';

            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>lagebeschreibung</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('lage') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>zweck_gebaeudeeinmessung</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + zweckGebaeudeeinmessung + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>zweck_gebaeudeabstckung</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + zweckGebaeudeabsteckung + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>zweck_lageplan</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + zweckLageplan + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>zweck_sonstiges</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + zweckSonstiges + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>freitext</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('freitext') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>kundennummer</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundennummer') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>anrede</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenanrede') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>name</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenname') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>firma</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenfirma') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>adresse</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenadresse') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>plz</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenplz') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>ort</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenort') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input><wps:Input>';
            request_str += '    <ows:Identifier>email</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenemail') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>festnetz</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenfestnetz') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>mobilfunk</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.get('kundenmobilfunk') + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '  <wps:Input>';
            request_str += '    <ows:Identifier>geometrien</ows:Identifier>';
            request_str += '    <wps:Data>';
            request_str += '      <wps:LiteralData dataType="string">' + this.buildJSONGeom() + '</wps:LiteralData>';
            request_str += '    </wps:Data>';
            request_str += '  </wps:Input>';
            request_str += '</wps:DataInputs>';
            request_str += '</wps:Execute>';
            $.ajax({
                url: '/geofos/deegree-wps/services/wps?Request=Execute&Service=WPS&Version=1.0.0&Identifier=grenznachweis_communicator.fmw',
                data: request_str,
                headers: {
                    "Content-Type": "text/xml; charset=UTF-8"
                },
                context: this,
                method: "POST",
                success: function (data, jqXHR) {
                    EventBus.trigger('collapseWindow', this);
                    $("#loader").hide();
                    this.removeAllGeometries();
                    var div = '<div class="alert alert-success alert-dismissible" role="alert" style="position: absolute; left: 25%; bottom: 50%;width: 50%;"><button type="button" class="close" data-dismiss="alert"  aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Ihr Auftrag wurde erfolgreich übermittelt.</strong> Sie erhalten in Kürze eine E-Mail an die angegebene Adresse.</div>';
                    $("body").append(div);
                },
                error: function (data, jqXHR) {
                    $("#loader").hide();
                    EventBus.trigger('collapseWindow', this);
                    var div = '<div class="alert alert-danger alert-dismissible" role="alert" style="position: absolute; left: 25%; bottom: 50%;width: 50%;"><button type="button" class="close" data-dismiss="alert"  aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Ihr Auftrag wurde leider nicht übermittelt.</strong> Bitte versuchen Sie es später erneut.</div>';
                    $("body").append(div);
                }
            });
            $('#loader').show();
        },
        buildJSONGeom: function () {
            var featurearray = [];
            _.each(this.get('source').getFeatures(), function (item, index, array) {
                var geom = item.getGeometry();
                var feature = {
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
                this.set('kundennummer', pCookie.kundennummer);
                this.set('kundenanrede', pCookie.kundenanrede);
                this.set('kundenname', pCookie.kundenname);
                this.set('kundenfirma', pCookie.kundenfirma);
                this.set('kundenadresse', pCookie.kundenadresse);
                this.set('kundenplz', pCookie.kundenplz);
                this.set('kundenort', pCookie.kundenort);
                this.set('kundenemail', pCookie.kundenemail);
                this.set('kundenfestnetz', pCookie.kundenfestnetz);
                this.set('kundenmobilfunk', pCookie.kundenmobilfunk);
            }
        },
        writeCookie: function () {
            if (cookie.model.get('approved') === true) {
                // schreibe cookie
                var newCookie = new Object();
                newCookie.kundennummer = this.get('kundennummer');
                newCookie.kundenanrede = this.get('kundenanrede');
                newCookie.kundenname = this.get('kundenname');
                newCookie.kundenfirma = this.get('kundenfirma');
                newCookie.kundenadresse = this.get('kundenadresse');
                newCookie.kundenplz = this.get('kundenplz');
                newCookie.kundenort = this.get('kundenort');
                newCookie.kundenemail = this.get('kundenemail');
                newCookie.kundenfestnetz = this.get('kundenfestnetz');
                newCookie.kundenmobilfunk = this.get('kundenmobilfunk');
                cookie.model.setItem(JSON.stringify(newCookie), Infinity);
            }
        },
        toggleDrawInteraction: function () {
            if (this.get('activatedInteraction') === false) {
                EventBus.trigger("addLayer", this.get("layer"));
                this.set('draw', new ol.interaction.Draw({
                    source: this.get('source'),
                    type: 'Polygon',
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'orange',
                            width: 2
                        })
                    })
                }));
                this.get("draw").on("drawend", function (evt) {
                    evt.feature.setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'green',
                            width: 2
                        })
                    }));
                }, this);
                EventBus.trigger("addInteraction", this.get("draw"));
                this.set('activatedInteraction', true);
            } else {
                EventBus.trigger("removeInteraction", this.get("draw"));
                this.set('activatedInteraction', false);
                this.sourcechanged();
            }
            this.trigger('render');
        },
        removeAllGeometries: function () {
            // lösche alle Geometrien
            this.get("source").clear();
            EventBus.trigger("removeLayer", this.get("layer"));
            this.sourcechanged();
        },
        sourcechanged: function () {
            if (this.get('source').getFeatures().length > 0) {
                $("#removegeometrie").removeAttr('disabled');
                $("#setgeometrie").removeClass('btn-primary');
                $("#setgeometrie").addClass('btn-default');
            } else {
                $("#removegeometrie").prop('disabled', true);
                $("#setgeometrie").removeClass('btn-default');
                $("#setgeometrie").addClass('btn-primary');
            }
            this.checkInputBestelldaten();
        }
    });

    return new grenznachweisModel();
});
