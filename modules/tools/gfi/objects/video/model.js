define(function (require) {

    /*
    Disable Google Analytics that tracks a random percentage (currently 1%) of players loaded from the CDN.
    @link https://videojs.com/getting-started/
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
            poster: ""
        },

        initialize: function (url) {
            var portalConfig = Radio.request("Parser", "getPortalConfig");

            if (_.has(portalConfig, "portalTitle") && _.has(portalConfig.portalTitle, "logo")) {
                this.setPoster(portalConfig.portalTitle.logo);
            }

            this.setId(_.uniqueId("video"));
            this.setUrl(url);

        },

        destroy: function () {
            var videoEle = document.getElementById(this.getId());

            VideoJS(videoEle).dispose();
            this.unbind();
            this.clear({silent: true});
        },

        startStreaming: function (callback) {
            var videoEle = document.getElementById(this.getId());

            VideoJS.options.flash.swf = "../../node_modules/videojs-swf/dist/video-js.swf";
            VideoJS(videoEle, {"autoplay": true, "preload": "auto", "controls": false}, callback);
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
        }
    });
    return VideoModel;
});
