define(function (require) {
    var videojs = require("videojs"),
        VideoModel;

    /**
     * Disable Google Analytics that tracks a random percentage (currently 1%) of players loaded from the CDN.
     * @link https://videojs.com/getting-started/
     */
    window.HELP_IMPROVE_VIDEOJS = false;
    require("videojsflash");

    VideoModel = Backbone.Model.extend({
        defaults: {
            id: "",
            url: "",
            type: "",
            poster: "",
            width: "400px",
            height: "300px"
        },

        initialize: function (url, type, width, height) {
            var portalConfig = Radio.request("Parser", "getPortalConfig");

            this.setId(_.uniqueId("video"));
            this.setUrl(url);
            this.setType(type);
            this.setWidth(width);
            this.setHeight(height);
            
            this.listenTo(Radio.channel("GFI"), {
                "afterRender": this.startStreaming,
                "isVisible": this.changedGFI
            }, this);

            if (_.has(portalConfig, "portalTitle") && _.has(portalConfig.portalTitle, "logo")) {
                this.setPoster(portalConfig.portalTitle.logo);
            }
        },

        /**
         * Startet das Streaming
         * @param  {Function} callback Callback-Funktion wird gerufen, nachdem das Video gestaret ist
         * @returns {void}
         */
        startStreaming: function (callback) {
            var videoEle = document.getElementById(this.get("id"));
            
            videojs(videoEle, {"autoplay": true, "preload": "auto", "controls": false}, callback);
        },

        /**
         * Prüft, ob das GFI ausgeschaltet wurde
         * @param  {boolean} value Visibility des GFI
         * @returns {void}
         */
        changedGFI: function (value) {
            if (value === false) {
                this.destroy();
            }
        },

        /**
         * Zerstört das Modul vollständig
         * stop videojs
         * remove Radio-Listener
         * remove Backbone-Listener
         * clear Attributes
         * remove View
         * @returns {void}
         */
        destroy: function () {
            var videoEle = document.getElementById(this.get("id"));

            videojs(videoEle).dispose();
            this.stopListening();
            this.off();
            this.clear();
            this.trigger("removeView");
        },

        // setter for id
        setId: function (value) {
            this.set("id", value);
        },

        // setter for url
        setUrl: function (value) {
            this.set("url", value);
        },

        // setter for poster
        setPoster: function (value) {
            this.set("poster", value);
        },

        // getter for type
        getType: function () {
            return this.get("type");
        },
        // setter for type
        setType: function (value) {
            this.set("type", value);
        },

        // getter for width
        getWidth: function () {
            return this.get("width");
        },
        // setter for width
        setWidth: function (value) {
            this.set("width", value);
        },

        // getter for height
        getHeight: function () {
            return this.get("height");
        },
        // setter for height
        setHeight: function (value) {
            this.set("height", value);
        }
    });
    return VideoModel;
});
