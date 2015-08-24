define([
    "backbone",
    "text!modules/gfipopup/routable/template.html",
    "modules/gfipopup/routable/model",
    "eventbus"
], function (Backbone, VideoTemplate, RoutableModel, EventBus) {
    "use strict";
    var RoutableView = Backbone.View.extend({
        template: _.template(VideoTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "remove": "destroy",
            "click": "setZielpunkt"
        },

        initialize: function (coord) {
            this.model = new RoutableModel(coord);
            this.render();
        },
        /**
         * Fire Event zum setzen des Zielpunkts
         */
        setZielpunkt: function (evt) {
            this.model.setRoutingDestination();
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

    return RoutableView;
});
