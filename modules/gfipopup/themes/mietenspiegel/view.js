define([
    "backbone",
    "text!modules/gfipopup/themes/mietenspiegel/template.html",
    //"modules/gfipopup/themes/mietenspiegel/model",
    "eventbus"
], function (Backbone, GFITemplate, EventBus) {
    "use strict";
    var GFIContentMietenspiegelView = Backbone.View.extend({
        /*
         + Die Mietenspiegel-View öffnet sich auf jede GFI-Abfrage. Sein Model hingegen bleibt konstant.
         */
        //model: GFIModel,
        template: _.template(GFITemplate),
        events: {
            "remove": "destroy"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (layer, response) {
            if (this.model.get('readyState') === true) {
                this.model.reset (layer, response);
                this.render();
            }
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        /**
         *
         */
        destroy: function () {
        },
    });

    return GFIContentMietenspiegelView;
});
