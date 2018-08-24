define(function () {
    var TimesliderModel;

    LayersliderModel = Backbone.Model.extend({
        defaults: {
            layerIds: [],
            timeInterval: 2000,
            title: null,
            progressBarWidth: 10
        },

        initialize: function (layerIds, title, timeInterval) {
            if (!this.checkAllLayerOk(layerIds)) {
                console.error("Konfiguration des layersliders fehlerhaft");
                return;
            }
            this.setLayerIds(layerIds);
            if (!_.isUndefined(title)) {
                this.setTitle(title);
            }
            if (!_.isUndefined(timeInterval)) {
                this.setTimeInterval(timeInterval);
            }
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
            // Mindestbreite der ProgressBar ist 10%.
            if (layerIds.length >= 10) {
                this.setProgressBarWidth(layerIds.length);
            }
        },
        setStatus: function (args) {
            if (args[2].get("id") === "layerslider" && args[0] === true) {
                this.setIsCollapsed(args[1]);
                this.setIsCurrentWin(args[0]);
            }
            else {
                this.setIsCurrentWin(false);
            }
        },

        /**
         * Prüft, ob alle Layer, die der Layerslider nutzen soll, auch definiert sind und ein title Attribut haben
         * @param   {object[]}  layerIds Konfiguration der Layer aus config.json
         * @returns {boolean}   True wenn alle Layer gefunden wurden
         */
        checkAllLayerOk: function (layerIds) {
            var allOk = true;

            _.each(layerIds, function (layer) {
                if (_.isUndefined(Radio.request("ModelList", "getModelByAttributes", {id: layer.layerId})) || _.isUndefined(layer.title)) {
                    allOk = false;
                }
            });

            return allOk;
        },

        /**
         * setter for isCollapsed
         * @param {boolean} value isCollapsed
         * @returns {void}
         */
        setIsCollapsed: function (value) {
            this.set("isCollapsed", value);
        },

        /**
         * setter for isCurrentWin
         * @param {boolean} value isCurrentWin
         * @returns {void}
         */
        setIsCurrentWin: function (value) {
            this.set("isCurrentWin", value);
        },

        /*
        * setter for layerIds
        * @param {object[]} value layerIds
        * @returns {void}
        */
        setLayerIds: function (value) {
            this.set("layerIds", value);
        },

        /*
        * setter for title
        * @param {string} value title
        * @returns {void}
        */
        setTitle: function (value) {
            this.set("title", value);
        },

        /*
        * setter for timeInterval
        * @param {integer} value timeInterval
        * @returns {void}
        */
        setTimeInterval: function (value) {
            this.set("timeInterval", value);
        },

        /*
        * setter for progressBarWidth
        * @param {integer} value progressBarWidth
        * @returns {void}
        */
        setProgressBarWidth: function (value) {
            this.set("progressBarWidth", value);
        }
    });

    return LayersliderModel;
});
