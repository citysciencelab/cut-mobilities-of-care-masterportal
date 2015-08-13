define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/gfipopup/routing/template.html",
    "modules/gfipopup/routing/model",
    "eventbus"
], function ($, _, Backbone, VideoTemplate, RoutingModel, EventBus) {
    var RoutingView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy"
        },

        initialize: function (ueberschrift, buttontext, route) {
            this.model = new RoutingModel();
            this.model.set('ueberschrift', ueberschrift);
            this.model.set('buttontext', buttontext);
            this.model.set('route', route);
            this.render();
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        /**
         * Removed das Routing-Objekt vollständig.
         * Wird beim destroy des GFI für alle Child-Objekte aufgerufen.
         */
        destroy: function () {
            this.unbind();
            this.model.destroy();
            Backbone.View.prototype.remove.call(this);
        }
    });

    return RoutingView;
});
