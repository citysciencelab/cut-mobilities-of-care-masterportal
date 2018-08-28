define(function (require) {
    var OrientationTemplate = require("text!modules/controls/orientation/template.html"),
        OrientationModel = require("modules/controls/orientation/model"),
        OrientationView;

    OrientationView = Backbone.View.extend({
        className: "row",
        template: _.template(OrientationTemplate),
        events: {
            "click .orientationButtons > .glyphicon-map-marker": "getOrientation",
            "click .orientationButtons > .glyphicon-record": "getPOI"
        },
        initialize: function (attr) {
            var showGeolocation,
                showPoi,
                poiDistances,
                channel;

            this.model = new OrientationModel(attr.config);
            showGeolocation = this.model.get("isGeoLocationPossible");
            showPoi = this.model.get("showPoi");
            poiDistances = this.model.get("poiDistances");
            if (showGeolocation) { // Wenn erlaubt, Lokalisierung und InMeinerNähe initialisieren
                channel = Radio.channel("orientation");

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

                if (showPoi === true) {
                    require(["modules/controls/orientation/poi/view"], function (POIView) {
                        new POIView(poiDistances);
                    });
                }

                // initialer check, ob WFS-Layer sichtbar sind, damit nach render #geolocatePOI sichtbar wird.
                this.checkWFS();
            }
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            // fügt dem ol.Overlay das Element hinzu, welches erst nach render existiert.
            this.model.addElement();
            return this;
        },

        /**
         * Ist die Lokalisierung deaktiviert, wird der Button ausgegraut
         * und der POI-Button verschwindet.
         * @returns {void}
         */
        toggleBackground: function () {
            if (this.model.get("isGeolocationDenied") === true) {
                this.$el.find(".glyphicon-map-marker").css("background-color", "rgb(221, 221, 221)");
                this.$el.find(".glyphicon-record").css("display", "none");
            }
            else {
                this.$el.find(".glyphicon-map-marker").css("background-color", "rgb(182, 0, 0)");
            }
        },

        toggleLocateRemoveClass: function () {
            this.$("#geolocate").removeClass("toggleButtonPressed");
        },
        /*
        * Steuert die Darstellung des Geolocate-buttons
        */
        trackingChanged: function () {
            if (this.model.get("tracking") === true) {
                this.$("#geolocate").addClass("toggleButtonPressed");
            }
            else {
                this.$("#geolocate").removeClass("toggleButtonPressed");
            }
        },
        /*
        * schaltet POI-Control un-/sichtbar
        */
        checkWFS: function () {
            var visibleWFSModels = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"});

            if (visibleWFSModels.length === 0) {
                this.$("#geolocatePOI").hide();
            }
            else {
                this.$("#geolocatePOI").show();
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
            Radio.trigger("Util", "showLoader");
            this.model.trackPOI();
        }
    });

    return OrientationView;
});
