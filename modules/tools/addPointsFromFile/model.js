define(function (require) {

var AddPointFromFile;

AddPointFromFile = Backbone.Model.extend({
    url: "test",
    initialize: function () {

    },
    readFile: function (evt) {
        var val = $(evt.currentTarget).parent().find("input").val();

        if (val !== "") {
            this.url = function() {
                return val;
            };
            this.fetch({async: false});
            var rawPoints = this.get("points"),
                geojson = this.createGeoJson(rawPoints);

            Radio.trigger("AddGeoJSON", "addGeoJsonToMap", "PointsAddedFromFile", "111111111", geojson);
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
        return jsonObj
        // return JSON.stringify(jsonObj);
        }
    });
    return AddPointFromFile;
});
