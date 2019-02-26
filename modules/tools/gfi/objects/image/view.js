import ImgTemplate from "text-loader!./template.html";
import ImgModel from "./model";

const ImgView = Backbone.View.extend({
    initialize: function (url, copyright) {
        this.model = new ImgModel();
        this.model.set("url", url);
        this.model.set("copyright", copyright);
        this.render();
        this.listenTo(this.model, "change:reloadVersuch", this.checkReloadVersuch);
        this.model.set("zufallszahl", Math.floor(Math.random() * (20000 - 0 + 1)) + 0);
        this.model.checkImage();
    },
    template: _.template(ImgTemplate),

    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    checkReloadVersuch: function () {
        if (this.model.get("reloadVersuch") > this.model.get("reloadMaxVersuche")) {
            this.remove();
        }
    }
});

export default ImgView;
