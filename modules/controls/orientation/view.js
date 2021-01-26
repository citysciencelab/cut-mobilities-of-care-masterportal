import OrientationTemplate from "text-loader!./template.html";
import OrientationModel from "./model";
import POIView from "./poi/view";

const OrientationView = Backbone.View.extend({
    events: {
        "click .orientationButtons > .glyphicon-map-marker": "getOrientation",
        "click .orientationButtons > .glyphicon-record": "getPOI"
    },
    initialize: function (attr) {
        let showGeolocation = null,
            showPoi = null,
            poiDistances = null,
            channel = null;

        this.model = new OrientationModel(Object.assign(attr.config, attr.config.attr));
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
                "change": function () {
                    const changed = this.model.changed;

                    if (changed.hasOwnProperty("tracking")) {
                        this.trackingChanged();
                    }
                    else if (changed.hasOwnProperty("isGeolocationDenied")) {
                        this.toggleBackground();
                    }
                    else if (changed.titleGeolocate || changed.titleGeolocatePOI) {
                        this.render();
                        // check, if WFS-Layer are visible, to render poi-control or not
                        this.checkWFS();
                    }
                }
            }, this);

            this.render();

            if (showPoi === true) {
                new POIView(poiDistances);
            }

            // check, if WFS-Layer are visible, to render poi-control or not
            this.checkWFS();
        }
    },
    className: "row",
    template: _.template(OrientationTemplate),
    render: function () {
        const attr = this.model.toJSON();

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
            this.$el.find(".glyphicon-map-marker").css("background-color", "#E10019");
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
            if (this.model.get("geolocation") !== null) {
                this.model.untrack();
            }
            this.$("#geolocate").removeClass("toggleButtonPressed");
        }
    },
    /*
    * schaltet POI-Control un-/sichtbar
    */
    checkWFS: function () {
        const visibleWFSModels = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"});

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
        else if (this.model.get("geolocation") !== null) {
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

export default OrientationView;
