define([
    "backbone",
    "text!modules/gfipopup/themes/trinkwasser/template.html",
    "modules/gfipopup/themes/trinkwasser/model"
], function (Backbone, GFIContentTrinkwasserTemplate, GFIContentTrinkwasserModel) {
    "use strict";
    var GFIContentTrinkwasserView = Backbone.View.extend({
        template: _.template(GFIContentTrinkwasserTemplate),
        events: {
            "remove": "destroy"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (layer, content, position) {
            this.model = new GFIContentTrinkwasserModel(layer, content, position);

            this.render();
        },
        /**
         *
         */
        render: function () {

            var attr = this.model.toJSON();

            this.el.className += "popover-trinkwasser";

            this.$el.html(this.template(attr));
            this.appendChildren();
            this.appendRoutableButton();
        },
        /**
         *
         */
        destroy: function () {
            this.unbind();
            this.model.destroy();
        },
        /**
         * Alle Children werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var children = this.model.get("children");

            _.each(children, function (element) {
                this.$el.append(element.val.$el);
            }, this);
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
            if (this.model.get("routable") !== null) {
                var rb = this.model.get("routable");

                this.$el.append(rb.$el);
            }
        }
    });

    return GFIContentTrinkwasserView;
});
