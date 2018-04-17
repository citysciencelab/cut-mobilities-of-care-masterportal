define(function (require) {

    /**
     * Disable Google Analytics that tracks a random percentage (currently 1%) of players loaded from the CDN.
     * @link https://videojs.com/getting-started/
     */
    window.HELP_IMPROVE_VIDEOJS = false;

    var Backbone = require("backbone"),
        VideoJS = require("videojs"),
        VideoModel;

    require("videojsflash");

    VideoModel = Backbone.Model.extend({
        defaults: {
            id: "",
            url: "",
            poster: "",
            channel: Radio.channel("GFI")
        },

        initialize: function (url) {
            var portalConfig = Radio.request("Parser", "getPortalConfig");

            this.listenTo(this.getChannel(), {
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
         * Zerstört das Model, das Radio und triggert remove der View
         */
        destroy: function () {
            var videoEle = document.getElementById(this.getId()),
                channel = this.getChannel();

            VideoJS(videoEle).dispose();
            channel.off();
            this.clear({silent: true});
            this.trigger("removeView");
        },

        /**
         * Startet das Streaming
         * @param  {Function} callback Callback-Funktion wird gerufen, nachdem das Video gestaret ist
         */
        startStreaming: function (callback) {
            var videoEle = document.getElementById(this.getId());

            VideoJS.options.flash.swf = "../../node_modules/videojs-swf/dist/video-js.swf";
            VideoJS(videoEle, {"autoplay": true, "preload": "auto", "controls": false}, callback);
        },

        /**
         * Prüft, ob das GFI ausgeschaltet wurde
         * @param  {boolean} value Visibility des GFI
         */
        changedGFI: function (value) {
            if (value === false) {
                this.destroy();
            }
        },

        // getter for id
        getId: function () {
            return this.get("id");
        },
        // setter for id
        setId: function (value) {
            this.set("id", value);
        },

        // getter for url
        getUrl: function () {
            return this.get("url");
        },
        // setter for url
        setUrl: function (value) {
            this.set("url", value);
        },

        // getter for poster
        getPoster: function () {
            return this.get("poster");
        },
        // setter for poster
        setPoster: function (value) {
            this.set("poster", value);
        },

        // getter for channel
        getChannel: function () {
            return this.get("channel");
        },
        // setter for channel
        setChannel: function (value) {
            this.set("channel", value);
        }
    });
    return VideoModel;
});
