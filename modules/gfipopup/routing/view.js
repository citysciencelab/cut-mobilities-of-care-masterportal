define([
    "backbone",
    "text!modules/gfipopup/routing/template.html",
    "modules/gfipopup/routing/model",
    "eventbus"
], function (Backbone, VideoTemplate, RoutingModel, EventBus) {
    "use strict";
    var RoutingView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy",
            "click": "startShowingRoute"
        },

        initialize: function (ueberschrift, buttontext, route) {
            this.model = new RoutingModel();
            this.model.set('ueberschrift', ueberschrift);
            this.model.set('buttontext', buttontext);
            this.model.set('route', route);
            this.render();
        },

        startShowingRoute: function (evt) {
            // lösche alte Route
            this.model.clearRoute();
            var gesuchteRoute = evt.currentTarget.value;
            this.model.showRoute(gesuchteRoute);
            EventBus.trigger("showGFIParams");
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
        }
    });

    return RoutingView;
});
