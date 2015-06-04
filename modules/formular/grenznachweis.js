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
            lage: '',
            zweck: '',
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
            kundenmobilfunk: ''
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
                var pCookie = JSON.parse(cookie.model.getItem());
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
        resetWindow: function () {
        },
        // anonymisierte Events
        keyup: function (evt) {
            if (evt.target.id === 'lagebeschreibung') {
                this.set('lage', evt.target.value);
            } else if (evt.target.id === 'zweck') {
                this.set('zweck', evt.target.value);
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
                this.set('kundenadresse', evt.target.value);
            } else if (evt.target.id === 'kundenplz') {
                if (evt.target.value.match(/[^0-9\.]/g) || evt.target.value.length > 5) {
                    $('#kundenplz').addClass('alert alert-danger');
                } else {
                    $('#kundenplz').removeClass('alert alert-danger');
                    this.set('kundenplz', value);
                }
            } else if (evt.target.id === 'kundenort') {
                this.set('kundenort', evt.target.value);
            } else if (evt.target.id === 'kundenemail') {
                if (!evt.target.value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm)) {
                    $('#kundenemail').addClass('alert alert-danger');
                } else {
                    $('#kundenemail').removeClass('alert alert-danger');
                    this.set('kundenemail', evt.target.value);
                }
            } else if (evt.target.id === 'kundenfestnetz') {
                if (evt.target.value.match(/[^0-9/-\.]/g)) {
                    var value = evt.target.value.replace(/[^0-9/-\.]/g,'');
                    evt.target.value = value;
                }
                this.set('kundenfestnetz', value);
            } else if (evt.target.id === 'kundenmobilfunk') {
                if (evt.target.value.match(/[^0-9/-\.]/g)) {
                    var value = evt.target.value.replace(/[^0-9/-\.]/g,'');
                    evt.target.value = value;
                }
                this.set('kundenmobilfunk', evt.target.value);
            }
        },
        click: function (evt) {
            if (evt.target.id === 'eckpunkte') {
                this.set('punkte', 'eckpunkte');
            } else if (evt.target.id === 'knick-eckpunkte') {
                this.set('punkte', 'knick-eckpunkte');
            } else if (evt.target.id === 'weiter') {
                $("#zurueck").removeClass("disabled");
                if ($('.beschreibunggrenznachweis').is(':visible')) {
                    $('.beschreibunggrenznachweis').hide();
                    $('.kundendatengrenznachweis').show();
                    $("#weiter").text("abschicken");
                } else if ($('.kundendatengrenznachweis').is(':visible')) {
                    // prüfe Emailsyntax
                    if (this.get('kundenemail').match( /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/)) {
                        console.log('j');
                        // schreibe cookie
                        var newCookie = new Object();
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
                $("#weiter").removeClass('disabled');
                $("#setgeometrie").removeClass('btn-primary');
                $("#setgeometrie").addClass('btn-default');
            } else {
                $("#removegeometrie").prop('disabled', true);
                $("#weiter").addClass('disabled');
                $("#setgeometrie").removeClass('btn-default');
                $("#setgeometrie").addClass('btn-primary');
            }
        }
    });

    return new grenznachweisModel();
});
