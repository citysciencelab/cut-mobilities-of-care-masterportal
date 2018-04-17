define(function (require) {
    var Backbone = require("backbone"),
        VideoJS = require("videojs"),
        VideoModel;

    define("videojsflash", [VideoJS]);

    VideoModel = Backbone.Model.extend({
        defaults: {
            id: "",
            url: ""
        },

        initialize: function (url) {
            console.log(url);
            this.setId(_.uniqueId("video"));
            this.setUrl(url);
        },

        destroy: function () {
            this.unbind();
            this.clear({silent: true});
        },

        startStreaming: function (callback) {
            var videoEle = document.getElementById(this.getId());
debugger;
            VideoJS.options.flash.swf = "VideoJS.swf";
            var a = VideoJS(videoEle, {}, callback);
            console.log(a);
            a.play();
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
        }
    });
    return VideoModel;
});
