define(function (require) {
    var Backbone = require("backbone"),
        VideoJS = require("videojs"),
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
            poster: ""
        },

        initialize: function (url) {
            var portalConfig = Radio.request("Parser", "getPortalConfig");

            this.listenTo(Radio.channel("GFI"), {
                "afterRender": this.startStreaming,
                "isVisible": this.changedGFI
            }, this);

            if (_.has(portalConfig, "portalTitle") && _.has(portalConfig.portalTitle, "logo")) {
                this.setPoster(portalConfig.portalTitle.logo);
            }
            this.setId(_.uniqueId("video"));
            this.setUrl(url);
        },

        /**
         * Startet das Streaming
         * @param  {Function} callback Callback-Funktion wird gerufen, nachdem das Video gestaret ist
         * @returns {void}
         */
        startStreaming: function (callback) {
            var videoEle = document.getElementById(this.get("id"));

            VideoJS(videoEle, {"autoplay": true, "preload": "auto", "controls": false}, callback);
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
         * stop VideoJS
         * remove Radio-Listener
         * remove Backbone-Listener
         * clear Attributes
         * remove View
         * @returns {void}
         */
        destroy: function () {
            var videoEle = document.getElementById(this.get("id"));

            VideoJS(videoEle).dispose();
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
        }
    });
    return VideoModel;
});
