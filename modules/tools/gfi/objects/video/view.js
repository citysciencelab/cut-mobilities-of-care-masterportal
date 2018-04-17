define([
    "backbone",
    "text!modules/tools/gfi/objects/video/template.html",
    "modules/tools/gfi/objects/video/model"
], function (Backbone, VideoTemplate, VideoModel) {
    "use strict";
    var VideoView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        initialize: function (url) {
            this.model = new VideoModel(url);
            this.listenTo(this.model, {
                "removeView": this.remove
            })
            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return VideoView;
});
