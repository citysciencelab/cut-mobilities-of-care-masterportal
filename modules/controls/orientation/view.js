define([
    "backbone",
    "text!modules/controls/orientation/template.html",
    "modules/controls/orientation/model",
    "config",
    "eventbus"
], function (Backbone, OrientationTemplate, OrientationModel, Config, EventBus) {
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
            this.listenTo(EventBus, {
                "layerlist:sendVisibleWFSlayerList":this.checkWFS
            });
            this.model.set("zoomMode", Config.controls.orientation);

            if (_.has(Config.controls, "poi") === true && Config.controls.poi === true) {
                require(["modules/controls/orientation/poi/view", "modules/controls/orientation/poi/feature/view"], function (PoiView, FeatureView) {
                    new PoiView();
                });
            }
            this.listenTo(this.model, {
                "change:tracking": this.trackingChanged
            }, this);
            this.render();
            // erst nach render kann auf document.getElementById zugegriffen werden
            this.model.get("marker").setElement(document.getElementById("geolocation_marker"));
        },
        /*
        * Steuert die Darstellung des Geolocate-buttons
        */
        trackingChanged: function (evt) {
            if (this.model.get("tracking") === true) {
                $("#geolocate").addClass("toggleButtonPressed");
            }
            else {
                $("#geolocate").removeClass("toggleButtonPressed");
            }
        },
        render: function () {
            var attr = Config;

            $(".controls-view").append(this.$el.html(this.template(attr)));
        },
        /*
        * schaltet POI-Control un-/sichtbar
        */
        checkWFS: function (visibleWFSLayers) {
            if (visibleWFSLayers.length === 0) {
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
