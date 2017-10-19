define(function (require) {

var AddPointFromFile;

AddPointFromFile = Backbone.Model.extend({
    url: "",
    initialize: function () {

    },
    readFile: function (evt) {
        var val = $(evt.currentTarget).parent().find("#path").val().trim(),
            layername = $(evt.currentTarget).parent().find("#layername").val().trim(),
            layerid = _.uniqueId(layername);

        if (val !== "" && layername !== "") {
            this.url = function () {
                return val;
            };
            this.fetch({async: false});
            var rawPoints = this.get("points"),
                geojson = this.createGeoJson(rawPoints);

            Radio.trigger("AddGeoJSON", "addGeoJsonToMap", layername, layerid, geojson);
        }
        else {
           Radio.trigger("Alert", "alert", {
            text: "<strong>Fehler!</strong><br>Pfad und Layername müssen gesetzt werden.",
            kategorie: "alert-warning" });
        }
    },
    createGeoJson: function (rawPoints) {
        var jsonObj = {
                name: "PointData",
                type: "FeatureCollection",
                features: []
            };

        _.each(rawPoints, function (rawPoint, index) {
            var featureObj = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [parseFloat(rawPoint.laenge, 10), parseFloat(rawPoint.breite, 10)]
                },
                properties: {
                    id: index,
                    type: "point",
                    laengengrad: rawPoint.laenge,
                    breitengrad: rawPoint.breite
                }
            };

            jsonObj.features.push(featureObj);
        });
        return jsonObj;
        }
    });
    return AddPointFromFile;
});
