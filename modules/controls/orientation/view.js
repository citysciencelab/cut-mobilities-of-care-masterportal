define([
    "backbone",
    "text!modules/controls/orientation/template.html",
    "modules/controls/orientation/model",
    "config",
    "backbone.radio",
    "modules/core/util"
], function (Backbone, OrientationTemplate, OrientationModel, Config, Radio, Util) {
    "use strict";
    var OrientationView = Backbone.View.extend({
        className: "row",
        template: _.template(OrientationTemplate),
        model: OrientationModel,
        events: {
            "click .orientationButtons > .glyphicon-map-marker": "getOrientation",
            "click .orientationButtons > .glyphicon-record": "getPOI"
        },
        initialize: function () {
            // Chrome erlaubt nur bei https-Seiten die Lokalisierung (stand: 20.07.2016).
            // Deshalb nehmen wir bei Chrome die Lokalisierung raus, da unsere Portale auf http laufen und die Dienste auch.
            if (!(Util.isChrome() === true && window.location.protocol === "http:")) {// wenn es nicht Chrome UND http ist, Lokalisierung und InMeinerNähe initialisieren
                this.listenTo(Radio.channel("ModelList"), {
                    "updateVisibleInMapList": this.checkWFS
                });

                this.listenTo(this.model, {
                    "change:tracking": this.trackingChanged
                }, this);
                this.render();
                // erst nach render kann auf document.getElementById zugegriffen werden
                this.model.get("marker").setElement(document.getElementById("geolocation_marker"));
            }
        },
        /*
        * Steuert die Darstellung des Geolocate-buttons
        */
        trackingChanged: function () {
            if (this.model.get("tracking") === true) {
                $("#geolocate").addClass("toggleButtonPressed");
            }
            else {
                $("#geolocate").removeClass("toggleButtonPressed");
            }
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        /*
        * schaltet POI-Control un-/sichtbar
        */
        checkWFS: function () {
            var visibleWFSModels = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"});

            if (visibleWFSModels.length === 0) {
                $("#geolocatePOI").hide();
            }
            else {
                $("#geolocatePOI").show();
            }
        },
        /*
        * ButtonCall
        */
        getOrientation: function () {
            if (this.model.get("tracking") === false) {
                this.model.track();
            }
            else {
                this.model.untrack();
            }
        },
        /*
        * ButtonCall
        */
        getPOI: function () {
            $(function () {
                $("#loader").show();
            });
            this.model.trackPOI();
        }
    });

    return OrientationView;
});
