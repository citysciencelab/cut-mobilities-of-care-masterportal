define(function (require) {

    var Backbone = require("backbone"),
        VideoTemplate = require("text!modules/tools/gfi/objects/video/template.html"),
        VideoModel = require("modules/tools/gfi/objects/video/model"),
        VideoView;

    VideoView = Backbone.View.extend({
        initialize: function (url, type, width, height) {
            this.model = new VideoModel(url, type, width, height);
            this.listenTo(this.model, {
                "removeView": this.remove
            });
            this.render();
        },
        template: _.template(VideoTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        }
    });

    return VideoView;
});
