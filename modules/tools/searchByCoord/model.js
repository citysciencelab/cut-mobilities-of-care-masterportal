define([
    "backbone",
    "openlayers",
    "eventbus",
    "proj4",
    "config"
], function (Backbone, ol, EventBus, proj4, Config) {

    var SearchByCoord = Backbone.Model.extend({

        defaults: {
            "coordSystem": "ETRS89",
            "coordSystems": ["ETRS89", "WGS84"],
            "coordinatesEasting": "",
            "coordinatesNorthing": ""
        },
        initialize: function () {

            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });
        },
        validate: function (attributes) {
            var validETRS89 = "[0-9]{6,7}[.]{1}[0-9]{0,3}",
                validWGS84 = "[0-9]{0,2}";

            if (attributes.coordSystem === "ETRS89") {
                _.each(attributes.coordinates, function (value, key) {
                    var fieldName;

                    $(fieldName + ".text-danger").html("");
                    if (key === 0) {
                        fieldName = "#coordinatesEastingField";
                    }
                    else {
                        fieldName = "#coordinatesNorthingField";
                    }
                    if (value.coord.length < 1) {
                        value.ErrorMsg = "Bitte geben Sie ihren " + value.key + " ein";
                        $(fieldName + "+ .text-danger").html("");
                        $(fieldName).after("<span class='text-danger'><small>" + value.ErrorMsg + "</small></span>");
                        $(fieldName).parent().addClass("has-error");
                    }
                    else if (!value.coord.match(validETRS89)) {
                        value.ErrorMsg = "Die Eingabe für den " + value.key + " ist nicht korrekt! (Beispiel: " + value.example + ")";
                        $(fieldName + "+ .text-danger").html("");
                        $(fieldName).after("<span class='text-danger'><small>" + value.ErrorMsg + "</small></span>");
                        $(fieldName).parent().addClass("has-error");
                    }
                    else {
                        $(fieldName + "+ .text-danger").html("");
                        $(fieldName).parent().removeClass("has-error");
                        EventBus.trigger("alert:remove");
                    }
                });
            }
            else if (attributes.coordSystem === "WGS84") {
                _.each(attributes.coordinates[0].coord, function (value) {
                    console.log(value);
                });
                _.each(attributes.coordinates[1].coord, function (value) {
                        console.log(value);
                });

            }
            if (attributes.coordinates[0].ErrorMsg || attributes.coordinates[1].ErrorMsg) {
                return "Fehlerhafte Eingabe!";
            }
        },
        setStatus: function (args) {
            if (args[2] === "searchByCoord") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        setCoordSystem: function (value) {
            this.set("coordSystem", value);
        },
        setCoordinates: function (easting, northing) {
            var coordinateArray = [{"coord": easting, "key": "Rechtswert", "example": "566061.052"}, {"coord": northing, "key": "Hochwert", "example": "5934685.516"}];

            this.set("coordinates", coordinateArray);
            this.validateCoordinates();
        },
        validateCoordinates: function () {
            if (this.isValid()) {
                this.getNewCenter();
            }
        },
        getNewCenter: function () {
            if (this.get("coordSystem") === "WGS84") {
                var easting = (this.get("coordinates")[0].coord[0] * 1) + (this.get("coordinates")[0].coord[1] * 1 / 60) + (this.get("coordinates")[0].coord[2] * 1 / 60 / 60),
                northing = (this.get("coordinates")[1].coord[0] * 1) + ((this.get("coordinates")[1].coord[1] * 1) / 60) + ((this.get("coordinates")[1].coord[2] * 1) / 60 / 60);

                this.set("newCenter", proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [northing, easting]));
            }
            else if (this.get("coordSystem") === "ETRS89") {
                this.set("newCenter", [this.get("coordinates")[0].coord, this.get("coordinates")[1].coord]);
            }
            EventBus.trigger("mapHandler:zoomTo", {type: "SearchByCoord", coordinate: this.get("newCenter")});
        }
    });

    return new SearchByCoord();
});
