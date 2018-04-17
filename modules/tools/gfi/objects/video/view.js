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
            this.render();
        },
        render: function () {
            var channel = Radio.channel("GFI"),
                attr;

            this.listenTo(channel, {
                "afterRender": this.startStreaming,
                "isVisible": this.changedGFI
            }, this);

            attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        changedGFI: function (value) {
            if (value === false) {
                this.remove();
            }
        },
        startStreaming: function () {
            this.model.startStreaming();
        },
        remove: function () {
            this.model.destroy();
        }
    });

    return VideoView;
});
