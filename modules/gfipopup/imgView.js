define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/gfipopup/imgTemplate.html",
    "modules/gfipopup/imgModel",
    "eventbus"
], function ($, _, Backbone, ImgTemplate, ImgModel, EventBus) {
    var ImgView = Backbone.View.extend({
        template: _.template(ImgTemplate),
        events: {
            "error": "test",
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (url) {
            this.model = new ImgModel();
            this.model.set('url', url);
            this.render();
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        destroy: function () {
            this.model.destroy();
        }

    });

    return ImgView;
});
