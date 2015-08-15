define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/gfipopup/video/template.html",
    "modules/gfipopup/video/model",
    "eventbus",
    "modules/core/util"
], function ($, _, Backbone, VideoTemplate, VideoModel, EventBus, Util) {
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
            this.model.set('url', url);
            if (!Util.isAny()) {
                this.render();
            } else {
                this.$el.html('');
            }
        },
        /**
         *
         */
        render: function () {
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
