define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
    'openlayers'
], function (_, Backbone, EventBus, Config, ol) {

    var grenznachweisModel = Backbone.Model.extend({
        defaults: {
            lage: '',
            zweck: '',
            freitext: '',
            punkte: 'knick-eckpunkte',
            source: new ol.source.Vector()
        },
        initialize: function () {
            EventBus.on("getDrawlayer", this.getLayer, this);
            EventBus.on("winParams", this.setStatus, this); // Fenstermanagement
            this.set("layer", new ol.layer.Vector({
                source: this.get("source")
            }));
            EventBus.trigger("addLayer", this.get("layer"));
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
        // anonymisierte Events
        keyup: function (evt) {
            if (evt.target.id === 'lagebeschreibung') {
                this.set('lage', evt.target.value);
            } else if (evt.target.id === 'zweck') {
                this.set('zweck', evt.target.value);
            } else if (evt.target.id === 'freitext') {
                this.set('freitext', evt.target.value);
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
                    // ab die Post
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
            }
        },
        addDrawInteraction: function () {
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
            this.sourcechanged();
        },
        getLayer: function () {
            EventBus.trigger("sendDrawLayer", this.get("layer"));
        },
        sourcechanged: function () {
            if (this.get('source').getFeatures().length > 0) {
                $("#removegeometrie").removeAttr('disabled');
            } else {
                $("#removegeometrie").prop('disabled', true);
            }
        }
    });

    return new grenznachweisModel();
});
