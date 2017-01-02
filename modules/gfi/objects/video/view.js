define([
    "backbone",
    "text!modules/gfi/objects/video/template.html",
    "modules/gfi/objects/video/model"
], function (Backbone, VideoTemplate, VideoModel) {
    "use strict";
    var VideoView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy"
        },
        /**
         * Video nur im Desktop-Modus
         */
        initialize: function (url) {
            this.model = new VideoModel();
            this.model.set("url", url);
            this.render();
        },
        /**
         *
         */
        render: function () {console.log("render");
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        /**
         * Removed das Video-Objekt vollständig.
         * Wird beim destroy des GFI für alle Child-Objekte aufgerufen.
         */
        destroy: function () {
            this.unbind();
            this.model.destroy();
        }
    });

    return VideoView;
});
