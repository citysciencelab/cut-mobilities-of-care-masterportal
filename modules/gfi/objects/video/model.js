define([
    "backbone",
    "config",
    "videojs"
], function (Backbone, Config, VideoJS) {

    var VideoModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            id: "",
            url: "",
            video: "",
            reloadVersuch: 0
        },
        /**
         *
         */
        initialize: function () {
            this.set("id", _.uniqueId("video"));
            this.starteStreamingCounter();
        },
        destroy: function () {
            this.unbind();
            this.clear({silent: true});
        },
        /**
         *
         */
        starteStreamingCounter: function () {
            this.set("checkInterval", setInterval(function () {
                if (this.get("reloadVersuch") < 10) {
                    if (document.getElementById(this.get("id"))) {
                        /**
                         * Diese Funktion startet das Video unter der id
                         */
                        VideoJS(document.getElementById(this.get("id")), {"autoplay": true, "preload": "auto", "children": {"controlBar": false}}, function () {
                        });
                        window.clearInterval(this.get("checkInterval"));
                    }
                }
                else {
                    window.clearInterval(this.get("checkInterval"));
                }
                this.set("reloadVersuch", this.get("reloadVersuch") + 1);
            }.bind(this), 500));
        }
    });
    return VideoModel;
});
