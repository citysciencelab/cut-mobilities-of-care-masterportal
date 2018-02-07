define([
    "backbone",
    "openlayers",
    "backbone.radio",
    "config"
], function(Backbone, ol, Radio, Config) {
    "use strict";
    var BackForwardModel = Backbone.Model.extend({
        defaults: {
            baselayer: "",
            newOvmView: "",
            update: true
        },
        // wird aufgerufen wenn das Model erstellt wird
        initialize: function() {

        },
        isUpdate: function() {
            return this.get("update");
        },
        setUpdate: function(bool) {
            this.set("update", bool);
        },
        pushState: function(view) {
            var state = {
                zoom: view.getZoom(),
                center: view.getCenter(),
                rotation: view.getRotation()
            };
            var hash = '#map=' +
                view.getZoom() + '/' +
                Math.round(state.center[0] * 100) / 100 + '/' +
                Math.round(state.center[1] * 100) / 100 + '/' +
                view.getRotation();
            window.history.pushState(state, 'map', hash);
        }
    });

    return BackForwardModel;
});
