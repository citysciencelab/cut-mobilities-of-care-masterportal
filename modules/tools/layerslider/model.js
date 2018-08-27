define(function () {
    var LayersliderModel;

    LayersliderModel = Backbone.Model.extend({
        defaults: {
            layerIds: [],
            timeInterval: 2000,
            title: null,
            progressBarWidth: 10,
            activeLayer: {layerId: ""},
            windowsInterval: null
        },

        initialize: function (layerIds, title, timeInterval) {
            if (!this.checkAllLayerOk(layerIds)) {
                console.error("Konfiguration des layersliders fehlerhaft");
                return;
            }
            this.setLayerIds(layerIds);
            this.setProgressBarWidth(layerIds);
            if (!_.isUndefined(title)) {
                this.setTitle(title);
            }
            if (!_.isUndefined(timeInterval)) {
                this.setTimeInterval(timeInterval);
            }
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
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

        reset: function () {
            this.stopInterval();
            this.set("activeLayer", {layerId: ""});
            this.set("title", null);
        },

        /**
         * Ermittelt die Sichtbarkeit der layerIds
         * @param   {string} activeLayerId id des activeLayer
         * @returns {void}
         */
        toggleLayerVisibility: function (activeLayerId) {
            _.each(this.get("layerIds"), function (layer) {
                this.sendModification(layer.layerId, layer.layerId === activeLayerId ? true : false);
            }, this)
        },

        /**
         * Triggert übers Radio die neue Sichtbarkeit
         * @param   {string}    layerId layerId
         * @param   {boolean}   status  Sichtbarkeit true / false
         * @returns {void}
         */
        sendModification: function (layerId, status) {
            Radio.trigger("ModelList", "setModelAttributesById", layerId, {
                isSelected: status,
                isVisibleInMap: status
            });
        },

        /**
         * Ermittelt die Prozentzahl des index im Array
         * @returns {integer}   0-100
         */
        getFinished: function () {
            if (!_.isUndefined(this.getActiveIndex())) {
                var index = this.getActiveIndex() + 1,
                    max = this.get("layerIds").length;
                    
                return Math.round(index * 100 / max);
            }
            else {
                return 0;
            }
        },

        /**
         * Findet den index im layerIds-Array zur activeLayerId oder liefert -1
         * @returns {integer}   index im Array mit activeLayerId
         */
        getActiveIndex: function () {
            return _.findIndex(this.get("layerIds"), function (layer) {
                return layer.layerId === this.get("activeLayer").layerId;
            }, this);
        },

        /**
         * Findet die activeLayerId anhand des index und initiiert Speicherung
         * @param {integer} index index in layerIds
         * @returns {void}
         */
        setActiveIndex: function (index) {
            this.setActiveLayer(this.get("layerIds")[index]);
            this.toggleLayerVisibility(this.get("activeLayer").layerId);
        },

        /**
         * Setter des Windows Intervals. Bindet an this.
         * @param {function} func                Funktion, die in this ausgeführt werden soll
         * @param {integer}  autorefreshInterval Intervall in ms
         * @returns {void}
         */
        setWindowsInterval: function (func, autorefreshInterval) {
            this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
        },

        /**
         * Startet das windows-Interval einmalig.
         * @returns {void}
         */
        startInterval: function () {
            var windowsInterval = this.get("windowsInterval"),
                timeInterval = this.get("timeInterval");

            if (_.isNull(windowsInterval)) {
                this.forwardLayer();
                this.setWindowsInterval(this.forwardLayer, timeInterval);
            }
        },

        /**
         * Stoppt das windows-Interval
         * @returns {void}
         */
        stopInterval: function () {
            var windowsInterval = this.get("windowsInterval");

            if (!_.isUndefined(windowsInterval)) {
                clearInterval(windowsInterval);
                this.set("windowsInterval", null);
            }
        },

        /**
         * Findet den vorherigen index im Array in einer Schleife.
         * @returns {void}
         */
        backwardLayer: function () {
            var index = this.getActiveIndex(),
                max = this.get("layerIds").length - 1;

            if (index > 0) {
                this.setActiveIndex(index - 1);
            }
            else {
                this.setActiveIndex(max);
            }
        },

        /**
         * Findet den nächsten index im Array in einer Schleife.
         * @returns {void}
         */
        forwardLayer: function () {
            var index = this.getActiveIndex(),
                max = this.get("layerIds").length - 1;

            if (index > -1 && index < max) {
                this.setActiveIndex(index + 1);
            }
            else {
                this.setActiveIndex(0);
            }
        },

        /**
         * Setter des Windows Intervals. Bindet an this.
         * @param {function} func                Funktion, die in this ausgeführt werden soll
         * @param {integer}  autorefreshInterval Intervall in ms
         * @returns {void}
         */
        setWindowsInterval: function (func, autorefreshInterval) {
            this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
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
        * @param {object[]} layerIds layerIds zum Ermitteln der width
        * @returns {void}
        */
        setProgressBarWidth: function (layerIds) {
            // Mindestbreite der ProgressBar ist 10%.
            if (layerIds.length <= 10) {
                this.set("progressBarWidth", Math.round(100 / layerIds.length));
            }
        },

        /*
        * setter for activeLayerId
        * @param {object} value activeLayer
        * @returns {void}
        */
        setActiveLayer: function (value) {
            this.set("activeLayer", value);
        }
    });

    return LayersliderModel;
});
