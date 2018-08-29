define(function (require) {

    var proj4 = require("proj4"),
        $ = require("jquery"),
        Tool = require("modules/core/modelList/tool/model"),
        SearchByCoord;

    SearchByCoord = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            "coordSystem": "ETRS89",
            "coordSystems": ["ETRS89", "WGS84", "WGS84(Dezimalgrad)"],
            "coordinatesEasting": "",
            "coordinatesNorthing": "",
            renderToWindow: true
        }),
        initialize: function () {
            this.superInitialize();
        },
        validate: function (attributes) {
            var validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
                validWGS84 = /^\d[0-9]{0,2}[°]{0,1}\s*[0-9]{0,2}['`´]{0,1}\s*[0-9]{0,2}['`´]{0,2}["]{0,2}\s*$/,
                validWGS84_dez = /[0-9]{1,3}[.,]{0,1}[0-9]{0,5}[\s]{0,1}[°]{0,1}\s*$/;

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
                    if (_.isUndefined(value.coord) || value.coord.length < 1) {
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
                        Radio.trigger("Alert", "alert:remove");
                    }
                });
            }
            else if (attributes.coordSystem === "WGS84") {
                if (_.isUndefined(attributes.coordinates[0].coord) || attributes.coordinates[0].coord.length < 1) {
                    attributes.coordinates[0].ErrorMsg = "Bitte geben Sie ihren " + attributes.coordinates[0].key + " vollständig ein";
                    $("#coordinatesEastingField + .text-danger").html("");
                    $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                    $("#coordinatesEastingField").parent().addClass("has-error");
                }
                else if (_.isNull(attributes.coordinates[0].coord.match(validWGS84))) {
                    attributes.coordinates[0].ErrorMsg = "Die Eingabe für den " + attributes.coordinates[0].key + " ist nicht korrekt! (Beispiel: " + attributes.coordinates[0].example + ")";
                    $("#coordinatesEastingField + .text-danger").html("");
                    $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                    $("#coordinatesEastingField").parent().addClass("has-error");
                }
                else {
                    $("#coordinatesEastingField + .text-danger").html("");
                    $("#coordinatesEastingField").parent().removeClass("has-error");
                    Radio.trigger("Alert", "alert:remove");
                }

                if (_.isUndefined(attributes.coordinates[0].coord) || attributes.coordinates[1].coord.length < 1) {
                    attributes.coordinates[1].ErrorMsg = "Bitte geben Sie ihren " + attributes.coordinates[1].key + " vollständig ein";
                    $("#coordinatesNorthingField + .text-danger").html("");
                    $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                    $("#coordinatesNorthingField").parent().addClass("has-error");
                }
                else if (_.isNull(attributes.coordinates[1].coord.match(validWGS84))) {
                    attributes.coordinates[1].ErrorMsg = "Die Eingabe für den " + attributes.coordinates[1].key + " ist nicht korrekt! (Beispiel: " + attributes.coordinates[1].example + ")";
                    $("#coordinatesNorthingField + .text-danger").html("");
                    $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                    $("#coordinatesNorthingField").parent().addClass("has-error");
                }
                else {
                    $("#coordinatesNorthingField + .text-danger").html("");
                    $("#coordinatesNorthingField").parent().removeClass("has-error");
                    Radio.trigger("Alert", "alert:remove");
                }
            }
            else if (attributes.coordSystem === "WGS84(Dezimalgrad)") {
                if (_.isUndefined(attributes.coordinates[0].coord) || attributes.coordinates[0].coord.length < 1) {
                    attributes.coordinates[0].ErrorMsg = "Bitte geben Sie ihren " + attributes.coordinates[0].key + " ein";
                    $("#coordinatesEastingField + .text-danger").html("");
                    $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                    $("#coordinatesEastingField").parent().addClass("has-error");
                }
                else if (_.isNull(attributes.coordinates[0].coord.match(validWGS84_dez))) {
                    attributes.coordinates[0].ErrorMsg = "Die Eingabe für den " + attributes.coordinates[0].key + " ist nicht korrekt! (Beispiel: " + attributes.coordinates[0].example + ")";
                    $("#coordinatesEastingField + .text-danger").html("");
                    $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                    $("#coordinatesEastingField").parent().addClass("has-error");
                }
                else {
                    $("#coordinatesEastingField + .text-danger").html("");
                    $("#coordinatesEastingField").parent().removeClass("has-error");
                    Radio.trigger("Alert", "alert:remove");
                }
                if (_.isUndefined(attributes.coordinates[0].coord) || attributes.coordinates[1].coord.length < 1) {
                    attributes.coordinates[1].ErrorMsg = "Bitte geben Sie ihren " + attributes.coordinates[1].key + " ein";
                    $("#coordinatesNorthingField + .text-danger").html("");
                    $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                    $("#coordinatesNorthingField").parent().addClass("has-error");
                }
                else if (_.isNull(attributes.coordinates[1].coord.match(validWGS84_dez))) {
                    attributes.coordinates[1].ErrorMsg = "Die Eingabe für den " + attributes.coordinates[1].key + " ist nicht korrekt! (Beispiel: " + attributes.coordinates[1].example + ")";
                    $("#coordinatesNorthingField + .text-danger").html("");
                    $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                    $("#coordinatesNorthingField").parent().addClass("has-error");
                }
                else {
                    $("#coordinatesNorthingField + .text-danger").html("");
                    $("#coordinatesNorthingField").parent().removeClass("has-error");
                    Radio.trigger("Alert", "alert:remove");
                }
            }
            if (attributes.coordinates[0].ErrorMsg || attributes.coordinates[1].ErrorMsg) {
                return true;
            }
            return false;
        },
        setCoordSystem: function (value) {
            this.set("coordSystem", value);
        },
        setCoordinates: function (easting, northing) {
            var coordinateArray = [];

            if (this.get("coordSystem") === "WGS84") {

                this.set("eastingCoords", easting.split(/[\s°′″'"´`]+/));
                this.set("northingCoords", northing.split(/[\s°′″'"´`]+/));
                coordinateArray = [{"coord": easting, "key": "Wert der Länge", "example": "9° 59′ 50″"}, {"coord": northing, "key": "Wert der Breite", "example": "53° 33′ 25″"}];
            }
            else if (this.get("coordSystem") === "WGS84(Dezimalgrad)") {

                this.set("eastingCoords", easting.split(/[\s°]+/));
                this.set("northingCoords", northing.split(/[\s°]+/));
                coordinateArray = [{"coord": easting, "key": "Wert der Länge", "example": "10.01234°"}, {"coord": northing, "key": "Wert der Breite", "example": "53.55555°"}];
            }
            else {
                coordinateArray = [{"coord": easting, "key": "Rechtswert", "example": "564459.13"}, {"coord": northing, "key": "Hochwert", "example": "5935103.67"}];
            }
            this.setCoordinatesEasting(easting);
            this.setCoordinatesNorthing(northing);
            this.set("coordinates", coordinateArray);
            this.validateCoordinates();
        },
        validateCoordinates: function () {
            if (this.isValid()) {
                this.getNewCenter();
            }
        },
        getNewCenter: function () {
            var easting,
                northing;

            if (this.get("coordSystem") === "WGS84") {
                easting = Number(this.get("eastingCoords")[0]) +
                    (Number(this.get("eastingCoords")[1] ? this.get("eastingCoords")[1] : 0) / 60) +
                    (Number(this.get("eastingCoords")[2] ? this.get("eastingCoords")[2] : 0) / 60 / 60);
                northing = Number(this.get("northingCoords")[0]) +
                (Number(this.get("northingCoords")[1] ? this.get("northingCoords")[1] : 0) / 60) +
                (Number(this.get("northingCoords")[2] ? this.get("northingCoords")[2] : 0) / 60 / 60);

                this.set("newCenter", proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [easting, northing]));
            }
            else if (this.get("coordSystem") === "WGS84(Dezimalgrad)") {
                easting = parseFloat(this.get("eastingCoords")[0]);
                northing = parseFloat(this.get("northingCoords")[0]);

                this.set("newCenter", proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [easting, northing]));
            }
            else if (this.get("coordSystem") === "ETRS89") {
                easting = parseFloat(this.get("coordinates")[0].coord);
                northing = parseFloat(this.get("coordinates")[1].coord);

                this.set("newCenter", [easting, northing]);
            }
            Radio.trigger("MapMarker", "zoomTo", {type: "SearchByCoord", coordinate: this.get("newCenter")});
        },
        // setter for coordinatesEasting
        setCoordinatesEasting: function (value) {
            this.set("coordinatesEasting", value);
        },
        // setter for coordinatesNorthing
        setCoordinatesNorthing: function (value) {
            this.set("coordinatesNorthing", value);
        }
    });

    return SearchByCoord;
});
