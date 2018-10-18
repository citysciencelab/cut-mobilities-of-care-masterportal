import VideoTemplate from "text-loader!./template.html";
import VideoModel from "./model";

const VideoView = Backbone.View.extend({
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

export default VideoView;
