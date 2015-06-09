define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'openlayers',
    'modules/cookie/view'
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
            kundennummer: ''
        },
        initialize: function () {
            EventBus.on("winParams", this.setStatus, this); // Fenstermanagement
            this.set("layer", new ol.layer.Vector({
                source: this.get("source")
            }));
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
            if (cookie.model.hasItem() === true) {
                this.readCookie();
            }
        },
        resetWindow: function () {
        },
        // anonymisierte Events
        keyup: function (evt) {
            if (evt.target.id === 'lagebeschreibung') {
                this.set('lage', evt.target.value);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'auftragsnummer') {
                if (evt.target.value.length < 13) {
                    this.set('auftragsnummer', evt.target.value);
                    $('#auftragsnummer').removeClass('alert alert-danger');
                } else {
                    $('#auftragsnummer').addClass('alert alert-danger');
                }
            } else if (evt.target.id === 'kundennummer') {
                if (evt.target.value.match(/[^0-9\.]/g) || evt.target.value.length != 6) {
                    $('#kundennummer').addClass('alert alert-danger');
                } else {
                    this.set('kundennummer', evt.target.value);
                    $('#kundennummer').removeClass('alert alert-danger');
                }
            } else if (evt.target.id === 'freitext') {
                this.set('freitext', evt.target.value);
            } else if (evt.target.id === 'kundenname') {
                if (evt.target.value.match(/[0-9\.]/g) || evt.target.value.length < 3) {
                    $('#kundenname').addClass('alert alert-danger');
                } else {
                    $('#kundenname').removeClass('alert alert-danger');
                    this.set('kundenname', evt.target.value);
                }
            } else if (evt.target.id === 'kundenfirma') {
                this.set('kundenfirma', evt.target.value);
            } else if (evt.target.id === 'kundenadresse') {
                if (evt.target.value.length < 3) {
                    $('#kundenadresse').addClass('alert alert-danger');
                } else {
                    $('#kundenadresse').removeClass('alert alert-danger');
                    this.set('kundenadresse', evt.target.value);
                }
            } else if (evt.target.id === 'kundenplz') {
                if (evt.target.value.match(/[^0-9\.]/g) || evt.target.value.length !== 5) {
                    $('#kundenplz').addClass('alert alert-danger');
                } else {
                    $('#kundenplz').removeClass('alert alert-danger');
                    this.set('kundenplz', evt.target.value);
                }
            } else if (evt.target.id === 'kundenort') {
                if (evt.target.value.match(/[0-9\.]/g) || evt.target.value.length < 3) {
                    $('#kundenort').addClass('alert alert-danger');
                } else {
                    $('#kundenort').removeClass('alert alert-danger');
                    this.set('kundenort', evt.target.value);
                }
            } else if (evt.target.id === 'kundenemail') {
                if (!evt.target.value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm)) {
                    $('#kundenemail').addClass('alert alert-danger');
                } else {
                    $('#kundenemail').removeClass('alert alert-danger');
                    this.set('kundenemail', evt.target.value);
                }
            } else if (evt.target.id === 'kundenfestnetz') {
                if (evt.target.value.match(/[^0-9\-/.]/g)) {
                    var value = evt.target.value.replace(/[^0-9\-/.]/g, '');
                    evt.target.value = value;
                }
                this.set('kundenfestnetz', evt.target.value);
            } else if (evt.target.id === 'kundenmobilfunk') {
                if (evt.target.value.match(/[^0-9\-/.]/g)) {
                    var value = evt.target.value.replace(/[^0-9\-/.]/g, '');
                    evt.target.value = value;
                }
                this.set('kundenmobilfunk', evt.target.value);
            }
        },
        click: function (evt) {
            if (evt.target.id === 'zweckGebaeudeeinmessung') {
                this.set('zweckGebaeudeeinmessung', evt.target.checked);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'zweckGebaeudeabsteckung') {
                this.set('zweckGebaeudeabsteckung', evt.target.checked);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'zweckLageplan') {
                this.set('zweckLageplan', evt.target.checked);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'zweckSonstiges') {
                this.set('zweckSonstiges', evt.target.checked);
                this.checkInputBestelldaten();
            } else if (evt.target.id === 'weiter') {
                $("#zurueck").removeClass("disabled");
                if ($('.beschreibunggrenznachweis').is(':visible')) {
                    $('.beschreibunggrenznachweis').hide();
                    $('.kundendatengrenznachweis').show();
                    $("#weiter").text("Gebührenpflichtig bestellen");
                } else if ($('.kundendatengrenznachweis').is(':visible')) {
                    this.checkInputKundendaten();
                }
            } else if (evt.target.id === 'zurueck') {
                if ($('.kundendatengrenznachweis').is(':visible')) {
                    $("#weiter").text("weiter");
                    $('.kundendatengrenznachweis').hide();
                    $('.beschreibunggrenznachweis').show();
                    $("#zurueck").addClass("disabled");
                }
            } else if (evt.target.id === 'setgeometrie') {
                if ($("#setgeometrie").hasClass('active')) {
                    $("#setgeometrie").removeClass('active');
                    this.removeDrawInteraction();
                } else {
                    $("#setgeometrie").addClass('active');
                    this.addDrawInteraction();
                }
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
        checkInputKundendaten: function () {
            var checker = true;
            // prüfe Emailsyntax
            if (this.get('kundenemail').match( /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/)) {
                $('#kundenemail').removeClass('alert alert-danger');
            } else {
                $('#kundenemail').addClass('alert alert-danger');
                checker = false;
            }
            if (this.get('kundenname').length >= 3) {
                $('#kundenname').removeClass('alert alert-danger');
            } else {
                $('#kundenname').addClass('alert alert-danger');
                checker = false;
            }
            if (this.get('kundenadresse').length >= 3) {
                $('#kundenadresse').removeClass('alert alert-danger');
            } else {
                $('#kundenadresse').addClass('alert alert-danger');
                checker = false;
            }
            if (this.get('kundenplz').length === 5) {
                $('#kundenplz').removeClass('alert alert-danger');
            } else {
                $('#kundenplz').addClass('alert alert-danger');
                checker = false;
            }
            if (this.get('kundenort').length >= 3) {
                $('#kundenort').removeClass('alert alert-danger');
            } else {
                $('#kundenort').addClass('alert alert-danger');
                checker = false;
            }
            if (this.get('gebuehrenordnungakzeptiert') === true) {
                $('#gebuehrenordnungtext').removeClass('alert-danger');
            } else {
                $('#gebuehrenordnungtext').addClass('alert-danger');
                checker = false;
            }
            if (this.get('nutzungsbedingungakzeptiert') === true) {
                $('#nutzungsbedingungentext').removeClass('alert-danger');
            } else {
                $('#nutzungsbedingungentext').addClass('alert-danger');
                checker = false;
            }
            // weiter oder abbruch?
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
                $('#lagebeschreibung').addClass('alert-danger');
            } else {
                $('#lagebeschreibung').removeClass('alert-danger');
            }
            if (this.get('zweckGebaeudeabsteckung') === false &&
                this.get('zweckGebaeudeeinmessung') === false &&
                this.get('zweckLageplan') === false &&
                this.get('zweckSonstiges') === false) {
                checker = false;
                $('#zweckGebaudeabsteckungtext').addClass('alert-danger');
                $('#zweckGebaeudeeinmessungtext').addClass('alert-danger');
                $('#zweckLageplantext').addClass('alert-danger');
                $('#zweckSonstigestext').addClass('alert-danger');
            } else {
                $('#zweckGebaudeabsteckungtext').removeClass('alert-danger');
                $('#zweckGebaeudeeinmessungtext').removeClass('alert-danger');
                $('#zweckLageplantext').removeClass('alert-danger');
                $('#zweckSonstigestext').removeClass('alert-danger');
            }
            // weiter oder abbruch?
            if (checker === true) {
                $("#weiter").removeClass('disabled');
            } else {
                $("#weiter").addClass('disabled');
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
        addDrawInteraction: function () {
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
        },
        removeDrawInteraction: function () {
            EventBus.trigger("removeInteraction", this.get("draw"));
            this.sourcechanged();
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
