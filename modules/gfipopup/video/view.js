define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/gfipopup/video/template.html",
    "modules/gfipopup/video/model",
    "eventbus"
], function ($, _, Backbone, VideoTemplate, VideoModel, EventBus) {
    var VideoView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy"
        },

        initialize: function (url) {
            this.model = new VideoModel();
            this.model.set('url', url);
            this.render();
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
//            this.model.starteStreaming();
        },
        /**
         * Removed das Video-Objekt vollständig.
         * Wird beim destroy des GFI für alle Child-Objekte aufgerufen.
         */
        destroy: function () {
            this.unbind();
            this.model.destroy();
            Backbone.View.prototype.remove.call(this);
        }
    });

    return VideoView;
});
