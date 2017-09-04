define([
    "backbone",
    "text!modules/tools/gfi/objects/image/template.html",
    "modules/tools/gfi/objects/image/model"
], function (Backbone, ImgTemplate, ImgModel) {
    "use strict";
    var ImgView = Backbone.View.extend({
        template: _.template(ImgTemplate),

        initialize: function (url, copyright) {
            this.model = new ImgModel();
            this.model.set("url", url);
            this.model.set("copyright", copyright);
            this.render();
            this.listenTo(this.model, "change:reloadVersuch", this.checkReloadVersuch);
            this.model.set("zufallszahl", Math.floor(Math.random() * (20000 - 0 + 1)) + 0);
            this.model.checkImage();
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },

        checkReloadVersuch: function () {
            if (this.model.get("reloadVersuch") > this.model.get("reloadMaxVersuche")) {
                this.remove();
            }
        }
    });

    return ImgView;
});
