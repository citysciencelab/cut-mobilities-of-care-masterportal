define([
    "backbone",
    "text!modules/tools/gfi/objects/video/template.html",
    "modules/tools/gfi/objects/video/model"
], function (Backbone, VideoTemplate, VideoModel) {
    "use strict";
    var VideoView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        events: {
            "remove": "destroy"
        },
        initialize: function (url) {
            this.model = new VideoModel(url);
            this.render();
        },
        render: function () {
            var channel = Radio.channel("GFI"),
                attr;

            this.listenTo(channel, {
                "afterRender": this.startStreaming
            }, this);

            attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        startStreaming: function () {
            this.model.startStreaming(this.test);
        },
        destroy: function () {
            this.unbind();
            this.model.destroy();
        },
        test:function () {
            console.log(this);
        }
    });

    return VideoView;
});
