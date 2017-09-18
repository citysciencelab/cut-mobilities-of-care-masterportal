define("geoapi", [
    "backbone"
], function (Backbone) {

    var GeoAPI = parent.GeoAPI = _.extend({}, Backbone.Events);

    /**
     * [on description]
     * @param  {[type]} "addFeatures" [description]
     * @param  {[type]} function      (name,        features [description]
     * @return {[type]}               [description]
     */
    GeoAPI.on("addFeatures", function (name, features) {
        EventBus.trigger("addFeatures", name, features);
    });

    /**
     * [on description]
     * @param  {[type]} "removeFeatures" [description]
     * @param  {[type]} function         (name         [description]
     * @return {[type]}                  [description]
     */
    GeoAPI.on("removeFeatures", function (name) {
        EventBus.trigger("removeFeatures", name);
    });

    /**
     * [on description]
     * @param  {[type]} "getDrawendCoords" [description]
     * @param  {[type]} function           (coordinates  [description]
     * @return {[type]}                    [description]
     */
    EventBus.on("getDrawendCoords", function (coordinates) {
        GeoAPI.trigger("getDrawendCoords", coordinates);
    });

    return GeoAPI;
});
