define([
    "backbone",
    "text!modules/gfipopup/templates/default/template.html",
    "modules/gfipopup/templates/default/model",
    "eventbus"
], function (Backbone, GFIContentDefaultTemplate, GFIContentDefaultModel, EventBus) {
    "use strict";
    var GFIContentDefaultView = Backbone.View.extend({
        model: GFIContentDefaultModel,
        template: _.template(GFIContentDefaultTemplate),
        events: {
            "remove": "destroy"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function (layerresponse) {
            this.model.set('gfiContent', layerresponse);
            this.model.replaceValuesWithChildObjects();
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
            this.model.removeChildObjects();
        },
        /**
         * Alle Children des gfiContent werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var gfiContent = this.model.get('gfiContent'),
                children;
            if (_.has(gfiContent, 'children')) {
                children = _.values(_.pick(gfiContent, 'children'))[0];
                _.each(children, function (element) {
                    this.$el.append(element.val.$el);
                }, this);
            }
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
//            if (this.model.get('gfiRoutables') && this.model.get('gfiRoutables').length > 0) {
//                var rb = this.model.get('gfiRoutables')[this.model.get('gfiRoutables').length - this.model.get('gfiCounter')];
//                if (rb) {
//                    $('.gfi-content').append(rb.$el);
//                }
//            }
        }
    });

    return GFIContentDefaultView;
});
