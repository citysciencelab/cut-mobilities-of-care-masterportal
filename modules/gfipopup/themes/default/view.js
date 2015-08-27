define([
    "backbone",
    "text!modules/gfipopup/themes/default/template.html",
    "modules/gfipopup/themes/default/model"
], function (Backbone, GFIContentDefaultTemplate, GFIContentDefaultModel) {
    "use strict";
    var GFIContentDefaultView = Backbone.View.extend({
        template: _.template(GFIContentDefaultTemplate),
        events: {
            "remove": "destroy"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (layer, response) {
            this.model = new GFIContentDefaultModel(layer, response);
            this.render();
        },
        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();
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
            var children = this.model.get('children');
            _.each(children, function (element) {
                this.$el.append(element.val.$el);
            }, this);
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
            if (this.model.get('routable') !== null) {
                var rb = this.model.get('routable');
                this.$el.append(rb.$el);
            }
        }
    });

    return GFIContentDefaultView;
});
