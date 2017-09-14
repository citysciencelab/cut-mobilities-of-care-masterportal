define([
    "backbone",
    "text!modules/controls/orientation/template.html",
    "modules/controls/orientation/model",
    "config",
    "backbone.radio"
], function (Backbone, OrientationTemplate, OrientationModel, Config, Radio) {
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
            var showGeolocation = this.model.getIsGeoLocationPossible();

            if (showGeolocation) {// Wenn erlaubt, Lokalisierung und InMeinerNähe initialisieren

                var channel = Radio.channel("orientation");

                channel.on({
                    "untrack": this.toggleLocateRemoveClass
                }, this);

                this.listenTo(Radio.channel("ModelList"), {
                    "updateVisibleInMapList": this.checkWFS
                });

                this.listenTo(this.model, {
                    "change:tracking": this.trackingChanged,
                    "change:isGeolocationDenied": this.toggleBackground
                }, this);

                this.render();
                // erst nach render kann auf document.getElementById zugegriffen werden
                this.model.get("marker").setElement(document.getElementById("geolocation_marker"));
                if (this.model.get("isPoiOn")) {
                    require(["modules/controls/orientation/poi/view"], function (POIView) {
                        new POIView();
                    });
                }

                // initialer check, ob WFS-Layer sichtbar sind, damit nach render #geolocatePOI sichtbar wird.
                this.checkWFS();
            }
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },

        /**
         * Ist die Lokalisierung deaktiviert, wird der Button ausgegraut
         * und der POI-Button verschwindet.
         */
        toggleBackground: function () {
            if (this.model.getIsGeolocationDenied() === true) {
                this.$el.find(".glyphicon-map-marker").css("background-color", "rgb(221, 221, 221)");
                this.$el.find(".glyphicon-record").css("display", "none");
            }
            else {
                this.$el.find(".glyphicon-map-marker").css("background-color", "rgb(182, 0, 0)");
            }
        },

        toggleLocateRemoveClass: function () {
            $("#geolocate").removeClass("toggleButtonPressed");
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
