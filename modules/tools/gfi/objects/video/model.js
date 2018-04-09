define(function (require) {
    var Backbone = require("backbone"),
        VideoJS = require("video"),
        VideoModel;

    // require("dashjs");
    require('videojs-flash');
    // require("videojs-contrib-dash");

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
            var a = VideoJS(this.getId(), {"techorder": ["flash"], "autoplay": true, "preload": "auto", "children": {"controlBar": false}}, callback);
            console.log(a);
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
