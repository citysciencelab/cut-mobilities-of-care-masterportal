define([
    "backbone",
    "text!modules/controls/orientation/template.html",
    "modules/controls/orientation/model",
    "config",
    "eventbus"
], function (Backbone, OrientationTemplate, OrientationModel, Config, EventBus) {

    var OrientationView = Backbone.View.extend({
        className: "row",
        template: _.template(OrientationTemplate),
        events: {
            "click .orientationButtons > .glyphicon-map-marker": "getOrientation",
            "click .buttonPOI": "getPOI"
        },
        initialize: function () {
            if (_.has(Config.controls, "poi") === true && Config.controls.poi === true) {
//                require(["views/PointOfInterestView", "views/PointOfInterestListView"], function (PointOfInterestView, PointOfInterestListView) {
//                    // new PointOfInterestView();
//                    new PointOfInterestListView();
//                });
            }
            if (!navigator.geolocation) {
                return;
            }
            else {
                var that = this;

                navigator.geolocation.getCurrentPosition(function (position) {
                    that.finalize();
                }, function (error) {
//                    alert ("Standortbestimmung nicht verfügbar: " + error.message);
                    return;
                });
            }
        },
        finalize: function () {
            EventBus.on("showGeolocationMarker", this.showGeolocationMarker, this);
            EventBus.on("clearGeolocationMarker", this.clearGeolocationMarker, this);
            this.model = OrientationModel;
            this.render();
        },
        showGeolocationMarker: function () {
            $("#geolocation_marker").addClass("glyphicon glyphicon-map-marker geolocation_marker");
        },
        clearGeolocationMarker: function () {
            $("#geolocation_marker").removeClass("geolocation_marker glyphicon glyphicon-map-marker");
        },
        render: function () {
            var attr = Config;

            $(".controls-view").append(this.$el.html(this.template(attr)));
        },
        getOrientation: function () {
            this.model.setOrientation("stdPkt");
        },
        getPOI: function () {
            $(function () {
                $("#loader").show();
            });
            this.model.setOrientation("poi");
        }
    });

    return OrientationView;
});
